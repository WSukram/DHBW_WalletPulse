package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

public record AuthResponse(
        String token,
        String email,
        String firstName,
        String lastName,
        String preferredCurrency,
        String preferredTheme
) {}
