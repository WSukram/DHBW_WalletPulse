package de.dhbwravensburg.webengineering2.walletpulse.backend.service.blockchain;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Summary of an on-chain import run")
public record ImportResult(
        @Schema(description = "Number of new transactions stored", example = "12") int imported,
        @Schema(description = "Number of transactions skipped (already known)", example = "5") int skipped,
        @Schema(description = "Number of transactions that failed to import", example = "0") int failed
) {
    public static ImportResult sum(ImportResult a, ImportResult b) {
        return new ImportResult(a.imported + b.imported, a.skipped + b.skipped, a.failed + b.failed);
    }
}
