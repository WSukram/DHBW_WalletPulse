package de.dhbwravensburg.webengineering2.walletpulse.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ChainType chainType;

    @Column(nullable = true)
    private String chainAddress;

    @Column(nullable = true)
    private LocalDateTime lastImportTime;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @OneToMany(mappedBy = "wallet",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<Asset> assets;
}
