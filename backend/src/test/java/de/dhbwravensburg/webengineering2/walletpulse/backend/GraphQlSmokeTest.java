package de.dhbwravensburg.webengineering2.walletpulse.backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GraphQlSmokeTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void shouldExposeGraphiqlPlayground() throws Exception {
        mockMvc.perform(get("/graphiql?path=/graphql"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldRejectUnauthenticatedGraphQlRequests() throws Exception {
        mockMvc.perform(post("/graphql")
                        .contentType("application/json")
                        .content("{\"query\":\"{ wallets { id } }\"}"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    void shouldTraverseWalletThroughAssetsAfterTxClose() throws Exception {
        // Register a user and create one wallet (no assets, no on-chain).
        // The query must traverse Wallet.assets, which was previously broken
        // when resolvers returned JPA entities and the session was closed
        // before the nested field was resolved.
        String email = "graphql-" + UUID.randomUUID() + "@example.com";

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "firstName", "GraphQl",
                                "lastName", "Tester",
                                "email", email,
                                "password", "securepass123"
                        ))))
                .andExpect(status().isCreated())
                .andReturn();

        String token = objectMapper.readTree(registerResult.getResponse().getContentAsString())
                .get("token").asText();

        mockMvc.perform(post("/api/wallets")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("name", "Empty wallet"))))
                .andExpect(status().isCreated());

        // Traverse the nested relation. With entity returns + no open session
        // this would surface as a LazyInitializationException; with DTOs it succeeds.
        mockMvc.perform(post("/graphql")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\":\"{ wallets { id name assets { id } } }\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.errors").doesNotExist())
                .andExpect(jsonPath("$.data.wallets[0].name").value("Empty wallet"))
                .andExpect(jsonPath("$.data.wallets[0].assets").isArray());
    }
}
