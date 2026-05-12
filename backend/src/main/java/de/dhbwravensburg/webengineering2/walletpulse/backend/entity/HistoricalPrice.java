package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(uniqueConstraints = @UniqueConstraint(columnNames = {"coinId", "date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricalPrice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String coinId;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 20, scale = 8)
    private BigDecimal eurPrice;
}
