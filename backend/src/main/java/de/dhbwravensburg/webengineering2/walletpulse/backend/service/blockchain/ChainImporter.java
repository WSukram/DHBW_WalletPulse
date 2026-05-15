package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;

/**
 * Chain-specific transaction importer. Each implementation fetches activity for
 * the wallet's address from the chain's explorer API, prices each transaction,
 * deduplicates by tx hash and persists new ones.
 */
public interface ChainImporter {
    ChainType chainType();

    ImportResult importTransactions(Wallet wallet);
}
