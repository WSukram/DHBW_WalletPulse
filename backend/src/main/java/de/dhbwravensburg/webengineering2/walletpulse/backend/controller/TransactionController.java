package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.TransactionRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.TransactionResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Tag(name = "Transactions", description = "CRUD-Endpunkte für Kauftransaktionen")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/api/assets/{assetId}/transactions")
    @Operation(summary = "Transaktionen eines Assets abrufen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaktionen erfolgreich geladen"),
            @ApiResponse(responseCode = "404", description = "Asset nicht gefunden")
    })
    public List<TransactionResponse> getTransactionsByAssetId(
            @Parameter(description = "ID des Assets", example = "10") @PathVariable Long assetId,
            @AuthenticationPrincipal UserDetails user) {
        return transactionService.getTransactionsByAssetId(assetId, user.getUsername())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/transactions/{transactionId}")
    @Operation(summary = "Eine Transaktion per ID abrufen")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaktion gefunden"),
            @ApiResponse(responseCode = "404", description = "Transaktion nicht gefunden")
    })
    public TransactionResponse getTransactionById(
            @Parameter(description = "ID der Transaktion", example = "100") @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails user) {
        return toResponse(transactionService.getTransactionById(transactionId, user.getUsername()));
    }

    @PostMapping("/api/assets/{assetId}/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Neue Transaktion anlegen")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transaktion erstellt"),
            @ApiResponse(responseCode = "400", description = "Ungültige Anfrage"),
            @ApiResponse(responseCode = "404", description = "Asset nicht gefunden")
    })
    public TransactionResponse createTransaction(
            @Parameter(description = "ID des Assets", example = "10") @PathVariable Long assetId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Transaction created = transactionService.createTransaction(
                assetId, request.amount(), request.buyPrice(), request.date(), user.getUsername()
        );
        return toResponse(created);
    }

    @PutMapping("/api/transactions/{transactionId}")
    @Operation(summary = "Transaktion aktualisieren")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaktion aktualisiert"),
            @ApiResponse(responseCode = "404", description = "Transaktion nicht gefunden")
    })
    public TransactionResponse updateTransaction(
            @Parameter(description = "ID der Transaktion", example = "100") @PathVariable Long transactionId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Transaction updated = transactionService.updateTransaction(
                transactionId, request.amount(), request.buyPrice(), request.date(), user.getUsername()
        );
        return toResponse(updated);
    }

    @DeleteMapping("/api/transactions/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Transaktion löschen")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transaktion gelöscht"),
            @ApiResponse(responseCode = "404", description = "Transaktion nicht gefunden")
    })
    public void deleteTransaction(
            @Parameter(description = "ID der Transaktion", example = "100") @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails user) {
        transactionService.deleteTransaction(transactionId, user.getUsername());
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAsset().getId(),
                transaction.getAmount(),
                transaction.getBuyPrice(),
                transaction.getDate()
        );
    }
}
