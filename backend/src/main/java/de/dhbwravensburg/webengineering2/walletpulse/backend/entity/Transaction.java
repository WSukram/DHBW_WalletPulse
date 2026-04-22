package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Associated Assets
    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    // Amount (e.g. 0.5 BTC)
    @Column(nullable = false)
    private double amount;

    // Purchase price per unit
    @Column(nullable = false)
    private double buyPrice;

    // Purchase date
    @Column(nullable = false)
    private LocalDate date;
}
