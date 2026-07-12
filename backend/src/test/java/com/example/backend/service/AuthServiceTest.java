package com.example.backend.service;

import com.example.backend.dto.auth.AuthResponse;
import com.example.backend.dto.auth.RegisterRequest;
import com.example.backend.model.Client;
import com.example.backend.model.Enterprise;
import com.example.backend.model.enums.ClientType;
import com.example.backend.repository.ClientRepository;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.security.JwtService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private PasswordResetTokenRepository resetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerEnterprise_shouldCreateEnterpriseClientWithClassicType() {
        RegisterRequest request = new RegisterRequest();
        request.setAccountType("ENTERPRISE");
        request.setName("Acme SAS");
        request.setEmail("contact@acme.com");
        request.setPassword("secret123");
        request.setPhone("775000000");
        request.setTown("Dakar");
        request.setQuarter("Plateau");

        when(clientRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encoded-password");
        when(userDetailsService.loadUserByUsername("contact@acme.com"))
                .thenReturn(new org.springframework.security.core.userdetails.User(
                        "contact@acme.com",
                        "encoded-password",
                        List.of(new SimpleGrantedAuthority("ROLE_CLIENT"))));
        when(jwtService.generateToken(any())).thenReturn("jwt-token");
        when(clientRepository.save(any(Client.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AuthResponse response = authService.register(request);

        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        verify(clientRepository).save(captor.capture());

        Client savedClient = captor.getValue();
        assertEquals("CLIENT", response.getRole());
        assertTrue(savedClient instanceof Enterprise);
        assertEquals("Acme SAS", ((Enterprise) savedClient).getName());
        assertEquals(ClientType.CLASSIC, savedClient.getType());
        assertEquals("Dakar", savedClient.getTown());
        assertEquals("Plateau", savedClient.getQuarter());
    }
}
