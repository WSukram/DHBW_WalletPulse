package de.dhbwravensburg.webengineering2.walletpulse.backend;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GraphQlSmokeTest {

    @Autowired
    private MockMvc mockMvc;

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
}
