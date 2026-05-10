package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.ChangePasswordRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.PreferencesRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.UserResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public UserResponse getMe(@AuthenticationPrincipal UserDetails user) {
        return userService.getUser(user.getUsername());
    }

    @PutMapping("/preferences")
    public UserResponse updatePreferences(
            @Valid @RequestBody PreferencesRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return userService.updatePreferences(user.getUsername(), request.currency(), request.theme());
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails user) {
        userService.changePassword(user.getUsername(), request.currentPassword(), request.newPassword());
    }
}
