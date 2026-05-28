package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String firstName;
    private String lastName;

    @Builder.Default
    @Column(nullable = false)
    private String preferredCurrency = "EUR";

    @Builder.Default
    @Column(nullable = false)
    private String preferredTheme = "System";
}
