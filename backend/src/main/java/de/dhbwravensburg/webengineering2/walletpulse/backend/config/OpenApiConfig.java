package de.dhbwravensburg.webengineering2.walletpulse.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI walletPulseOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("WalletPulse API")
                        .version("v1")
                        .description("REST API for WalletPulse crypto portfolio tracking"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste your JWT token (obtained from /api/auth/login)")));
    }
}
