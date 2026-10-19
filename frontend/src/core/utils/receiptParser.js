import { createWorker } from 'tesseract.js';

/**
 * Extracts structured expense information from a receipt image.
 * @param {File|Blob|string} imageSource
 * @param {Function} [onProgress] Progress callback (0 - 100)
 * @returns {Promise<{ description: string, amount: string, category: string, rawText: string }>}
 */
export const parseReceiptImage = async (imageSource, onProgress) => {
  let worker = null;
  try {
    worker = await createWorker('eng');
    
    const ret = await worker.recognize(imageSource);
    const rawText = ret.data.text || '';
    await worker.terminate();

    return extractReceiptDetails(rawText);
  } catch (err) {
    if (worker) {
      try { await worker.terminate(); } catch (e) {}
    }
    console.error('Receipt OCR failed:', err);
    throw err;
  }
};

/**
 * Parses raw text from OCR into structured fields.
 */
export const extractReceiptDetails = (rawText) => {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let amount = '';
  let description = '';
  let category = 'general';

  // 1. Detect Category by keyword scanning
  const lower = rawText.toLowerCase();
  if (lower.match(/\b(restaurant|cafe|coffee|diner|kitchen|bistro|food|bar|pizza|burger|bakery)\b/)) {
    category = 'food';
  } else if (lower.match(/\b(uber|ola|taxi|cab|fuel|petrol|diesel|gas|flight|airline|train|metro|transit|toll)\b/)) {
    category = 'travel';
  } else if (lower.match(/\b(supermarket|mart|grocery|groceries|vegetables|fruits|store|kirana)\b/)) {
    category = 'groceries';
  } else if (lower.match(/\b(electricity|water|broadband|wifi|internet|utility|recharge|cylinder|bill)\b/)) {
    category = 'utilities';
  } else if (lower.match(/\b(rent|maintenance|lease|flat|housing|room)\b/)) {
    category = 'rent';
  } else if (lower.match(/\b(movie|cinema|theatre|game|bowling|concert|show|club|fun)\b/)) {
    category = 'entertainment';
  }

  // 2. Detect Total Amount
  // Pattern A: Look for "Total" / "Amount" keywords followed by numbers
  const totalRegex = /(?:grand\s*total|net\s*amount|total|sub\s*total|bill\s*amount|amount\s*due|amount)[\s:=-]*₹?\s*([0-9]+[.,][0-9]{2})/i;
  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match && match[1]) {
      amount = match[1].replace(',', '.');
      break;
    }
  }

  // Pattern B: Fallback - find largest reasonable monetary value (e.g. 250.00, 1499.50)
  if (!amount) {
    const numbers = [];
    const numRegex = /₹?\s*([0-9]+[.,][0-9]{2})\b/g;
    let m;
    while ((m = numRegex.exec(rawText)) !== null) {
      const val = parseFloat(m[1].replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 500000) {
        numbers.push(val);
      }
    }
    if (numbers.length > 0) {
      amount = Math.max(...numbers).toFixed(2);
    }
  }

  // 3. Detect Description (usually top header line / store name)
  for (const line of lines.slice(0, 5)) {
    const clean = line.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();
    if (clean.length >= 3 && !clean.match(/^(tax\s*invoice|receipt|bill|date|time|gstin|welcome|cash)/i)) {
      description = clean;
      break;
    }
  }

  if (!description && lines[0]) {
    description = lines[0].substring(0, 30).trim();
  }

  return {
    description: description || 'Scanned Receipt',
    amount: amount || '',
    category,
    rawText,
  };
};
