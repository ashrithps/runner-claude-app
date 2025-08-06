interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

const COUNTRY_TO_CURRENCY: Record<string, CurrencyInfo> = {
  // North America
  US: { code: 'USD', symbol: '$', name: 'US Dollar' },
  CA: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  MX: { code: 'MXN', symbol: '$', name: 'Mexican Peso' },
  
  // Europe
  DE: { code: 'EUR', symbol: '€', name: 'Euro' },
  FR: { code: 'EUR', symbol: '€', name: 'Euro' },
  IT: { code: 'EUR', symbol: '€', name: 'Euro' },
  ES: { code: 'EUR', symbol: '€', name: 'Euro' },
  GB: { code: 'GBP', symbol: '£', name: 'British Pound' },
  CH: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  NO: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  SE: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  DK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
  
  // Asia Pacific
  IN: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  CN: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  JP: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  KR: { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  AU: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  NZ: { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  SG: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  HK: { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar' },
  
  // Middle East & Africa
  AE: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  SA: { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  ZA: { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  
  // South America
  BR: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  AR: { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  CL: { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
};

const DEFAULT_CURRENCY: CurrencyInfo = { code: 'USD', symbol: '$', name: 'US Dollar' };
const FALLBACK_CURRENCY: CurrencyInfo = { code: 'INR', symbol: '₹', name: 'Indian Rupee' };

export async function detectCurrencyFromLocation(latitude?: number, longitude?: number): Promise<CurrencyInfo> {
  try {
    if (latitude && longitude) {
      const countryCode = await getCountryFromCoordinates(latitude, longitude);
      if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
        return COUNTRY_TO_CURRENCY[countryCode];
      }
    }
    
    const countryCode = await getCountryFromIP();
    if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
      return COUNTRY_TO_CURRENCY[countryCode];
    }
    
    return DEFAULT_CURRENCY;
  } catch (error) {
    console.log('Currency detection failed, using fallback:', error);
    return FALLBACK_CURRENCY;
  }
}

async function getCountryFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
    const data = await response.json();
    return data.countryCode;
  } catch (error) {
    console.log('Reverse geocoding failed:', error);
    return null;
  }
}

async function getCountryFromIP(): Promise<string | null> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code;
  } catch (error) {
    console.log('IP geolocation failed:', error);
    return null;
  }
}

export function formatCurrency(amount: number, currencyInfo: CurrencyInfo): string {
  try {
    // Use a locale that matches the currency region for better formatting
    const locale = getLocaleForCurrency(currencyInfo.code);
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (error) {
    console.log('Currency formatting failed, using fallback:', error);
    // Simple fallback without double symbols
    return `${currencyInfo.symbol}${amount}`;
  }
}

function getLocaleForCurrency(currencyCode: string): string {
  const currencyToLocale: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    INR: 'en-IN',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    AUD: 'en-AU',
    CAD: 'en-CA',
    CHF: 'de-CH',
    SGD: 'en-SG',
    HKD: 'zh-HK',
    // Add more mappings as needed
  };
  
  return currencyToLocale[currencyCode] || 'en-US';
}

export function getCurrencySymbol(currencyInfo: CurrencyInfo): string {
  return currencyInfo.symbol;
}

export function getCurrencyCode(currencyInfo: CurrencyInfo): string {
  return currencyInfo.code;
}

export function getCurrencyName(currencyInfo: CurrencyInfo): string {
  return currencyInfo.name;
}

export function getPaymentMethodsForCountry(countryCode: string): string[] {
  const paymentMethods: Record<string, string[]> = {
    US: ['Venmo', 'Zelle', 'Cash App', 'PayPal'],
    CA: ['Interac e-Transfer', 'PayPal'],
    GB: ['Bank Transfer', 'PayPal', 'Revolut'],
    IN: ['UPI', 'PhonePe', 'Google Pay', 'Paytm'],
    AU: ['Bank Transfer', 'PayPal', 'PayID'],
    SG: ['PayNow', 'GrabPay', 'PayPal'],
    MY: ['Touch \'n Go eWallet', 'GrabPay', 'PayPal'],
    DE: ['Bank Transfer', 'PayPal', 'N26'],
    FR: ['Bank Transfer', 'PayPal', 'Lydia'],
    BR: ['PIX', 'PayPal'],
    MX: ['SPEI', 'PayPal'],
  };
  
  return paymentMethods[countryCode] || ['Mobile Payment Apps', 'Bank Transfer', 'PayPal'];
}

export { DEFAULT_CURRENCY, FALLBACK_CURRENCY };
export type { CurrencyInfo };