package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Wallet name must not be blank")
    @Column(nullable = false)
    private String name;

    @OneToMany(mappedBy = "wallet",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Asset> assets;
}
