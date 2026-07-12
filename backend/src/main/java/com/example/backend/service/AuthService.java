package com.example.backend.service;

import com.example.backend.dto.admin.AdminResponse;
import com.example.backend.dto.auth.*;
import com.example.backend.dto.client.ClientRequest;
import com.example.backend.dto.client.ClientResponse;
import com.example.backend.dto.driver.DriverRequest;
import com.example.backend.dto.driver.DriverResponse;
import com.example.backend.model.Enterprise;
import com.example.backend.model.IndividualClient;
import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.Client;
import com.example.backend.model.enums.ClientType;
import com.example.backend.repository.AdminRepository;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.DriverRepository;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.security.JwtService;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final ClientRepository clientRepository;
    private final AdminRepository adminRepository;
    private final DriverRepository driverRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final AdminService adminService;
    private final ClientService clientService;
    private final DriverService driverService;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();
        if (role != null && role.startsWith("ROLE_")) {
            role = role.substring(5);
        }
        return AuthResponse.builder()
                .token(token)
                .email(request.getEmail())
                .role(role)
                .build();
    }

    public AuthResponse register(RegisterRequest request) {
        if (clientRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        String accountType = request.getAccountType() == null ? "INDIVIDUAL" : request.getAccountType().trim().toUpperCase();
        if ("ENTERPRISE".equals(accountType)) {
            Enterprise enterprise = new Enterprise();
            enterprise.setName(request.getName());
            enterprise.setEmail(request.getEmail());
            enterprise.setPassword(passwordEncoder.encode(request.getPassword()));
            enterprise.setPhone(request.getPhone());
            enterprise.setTown(request.getTown());
            enterprise.setQuarter(request.getQuarter());
            enterprise.setProfilePicture(request.getProfilePicture());
            enterprise.setType(ClientType.CLASSIC);
            enterprise.setStatus("ACTIVE");
            enterprise.setCreatedAt(LocalDateTime.now());
            clientRepository.save(enterprise);
        } else {
            IndividualClient client = new IndividualClient();
            client.setFirstName(request.getFirstName());
            client.setLastName(request.getLastName());
            client.setEmail(request.getEmail());
            client.setPassword(passwordEncoder.encode(request.getPassword()));
            client.setPhone(request.getPhone());
            client.setTown(request.getTown());
            client.setQuarter(request.getQuarter());
            client.setProfilePicture(request.getProfilePicture());
            client.setType(ClientType.CLASSIC);
            client.setStatus("ACTIVE");
            client.setCreatedAt(LocalDateTime.now());
            clientRepository.save(client);
        }

        var userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String token = jwtService.generateToken(userDetails);
        return AuthResponse.builder()
                .token(token)
                .email(request.getEmail())
                .role("CLIENT")
                .build();
    }

    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail();
        // Check if user exists (any type)
        boolean exists = clientRepository.findByEmail(email).isPresent();
        if (!exists) {
            // Silently return to avoid user enumeration
            return;
        }
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiresAt(LocalDateTime.now().plusHours(1))
                .used(false)
                .build();
        resetTokenRepository.save(resetToken);
        // In production: send email with reset link containing the token
        // For now, log it (configure spring.mail.* to enable real email sending)
        log.info("Password reset token for {}: {}", email, token);
    }

    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Token has expired or already been used");
        }

        String email = resetToken.getEmail();
        var clientOpt = clientRepository.findByEmail(email);
        if (clientOpt.isPresent()) {
            var client = clientOpt.get();
            client.setPassword(passwordEncoder.encode(request.getNewPassword()));
            clientRepository.save(client);
        }

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);
    }

    public ProfileResponse getCurrentProfile() {
        String email = getAuthenticatedEmail();
        String userRole = getAuthenticatedRole();

        if (isAdminRole(userRole)) {
            return fromAdmin(adminService.getByEmail(email), userRole);
        }
        if ("CLIENT".equals(userRole)) {
            return fromClient(clientService.getByEmail(email), userRole);
        }
        if ("DRIVER".equals(userRole)) {
            return fromDriver(driverService.getByEmail(email), userRole);
        }

        throw new IllegalArgumentException("Profile not found");
    }

    public ProfileResponse updateCurrentProfile(ProfileUpdateRequest request) {
        String email = getAuthenticatedEmail();
        String userRole = getAuthenticatedRole();

        if (isAdminRole(userRole)) {
            throw new IllegalArgumentException("Admins cannot update profiles through this endpoint");
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            ensureEmailAvailable(request.getEmail(), email);
        }

        if ("CLIENT".equals(userRole)) {
            ClientResponse current = clientService.getByEmail(email);
            ClientRequest clientRequest = toClientRequest(current, request);
            return fromClient(clientService.update(current.getId(), clientRequest), userRole);
        }
        if ("DRIVER".equals(userRole)) {
            DriverResponse current = driverService.getByEmail(email);
            DriverRequest driverRequest = toDriverRequest(current, request);
            return fromDriver(driverService.update(current.getId(), driverRequest), userRole);
        }

        throw new IllegalArgumentException("Profile not found");
    }

    private String getAuthenticatedEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private String getAuthenticatedRole() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Profile not found"));
    }

    private boolean isAdminRole(String role) {
        return "ADMIN".equals(role) || "SUPER_ADMIN".equals(role);
    }

    private void ensureEmailAvailable(String newEmail, String currentEmail) {
        if (newEmail.equals(currentEmail)) {
            return;
        }
        if (adminRepository.findByEmail(newEmail).isPresent()
                || clientRepository.findByEmail(newEmail).isPresent()
                || driverRepository.findByEmail(newEmail).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
    }

    private ClientRequest toClientRequest(ClientResponse current, ProfileUpdateRequest request) {
        ClientRequest clientRequest = new ClientRequest();
        clientRequest.setEmail(request.getEmail() != null ? request.getEmail() : current.getEmail());
        clientRequest.setPhone(request.getPhone() != null ? request.getPhone() : current.getPhone());
        clientRequest.setTown(request.getTown() != null ? request.getTown() : current.getTown());
        clientRequest.setQuarter(request.getQuarter() != null ? request.getQuarter() : current.getQuarter());
        clientRequest.setType(current.getType());
        if (request.getProfilePicture() != null) {
            clientRequest.setProfilePicture(request.getProfilePicture());
        }

        if (current.getSurname() != null) {
            clientRequest.setFirstName(request.getFirstName() != null ? request.getFirstName() : current.getName());
            clientRequest.setLastName(request.getLastName() != null ? request.getLastName() : current.getSurname());
        } else {
            clientRequest.setName(request.getName() != null ? request.getName() : current.getName());
        }

        return clientRequest;
    }

    private DriverRequest toDriverRequest(DriverResponse current, ProfileUpdateRequest request) {
        DriverRequest driverRequest = new DriverRequest();
        driverRequest.setFirstName(request.getFirstName() != null ? request.getFirstName() : current.getFirstName());
        driverRequest.setLastName(request.getLastName() != null ? request.getLastName() : current.getLastName());
        driverRequest.setEmail(request.getEmail() != null ? request.getEmail() : current.getEmail());
        driverRequest.setPhone(request.getPhone() != null ? request.getPhone() : current.getPhone());
        driverRequest.setTown(request.getTown() != null ? request.getTown() : current.getTown());
        driverRequest.setQuarter(request.getQuarter() != null ? request.getQuarter() : current.getQuarter());
        driverRequest.setSite(request.getSite() != null ? request.getSite() : current.getSite());
        if (request.getProfilePicture() != null) {
            driverRequest.setProfilePicture(request.getProfilePicture());
        }
        return driverRequest;
    }

    private ProfileResponse fromAdmin(AdminResponse admin, String userRole) {
        return ProfileResponse.builder()
                .id(admin.getId())
                .userRole(userRole)
                .firstName(admin.getFirstName())
                .lastName(admin.getLastName())
                .email(admin.getEmail())
                .phone(admin.getPhone())
                .site(admin.getSite())
                .profilePicture(admin.getProfilePicture())
                .role(admin.getRole())
                .build();
    }

    private ProfileResponse fromClient(ClientResponse client, String userRole) {
        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .id(client.getId())
                .userRole(userRole)
                .email(client.getEmail())
                .phone(client.getPhone())
                .town(client.getTown())
                .quarter(client.getQuarter())
                .profilePicture(client.getProfilePicture())
                .type(client.getType());

        if (client.getSurname() != null) {
            builder.accountType("INDIVIDUAL")
                    .firstName(client.getName())
                    .lastName(client.getSurname());
        } else {
            builder.accountType("ENTERPRISE")
                    .name(client.getName());
        }

        return builder.build();
    }

    private ProfileResponse fromDriver(DriverResponse driver, String userRole) {
        return ProfileResponse.builder()
                .id(driver.getId())
                .userRole(userRole)
                .firstName(driver.getFirstName())
                .lastName(driver.getLastName())
                .email(driver.getEmail())
                .phone(driver.getPhone())
                .town(driver.getTown())
                .quarter(driver.getQuarter())
                .site(driver.getSite())
                .profilePicture(driver.getProfilePicture())
                .build();
    }
}
