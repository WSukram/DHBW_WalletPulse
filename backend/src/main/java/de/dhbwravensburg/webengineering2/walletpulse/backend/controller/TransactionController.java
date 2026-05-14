package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.TransactionRequest;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.TransactionResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
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
@Tag(name = "Transactions", description = "CRUD endpoints for purchase transactions")
@SecurityRequirement(name = "bearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping("/api/assets/{assetId}/transactions")
    @Operation(summary = "Get all transactions of an asset")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transactions loaded successfully"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    public List<TransactionResponse> getTransactionsByAssetId(
            @Parameter(description = "Asset ID", example = "10") @PathVariable Long assetId,
            @AuthenticationPrincipal UserDetails user) {
        return transactionService.getTransactionsByAssetId(assetId, user.getUsername())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/api/transactions/{transactionId}")
    @Operation(summary = "Get a transaction by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction found"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public TransactionResponse getTransactionById(
            @Parameter(description = "Transaction ID", example = "100") @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails user) {
        return toResponse(transactionService.getTransactionById(transactionId, user.getUsername()));
    }

    @PostMapping("/api/assets/{assetId}/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new transaction")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Transaction created"),
            @ApiResponse(responseCode = "400", description = "Invalid request"),
            @ApiResponse(responseCode = "404", description = "Asset not found")
    })
    public TransactionResponse createTransaction(
            @Parameter(description = "Asset ID", example = "10") @PathVariable Long assetId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Transaction created = transactionService.createTransaction(
                assetId, request.amount(), request.buyPrice(), request.date(), user.getUsername()
        );
        return toResponse(created);
    }

    @PutMapping("/api/transactions/{transactionId}")
    @Operation(summary = "Update a transaction")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Transaction updated"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public TransactionResponse updateTransaction(
            @Parameter(description = "Transaction ID", example = "100") @PathVariable Long transactionId,
            @Valid @RequestBody TransactionRequest request,
            @AuthenticationPrincipal UserDetails user) {
        Transaction updated = transactionService.updateTransaction(
                transactionId, request.amount(), request.buyPrice(), request.date(), user.getUsername()
        );
        return toResponse(updated);
    }

    @DeleteMapping("/api/transactions/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a transaction")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Transaction deleted"),
            @ApiResponse(responseCode = "404", description = "Transaction not found")
    })
    public void deleteTransaction(
            @Parameter(description = "Transaction ID", example = "100") @PathVariable Long transactionId,
            @AuthenticationPrincipal UserDetails user) {
        transactionService.deleteTransaction(transactionId, user.getUsername());
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getId(),
                transaction.getAsset().getId(),
                transaction.getAmount(),
                transaction.getBuyPrice(),
                transaction.getDate(),
                transaction.getSource(),
                transaction.getTxHash()
        );
    }
}
