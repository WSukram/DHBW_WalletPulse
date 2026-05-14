package de.dhbwravensburg.webengineering2.walletpulse.backend.controller;

import de.dhbwravensburg.webengineering2.walletpulse.backend.controller.dto.AssetResponse;
import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Asset;
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

@Controller
@RequiredArgsConstructor
public class GraphQLController {

    private final WalletService walletService;
    private final AssetService assetService;
    private final TransactionService transactionService;

    @QueryMapping
    public List<Wallet> wallets(@AuthenticationPrincipal UserDetails user) {
        return walletService.getAllWallets(user.getUsername());
    }

    @QueryMapping
    public Wallet wallet(@Argument Long id, @AuthenticationPrincipal UserDetails user) {
        return walletService.getWalletById(id, user.getUsername());
    }

    @QueryMapping
    public List<Asset> assets(@Argument Long walletId, @AuthenticationPrincipal UserDetails user) {
        return assetService.getAssetsByWalletId(walletId, user.getUsername());
    }

    @QueryMapping
    public Asset asset(@Argument Long id, @AuthenticationPrincipal UserDetails user) {
        return assetService.getAssetById(id, user.getUsername());
    }

    @QueryMapping
    public List<Transaction> transactions(@Argument Long assetId, @AuthenticationPrincipal UserDetails user) {
        return transactionService.getTransactionsByAssetId(assetId, user.getUsername());
    }

    @SchemaMapping(typeName = "Wallet")
    public String chainType(Wallet wallet) {
        return wallet.getChainType() == null ? null : wallet.getChainType().name();
    }

    @SchemaMapping(typeName = "Asset")
    public Long walletId(Asset asset) {
        return asset.getWallet().getId();
    }

    @SchemaMapping(typeName = "Asset")
    public Double totalAmount(Asset asset) {
        return computed(asset).totalAmount();
    }

    @SchemaMapping(typeName = "Asset")
    public Double totalInvested(Asset asset) {
        return computed(asset).totalInvested();
    }

    @SchemaMapping(typeName = "Asset")
    public Double currentPrice(Asset asset) {
        return computed(asset).currentPrice();
    }

    @SchemaMapping(typeName = "Asset")
    public Double currentValue(Asset asset) {
        return computed(asset).currentValue();
    }

    @SchemaMapping(typeName = "Asset")
    public Double profit(Asset asset) {
        return computed(asset).profit();
    }

    @SchemaMapping(typeName = "Transaction")
    public Long assetId(Transaction transaction) {
        return transaction.getAsset().getId();
    }

    @SchemaMapping(typeName = "Transaction")
    public String source(Transaction transaction) {
        return transaction.getSource() == null ? null : transaction.getSource().name();
    }

    @SchemaMapping(typeName = "Transaction")
    public String date(Transaction transaction) {
        return transaction.getDate().toString();
    }

    private AssetResponse computed(Asset asset) {
        return assetService.mapToPortfolioResponse(asset);
    }
}
