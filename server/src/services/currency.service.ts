const BASE_CURRENCY = 'DKK';
const API_URL = `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}`;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

let cachedRates: Record<string, number> = {};
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let refreshInterval: ReturnType<typeof setInterval> | null = null;

async function fetchRates(): Promise<void> {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            console.warn(`Currency API returned ${response.status}, keeping previous rates`);
            return;
        }

        const data = await response.json() as { base: string; date: string; rates: Record<string, number> };
        cachedRates = data.rates;

        console.log(`💱 Currency rates updated (${Object.keys(cachedRates).length} currencies, date: ${data.date})`);
    } catch (error) {
        console.warn('Failed to fetch currency rates, keeping previous rates:', error);
    }
}

/**
 * Calculates milliseconds until the next 16:05 CET (Europe/Copenhagen).
 */
function msUntilNext1605CET(): number {
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Copenhagen',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
    });

    const parts = formatter.formatToParts(now);
    const currentHourCET = Number(parts.find(p => p.type === 'hour')?.value ?? 0);
    const currentMinuteCET = Number(parts.find(p => p.type === 'minute')?.value ?? 0);
    const currentMinutesOfDay = currentHourCET * 60 + currentMinuteCET;
    const targetMinutesOfDay = 16 * 60 + 5;

    let diffMinutes = targetMinutesOfDay - currentMinutesOfDay;
    if (diffMinutes <= 0) {
        diffMinutes += 24 * 60;
    }

    return diffMinutes * 60 * 1000;
}

function clearTimers(): void {
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
    }
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
    }
}

export async function initCurrencyService(): Promise<void> {
    // Clear any existing timers (safety for re-init)
    clearTimers();

    // Fetch immediately on startup
    await fetchRates();

    // Schedule next fetch at 16:05 CET, then every 24h
    const msUntilFirstRefresh = msUntilNext1605CET();
    const hoursUntil = (msUntilFirstRefresh / (1000 * 60 * 60)).toFixed(1);
    console.log(`💱 Next rate refresh in ${hoursUntil}h (16:05 CET daily)`);

    refreshTimeout = setTimeout(() => {
        refreshTimeout = null;
        void fetchRates();
        refreshInterval = setInterval(() => void fetchRates(), ONE_DAY_MS);
    }, msUntilFirstRefresh);
}

export function destroyCurrencyService(): void {
    clearTimers();
    cachedRates = {};
}

export function convertFromDKK(amount: number, targetCurrency: string): number {
    if (targetCurrency === BASE_CURRENCY) {
        return amount;
    }

    const rate = cachedRates[targetCurrency];
    if (!rate) {
        console.warn(`No exchange rate found for ${targetCurrency}, returning DKK value`);
        return amount;
    }

    return Math.round(amount * rate * 100) / 100;
}

export function convertToDKK(amount: number, sourceCurrency: string): number {
    if (sourceCurrency === BASE_CURRENCY) {
        return amount;
    }

    const rate = cachedRates[sourceCurrency];
    if (!rate) {
        console.warn(`No exchange rate found for ${sourceCurrency}, returning original value`);
        return amount;
    }

    return Math.round((amount / rate) * 100) / 100;
}

export function getAvailableCurrencies(): string[] {
    return [ BASE_CURRENCY, ...Object.keys(cachedRates).sort() ];
}
