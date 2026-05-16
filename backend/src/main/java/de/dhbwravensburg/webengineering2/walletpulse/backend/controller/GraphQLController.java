package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.TransactionResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.WalletResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Transaction;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.AssetService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.TransactionService;
import de.dhbwravensburg.webengineering2.walletpulse.backend.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * GraphQL resolvers return DTOs (never JPA entities) so that schema traversal
 * never triggers a LazyInitializationException after the service-layer
 * transaction has closed. Nested relations are fetched via @SchemaMapping
 * resolvers that call back into the services with the original authenticated
 * user.
 */
@Controller
@RequiredArgsConstructor
public class GraphQLController {

    private final WalletService walletService;
    private final AssetService assetService;
    private final TransactionService transactionService;

    @QueryMapping
    public List<WalletResponse> wallets(@AuthenticationPrincipal UserDetails user) {
        return walletService.getAllWallets(user.getUsername()).stream()
                .map(GraphQLController::toWalletResponse)
                .toList();
    }

    @QueryMapping
    public WalletResponse wallet(@Argument Long id, @AuthenticationPrincipal UserDetails user) {
        return toWalletResponse(walletService.getWalletById(id, user.getUsername()));
    }

    @QueryMapping
    public List<AssetResponse> assets(@Argument Long walletId, @AuthenticationPrincipal UserDetails user) {
        return assetService.getAssetsByWalletId(walletId, user.getUsername()).stream()
                .map(assetService::mapToPortfolioResponse)
                .toList();
    }

    @QueryMapping
    public AssetResponse asset(@Argument Long id, @AuthenticationPrincipal UserDetails user) {
        return assetService.mapToPortfolioResponse(assetService.getAssetById(id, user.getUsername()));
    }

    @QueryMapping
    public List<TransactionResponse> transactions(@Argument Long assetId, @AuthenticationPrincipal UserDetails user) {
        return transactionService.getTransactionsByAssetId(assetId, user.getUsername()).stream()
                .map(GraphQLController::toTransactionResponse)
                .toList();
    }

    @SchemaMapping(typeName = "Wallet")
    public String chainType(WalletResponse wallet) {
        return wallet.chainType() == null ? null : wallet.chainType().name();
    }

    @SchemaMapping(typeName = "Wallet")
    public List<AssetResponse> assets(WalletResponse wallet, @AuthenticationPrincipal UserDetails user) {
        return assetService.getAssetsByWalletId(wallet.id(), user.getUsername()).stream()
                .map(assetService::mapToPortfolioResponse)
                .toList();
    }

    @SchemaMapping(typeName = "Asset")
    public List<TransactionResponse> transactions(AssetResponse asset, @AuthenticationPrincipal UserDetails user) {
        return transactionService.getTransactionsByAssetId(asset.id(), user.getUsername()).stream()
                .map(GraphQLController::toTransactionResponse)
                .toList();
    }

    @SchemaMapping(typeName = "Transaction")
    public String source(TransactionResponse tx) {
        return tx.source() == null ? null : tx.source().name();
    }

    @SchemaMapping(typeName = "Transaction")
    public String date(TransactionResponse tx) {
        return tx.date() == null ? null : tx.date().toString();
    }

    private static WalletResponse toWalletResponse(Wallet wallet) {
        return new WalletResponse(
                wallet.getId(),
                wallet.getName(),
                wallet.getChainType(),
                wallet.getChainAddress(),
                wallet.getLastImportTime()
        );
    }

    private static TransactionResponse toTransactionResponse(Transaction transaction) {
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
