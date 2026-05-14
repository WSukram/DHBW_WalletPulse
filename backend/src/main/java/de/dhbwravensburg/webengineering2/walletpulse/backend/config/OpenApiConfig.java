package de.dhbwravensburg.webengineering2.walletpulse.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI walletPulseOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("WalletPulse API")
                        .version("v1")
                        .description("REST API for WalletPulse — a crypto portfolio tracking application. " +
                                "Manage wallets, assets and transactions, import on-chain history for ETH/BTC/SOL, " +
                                "and query live market prices.")
                        .license(new License()
                                .name("MIT")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local development"),
                        new Server().url("/").description("Same-origin (when served behind a reverse proxy)")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token (obtained from POST /api/auth/login)")));
    }
}
