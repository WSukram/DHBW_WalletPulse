package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = "txHash"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    @JsonIgnore
    private Asset asset;

    @Positive(message = "Amount must be greater than zero")
    @Column(nullable = false)
    private double amount;

    @PositiveOrZero(message = "Buy price must be zero or greater")
    @Column(nullable = false)
    private double buyPrice;

    @NotNull(message = "Date must not be null")
    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = true, unique = true)
    private String txHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionSource source = TransactionSource.MANUAL;
}
