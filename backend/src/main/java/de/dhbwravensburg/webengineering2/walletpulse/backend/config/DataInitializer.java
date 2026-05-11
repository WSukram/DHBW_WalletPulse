package de.dhbwravensburg.webengineering2.walletpulse.backend.config;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.User;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.UserRepository;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("!test")
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("dev@walletpulse.local")) return;

        User user = User.builder()
                .email("dev@walletpulse.local")
                .password(passwordEncoder.encode("dev1234"))
                .firstName("Dev")
                .lastName("User")
                .build();
        userRepository.save(user);

        Wallet wallet = Wallet.builder()
                .name("My Wallet")
                .owner(user)
                .build();
        walletRepository.save(wallet);
    }
}
