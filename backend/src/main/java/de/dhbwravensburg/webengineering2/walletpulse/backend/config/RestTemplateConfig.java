package de.dhbwravensburg.webengineering2.walletpulse.backend.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public CacheManager cacheManager() {
        // Public price ticker on the landing page — short TTL so the homepage refreshes within a minute.
        CaffeineCache marketPrices = new CaffeineCache("marketPrices",
                Caffeine.newBuilder().expireAfterWrite(Duration.ofSeconds(60)).maximumSize(64).build());

        // Per-coin live prices used by portfolio calculations — longer TTL to stay under CoinGecko's free-tier limits.
        CaffeineCache coinPrices = new CaffeineCache("coinPrices",
                Caffeine.newBuilder().expireAfterWrite(Duration.ofMinutes(5)).maximumSize(256).build());

        SimpleCacheManager manager = new SimpleCacheManager();
        manager.setCaches(List.of(marketPrices, coinPrices));
        return manager;
    }
}
