package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WalletControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        String email = "wallet-test-" + UUID.randomUUID() + "@example.com";

        Map<String, String> registerBody = Map.of(
                "firstName", "Test",
                "lastName", "User",
                "email", email,
                "password", "securepass123"
        );

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerBody)))
                .andExpect(status().isOk())
                .andReturn();

        String responseJson = result.getResponse().getContentAsString();
        authToken = objectMapper.readTree(responseJson).get("token").asText();
    }

    @Test
    void getAllWallets_withoutAuth_returns403() throws Exception {
        mockMvc.perform(get("/api/wallets"))
                .andExpect(status().isForbidden());
    }

    @Test
    void createWallet_blankName_returns400WithErrors() throws Exception {
        Map<String, String> body = Map.of("name", "");

        mockMvc.perform(post("/api/wallets")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").isNotEmpty());
    }

    @Test
    void createWallet_onlyChainTypeWithoutAddress_returns400() throws Exception {
        Map<String, String> body = Map.of(
                "name", "My ETH Wallet",
                "chainType", "ETH"
        );

        mockMvc.perform(post("/api/wallets")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.chainFieldsConsistent").isNotEmpty());
    }

    @Test
    void createWallet_validData_returns201() throws Exception {
        Map<String, String> body = Map.of("name", "My Main Wallet");

        mockMvc.perform(post("/api/wallets")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("My Main Wallet"));
    }

    @Test
    void createWallet_withChainTypeAndAddress_returns201() throws Exception {
        Map<String, String> body = Map.of(
                "name", "My ETH Wallet",
                "chainType", "ETH",
                "chainAddress", "0xabc123"
        );

        mockMvc.perform(post("/api/wallets")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("My ETH Wallet"))
                .andExpect(jsonPath("$.chainType").value("ETH"));
    }

    @Test
    void getWalletById_nonExistent_returns404() throws Exception {
        mockMvc.perform(get("/api/wallets/999999")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").isNotEmpty());
    }
}
