/**
 * Exchange Rate Service
 * Uses Cloudflare Cache API with 10-minute cache intervals
 * Fetches USD to KRW rate from Naver API
 */

interface NaverExchangeResponse {
  country: Array<{
    value: string;
    [key: string]: any;
  }>;
}

interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  timestamp: number;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds
const NAVER_API_URL = 'https://m.search.naver.com/p/csearch/content/qapirender.nhn?key=calculator&pkid=141&q=%ED%99%98%EC%9C%A8&where=m&u1=keb&u6=standardUnit&u7=0&u3=USD&u4=KRW&u8=down&u2=1';

export class ExchangeRateService {
  private cacheKey = 'exchange-rate:USD-KRW';

  /**
   * Get USD to KRW exchange rate (cached for 10 minutes)
   */
  async getUSDToKRW(): Promise<number> {
    const cached = await this.getCachedRate();
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.rate;
    }

    const freshRate = await this.fetchExchangeRate();
    await this.setCachedRate(freshRate);
    return freshRate;
  }

  /**
   * Convert amount from one currency to KRW
   */
  async convertToKRW(amount: number, fromCurrency: string): Promise<number> {
    if (fromCurrency === 'KRW') {
      return amount;
    }

    if (fromCurrency === 'USD') {
      const rate = await this.getUSDToKRW();
      return amount * rate;
    }

    throw new Error(`Unsupported currency: ${fromCurrency}`);
  }

  /**
   * Convert mixed currency array to all KRW values
   */
  async convertMixedToKRW(expenses: Array<{ amount: number; currency: string }>): Promise<number[]> {
    const results = [];
    for (const expense of expenses) {
      const krwAmount = await this.convertToKRW(expense.amount, expense.currency);
      results.push(krwAmount);
    }
    return results;
  }

  /**
   * Fetch fresh exchange rate from Naver API
   */
  private async fetchExchangeRate(): Promise<number> {
    try {
      const response = await fetch(NAVER_API_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: NaverExchangeResponse = await response.json();
      
      if (!data.country || !data.country[1] || !data.country[1].value) {
        throw new Error('Invalid response format from Naver API');
      }

      const rawValue = data.country[1].value;
      const rate = parseFloat(rawValue.replace(/,/g, ''));
      
      if (isNaN(rate) || rate <= 0) {
        throw new Error('Invalid exchange rate value');
      }

      return rate;
    } catch (error) {
      console.error('Failed to fetch exchange rate:', error);
      // Return fallback rate (approximate USD to KRW)
      return 1300;
    }
  }

  /**
   * Get cached exchange rate from Cloudflare Cache API
   */
  private async getCachedRate(): Promise<ExchangeRate | null> {
    try {
      const cacheUrl = new URL(`https://cache.example.com/${this.cacheKey}`);
      const cache = (globalThis as any).caches?.default;
      if (!cache) return null;
      
      const cachedResponse = await cache.match(cacheUrl);
      
      if (cachedResponse) {
        const data = await cachedResponse.json();
        return data as ExchangeRate;
      }
    } catch (error) {
      console.error('Failed to get cached rate:', error);
    }
    return null;
  }

  /**
   * Set exchange rate in Cloudflare Cache API
   */
  private async setCachedRate(rate: number): Promise<void> {
    try {
      const exchangeRate: ExchangeRate = {
        from: 'USD',
        to: 'KRW',
        rate,
        timestamp: Date.now(),
      };

      const cacheUrl = new URL(`https://cache.example.com/${this.cacheKey}`);
      const response = new Response(JSON.stringify(exchangeRate), {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `max-age=${CACHE_DURATION / 1000}`,
        },
      });

      const cache = (globalThis as any).caches?.default;
      if (!cache) return;
      
      await cache.put(cacheUrl, response);
    } catch (error) {
      console.error('Failed to set cached rate:', error);
    }
  }

  /**
   * Check if cached rate is still valid (within 10 minutes)
   */
  private isCacheValid(timestamp: number): boolean {
    const now = Date.now();
    return (now - timestamp) < CACHE_DURATION;
  }
}

export const exchangeRateService = new ExchangeRateService();