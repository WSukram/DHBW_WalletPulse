package de.dhbwravensburg.webengeneering2.walletpulse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // z. B. "bitcoin", "ethereum"
    @Column(nullable = false)
    private String coinId;

    // Relation to Wallet (Many assets belong to one wallet)
    @ManyToOne
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    // Relation to Transaction
    @OneToMany(mappedBy = "asset", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Transaction> transactions;
}
