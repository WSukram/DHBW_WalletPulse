package de.dhbwravensburg.webengineering2.walletpulse.backend.repository;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository <Transaction, Long> {
}
