package de.dhbwravensburg.webengineering2.walletpulse.backend.service;

import de.dhbwravensburg.webengineering2.walletpulse.backend.entity.Wallet;
import de.dhbwravensburg.webengineering2.walletpulse.backend.repository.WalletRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class WalletService {

    private final WalletRepository walletRepository;

    public WalletService(WalletRepository walletRepository) {
        this.walletRepository = walletRepository;
    }

    public List<Wallet> getAllWallets() {
       return walletRepository.findAll();
    }

    public Wallet createWallet(Wallet wallet) {
        return walletRepository.save(wallet);
    }

    public Wallet getWalletById(Long id) {
        return walletRepository.findById(id).orElse(null);
    }

    public void deleteWallet(Long id) {
        walletRepository.deleteById(id);
    }

    public Wallet updateWallet(Long id, Wallet updatedWallet){
        Wallet existing = getWalletById(id);
        existing.setName(updatedWallet.getName());
        return walletRepository.save(existing);
    }
}

