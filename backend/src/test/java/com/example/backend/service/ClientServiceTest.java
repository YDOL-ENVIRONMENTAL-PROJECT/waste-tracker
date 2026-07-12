package com.example.backend.service;

import com.example.backend.dto.client.ClientRequest;
import com.example.backend.model.Enterprise;
import com.example.backend.model.IndividualClient;
import com.example.backend.model.enums.ClientType;
import com.example.backend.repository.ClientRepository;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;


import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ClientServiceTest {

    private final ClientRepository clientRepository = mock(ClientRepository.class);
    private final PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
    private final ClientService clientService = new ClientService(clientRepository, passwordEncoder);

    @Test
    void updateShouldHandleIndividualClientFields() {
        UUID id = UUID.randomUUID();
        IndividualClient client = new IndividualClient();
        client.setEmail("old@example.com");
        client.setPhone("0123456789");
        client.setTown("Paris");
        client.setQuarter("Centre");
        client.setType(ClientType.CLASSIC);

        ClientRequest request = new ClientRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john@example.com");
        request.setPhone("0999999999");
        request.setTown("Lyon");
        request.setQuarter("Part-Dieu");
        request.setType(ClientType.PREMIUM);
        request.setDateOfBirth(LocalDate.of(1990, 1, 1));

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = clientService.update(id, request);

        assertEquals("John", response.getName());
        assertEquals("Doe", response.getSurname());
        assertEquals(LocalDate.of(1990, 1, 1), response.getDateOfBirth());
        assertEquals(ClientType.PREMIUM, response.getType());
        assertEquals("john@example.com", client.getEmail());
        assertEquals("Lyon", client.getTown());
        assertEquals("Part-Dieu", client.getQuarter());
    }

    @Test
    void updateShouldHandleEnterpriseFields() {
        UUID id = UUID.randomUUID();
        Enterprise client = new Enterprise();
        client.setEmail("old-enterprise@example.com");
        client.setPhone("0123456789");
        client.setTown("Paris");
        client.setQuarter("Centre");
        client.setType(ClientType.CLASSIC);

        ClientRequest request = new ClientRequest();
        request.setName("ACME Corp");
        request.setEmail("enterprise@example.com");
        request.setPhone("0888888888");
        request.setTown("Marseille");
        request.setQuarter("La Joliette");
        request.setType(ClientType.PREMIUM);

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = clientService.update(id, request);

        assertEquals("ACME Corp", response.getName());
        assertNull(response.getSurname());
        assertNull(response.getDateOfBirth());
        assertEquals(ClientType.PREMIUM, response.getType());
        assertEquals("ACME Corp", client.getName());
        assertEquals("enterprise@example.com", client.getEmail());
    }
}
