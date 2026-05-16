package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.UserResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.User;
import de.dhbwravensburg.webengineering2.walletpulse.backend.exception.BusinessException;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getUser(String email) {
        User user = load(email);
        return toResponse(user);
    }

    public UserResponse updatePreferences(String email, String currency, String theme) {
        User user = load(email);
        user.setPreferredCurrency(currency);
        user.setPreferredTheme(theme);
        return toResponse(userRepository.save(user));
    }

    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = load(email);
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    private User load(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Account no longer exists"));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPreferredCurrency(),
                user.getPreferredTheme()
        );
    }
}
