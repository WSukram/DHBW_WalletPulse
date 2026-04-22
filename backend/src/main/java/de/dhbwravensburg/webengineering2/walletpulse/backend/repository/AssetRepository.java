package de.dhbwravensburg.webengineering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository <Asset, Long> {
}
