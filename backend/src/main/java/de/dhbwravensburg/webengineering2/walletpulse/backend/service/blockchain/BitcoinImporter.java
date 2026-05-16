package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import de.dhbwravensburg.webengineering2.walletpulse.backend.api.BlockstreamClient;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.ChainType;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Component
public class BitcoinImporter implements ChainImporter {

    private static final Logger log = LoggerFactory.getLogger(BitcoinImporter.class);
    private static final BigDecimal SATOSHI_PER_BTC = new BigDecimal("100000000");

    private final BlockstreamClient blockstreamClient;
    private final ImportSupport support;

    public BitcoinImporter(BlockstreamClient blockstreamClient, ImportSupport support) {
        this.blockstreamClient = blockstreamClient;
        this.support = support;
    }

    @Override
    public ChainType chainType() {
        return ChainType.BTC;
    }

    @Override
    public ImportResult importTransactions(Wallet wallet) {
        int imported = 0, skipped = 0, failed = 0;
        String address = wallet.getChainAddress();

        List<Map<String, Object>> txs = blockstreamClient.getTransactions(address);
        for (Map<String, Object> tx : txs) {
            String txid = (String) tx.get("txid");
            try {
                long receivedSatoshi = getReceivedSatoshi(tx, address);
                if (receivedSatoshi <= 0) continue;

                long blockTime = ImportSupport.toLong(tx.get("status") instanceof Map<?, ?> s ? s.get("block_time") : null);
                if (blockTime == 0) {
                    // Mempool tx not yet mined — skip until it confirms (it'll be picked up on the next import).
                    log.debug("Skipping unconfirmed BTC tx {} for {}", txid, address);
                    continue;
                }

                LocalDate date = Instant.ofEpochSecond(blockTime).atZone(ZoneOffset.UTC).toLocalDate();
                double amount = new BigDecimal(receivedSatoshi).divide(SATOSHI_PER_BTC, 8, RoundingMode.HALF_UP).doubleValue();

                switch (support.upsertImported(wallet, "bitcoin", txid, amount, date)) {
                    case IMPORTED -> imported++;
                    case SKIPPED -> skipped++;
                }
            } catch (Exception e) { failed++; }
        }

        return new ImportResult(imported, skipped, failed);
    }

    private static long getReceivedSatoshi(Map<String, Object> tx, String address) {
        long total = 0;
        Object vout = tx.get("vout");
        if (!(vout instanceof List<?> outputs)) return 0;
        for (Object o : outputs) {
            if (!(o instanceof Map<?, ?> output)) continue;
            if (address.equals(output.get("scriptpubkey_address"))) {
                total += ImportSupport.toLong(output.get("value"));
            }
        }
        return total;
    }
}
