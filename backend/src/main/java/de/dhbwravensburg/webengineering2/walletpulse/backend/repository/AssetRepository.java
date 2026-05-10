package de.dhbwravensburg.webengineering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository <Asset, Long> {
	List<Asset> findByWalletId(Long walletId);
	Optional<Asset> findByWalletIdAndCoinId(Long walletId, String coinId);
}
