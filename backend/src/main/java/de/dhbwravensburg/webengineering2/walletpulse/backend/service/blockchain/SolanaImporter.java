package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.HeliusClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Component
public class SolanaImporter implements ChainImporter {

    private static final double LAMPORTS_PER_SOL = 1_000_000_000.0;

    // SPL tokens are identified on Solana by their mint address (not a symbol),
    // so we map known mints to CoinGecko ids. Unknown mints are skipped during
    // import — without a CoinGecko id we cannot price the transaction.
    private static final Map<String, String> SOL_MINT_TO_COINGECKO_ID = Map.ofEntries(
            Map.entry("3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", "wrapped-bitcoin"),
            Map.entry("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", "usd-coin"),
            Map.entry("Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", "tether"),
            Map.entry("mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So", "msol"),
            Map.entry("7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj", "lido-staked-sol"),
            Map.entry("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", "bonk"),
            Map.entry("JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", "jupiter-exchange-solana"),
            Map.entry("4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", "raydium"),
            Map.entry("orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", "orca"),
            Map.entry("EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", "dogwifcoin")
    );

    private final HeliusClient heliusClient;
    private final ImportSupport support;

    public SolanaImporter(HeliusClient heliusClient, ImportSupport support) {
        this.heliusClient = heliusClient;
        this.support = support;
    }

    @Override
    public ChainType chainType() {
        return ChainType.SOL;
    }

    @Override
    public ImportResult importTransactions(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress();

        List<Map<String, Object>> txs = heliusClient.getTransactions(address);
        for (Map<String, Object> tx : txs) {
            String signature = (String) tx.get("signature");
            long timestamp = ImportSupport.toLong(tx.get("timestamp"));
            if (timestamp == 0) continue;
            LocalDate date = Instant.ofEpochSecond(timestamp).atZone(ZoneOffset.UTC).toLocalDate();

            // Native SOL transfers
            try {
                long receivedLamports = sumReceivedLamports(tx.get("nativeTransfers"), address);
                if (receivedLamports > 0) {
                    double amount = receivedLamports / LAMPORTS_PER_SOL;
                    switch (support.upsertImported(wallet, "solana", signature, amount, date)) {
                        case IMPORTED -> imported++;
                        case SKIPPED -> skipped++;
                    }
                }
            } catch (Exception e) { failed++; }

            // SPL token transfers
            Object tokenTransfersObj = tx.get("tokenTransfers");
            if (!(tokenTransfersObj instanceof List<?> tokenTransfers)) continue;
            for (Object t : tokenTransfers) {
                if (!(t instanceof Map<?, ?> transfer)) continue;
                if (!address.equals(transfer.get("toUserAccount"))) continue;
                Object tokenAmountObj = transfer.get("tokenAmount");
                if (!(tokenAmountObj instanceof Number tokenAmount)) continue;
                double amount = tokenAmount.doubleValue();
                if (amount <= 0) continue;
                String coinId = SOL_MINT_TO_COINGECKO_ID.get(transfer.get("mint"));
                if (coinId == null) continue;
                String tokenTxHash = signature + "_" + transfer.get("mint");
                try {
                    switch (support.upsertImported(wallet, coinId, tokenTxHash, amount, date)) {
                        case IMPORTED -> imported++;
                        case SKIPPED -> skipped++;
                    }
                } catch (Exception e) { failed++; }
            }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private static long sumReceivedLamports(Object nativeTransfersObj, String address) {
        if (!(nativeTransfersObj instanceof List<?> transfers)) return 0;
        long total = 0;
        for (Object t : transfers) {
            if (!(t instanceof Map<?, ?> transfer)) continue;
            if (address.equals(transfer.get("toUserAccount"))) {
                total += ImportSupport.toLong(transfer.get("amount"));
            }
        }
        return total;
    }
}
