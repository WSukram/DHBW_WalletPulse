package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.ChangePasswordRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.PreferencesRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.UserResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/me")
@RequiredArgsConstructor
@Tag(name = "User", description = "Current user profile and account settings")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get the profile of the currently authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "User profile returned"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public UserResponse getMe(@AuthenticationPrincipal UserDetails user) {
        return userService.getUser(user.getUsername());
    }

    @PutMapping("/preferences")
    @Operation(summary = "Update display preferences (currency and theme)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Preferences updated"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public UserResponse updatePreferences(
            @Valid @RequestBody PreferencesRequest request,
            @AuthenticationPrincipal UserDetails user) {
        return userService.updatePreferences(user.getUsername(), request.currency(), request.theme());
    }

    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Change the current user's password")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Password changed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request or wrong current password"),
            @ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    public void changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails user) {
        userService.changePassword(user.getUsername(), request.currentPassword(), request.newPassword());
    }
}
