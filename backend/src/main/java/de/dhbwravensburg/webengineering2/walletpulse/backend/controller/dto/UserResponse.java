package de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto;

public record UserResponse(
        String email,
        String firstName,
        String lastName,
        String preferredCurrency,
        String preferredTheme
) {}
