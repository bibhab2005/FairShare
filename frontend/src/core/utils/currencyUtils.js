export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)', rateToINR: 1.0 },
  { code: 'USD', symbol: '$', label: 'USD ($)', rateToINR: 84.5 },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', rateToINR: 91.5 },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', rateToINR: 107.0 },
  { code: 'AED', symbol: 'د.إ', label: 'AED (د.إ)', rateToINR: 23.0 },
  { code: 'THB', symbol: '฿', label: 'THB (฿)', rateToINR: 2.3 },
  { code: 'JPY', symbol: '¥', label: 'JPY (¥)', rateToINR: 0.55 },
];

/**
 * Converts a foreign currency amount to INR using cached/preset exchange rates.
 * @param {number|string} amount Amount in source currency
 * @param {string} currencyCode Currency code (USD, EUR, etc.)
 * @returns {number} Equivalent in INR
 */
export const convertToINR = (amount, currencyCode) => {
  const num = parseFloat(amount) || 0;
  if (!currencyCode || currencyCode === 'INR') return num;
  const curr = CURRENCIES.find((c) => c.code === currencyCode);
  const rate = curr ? curr.rateToINR : 1.0;
  return Math.round(num * rate * 100) / 100;
};
