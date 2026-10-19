# FairShare - Feature Backlog & Roadmap

This document outlines planned and proposed future features for FairShare, organized by priority tier, expected user impact, and technical implementation considerations.

> [!NOTE]
> **All Tiers Fully Shipped on `feature/apple-design-system`:**
> - **Apple Design System & Adaptive Real-Time Sync:** Fluid spring physics (`damping: 25, stiffness: 300`), frosted glass materials, 8s background polling, and real-time live sync.
> - **Tier 1 (High Impact):** Dynamic On-Screen UPI QR Code, WhatsApp/SMS Settlement Reminders, Category Spending Analytics & Chart toggle.
> - **Tier 2 (Real-World Splitting):** Itemized Dish-by-Dish Bill Splitting with tax/tip distribution, Offline PWA Queue & Sync, Export to PDF & CSV.
> - **Tier 3 (Automation & Intelligence):** Receipt OCR Scanner (`tesseract.js`), Recurring Expenses Scheduler, Multi-Currency Support (INR, USD, EUR, GBP, AED, THB, JPY).
> - **Tier 4 (Power User & Travel):** Split by Shares & Percentages, Receipt Photo Attachments & Full-Screen Lightbox, Spotlight Quick Search (`⌘K`), Trip Wrap-Up & Group Archiving, Multi-Payer Expenses, Native Mobile Share Sheet (`navigator.share`).

---

## 🚀 Tier 1: High Impact & Quick Wins (Friction Reducers)

### 1. Dynamic On-Screen UPI QR Code (Desktop & Cross-Device)
- **Problem:** Currently, the `upi://` deep link only works on mobile devices with supported UPI apps installed. Clicking it on desktop or unsupported devices fails silently.
- **Solution:** A spring-animated modal that renders an interactive UPI QR code (standardized `upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...`) using a lightweight client QR generator (`qrcode.react` or standard canvas rendering).
- **Features:**
  - One-tap scan from phone (GPay, PhonePe, Paytm, CRED).
  - Copy UPI ID and transaction reference with tactile feedback.
  - Option to mark debt settled directly after payment confirmation.
- **Technical Path:** Pure client-side implementation; zero backend API changes required.

---

### 2. One-Tap WhatsApp & SMS Settlement Reminders
- **Problem:** Users often forget pending balances, requiring uncomfortable manual chasing.
- **Solution:** A "Remind via WhatsApp" button on debts and pending settlements that constructs a prefilled `https://wa.me/?text=...` URI.
- **Features:**
  - Prefilled polite message with debtor name, amount, group title, and FairShare settlement link.
  - SMS fallback link via standard `sms:?body=...`.
- **Technical Path:** Zero external messaging fees or third-party service dependencies.

---

### 3. Expense Categorization & Visual Spending Analytics
- **Problem:** All expenses are currently treated as generic monetary entries with only a description.
- **Solution:** Add structured categories (Food & Drinks, Groceries, Travel & Transit, Utilities, Housing/Rent, Entertainment, Miscellaneous).
- **Features:**
  - Tinted Apple-style icon pills for each category.
  - Segmented spending breakdown chart in Group Details and Dashboard.
  - Category filtering and monthly group expenditure summary.
- **Technical Path:** Add optional `category` string enum to backend `Expense` model and schema validation, default to `'general'`.

---

## 🍽️ Tier 2: Real-World Group Splitting Essentials

### 4. Itemized Bill Splitting (Dish-by-Dish / Itemized Splits)
- **Problem:** Equal splitting is unfair when only some group members order expensive dishes or alcohol. Custom manual calculation is slow and prone to errors.
- **Solution:** An Itemized Split mode in `ExpenseModal`:
  - Add items (Item name, price).
  - Select which members shared each item.
  - Taxes, service charges, discounts, and tips are distributed proportionally across participants.
- **Technical Path:** Frontend calculates individual paise shares using existing `splits` schema array without requiring schema changes.

---

### 5. Offline Support & Sync Queue (PWA Superpower)
- **Problem:** Trips and restaurant basements frequently have poor or zero cell reception.
- **Solution:** Utilize the existing PWA service worker and IndexedDB to store offline expense creations and settlements in a queue.
- **Features:**
  - Optimistic UI updates (expenses appear immediately with an "Offline / Pending Sync" badge).
  - Automatic background synchronization when network connectivity is restored (`navigator.onLine` and `sync` event).
- **Technical Path:** Lightweight IndexedDB wrapper or native `idb-keyval`.

---

### 6. Export to PDF & CSV Reports
- **Problem:** Group members need printable summaries for shared lease records, tax claims, or trip expense archiving.
- **Solution:** Export buttons in Group Details and Settlement History:
  - **CSV Export:** Standard table with Date, Description, Paid By, Category, Amount (₹), and Individual Splits.
  - **PDF Export:** Polished, print-ready expense sheet styled with FairShare branding.
- **Technical Path:** Client-side CSV generation and `html2canvas` / `jspdf` (already partly present in dependencies).

---

## 🤖 Tier 3: Next-Gen Automation & Intelligence

### 7. Smart Receipt Scanner (AI / OCR Bill Parsing)
- **Problem:** Manually typing long grocery or dinner receipts item by item is tedious.
- **Solution:** Snap a photo or upload a receipt image:
  - Extract subtotal, tax, tip, and line items.
  - Auto-populate the itemized split modal.
- **Technical Path:** Client-side `tesseract.js` for basic numbers/totals, or a lightweight backend proxy calling the Gemini Vision API for structured JSON extraction.

---

### 8. Recurring Expenses (Rent, Subscriptions, Utilities)
- **Problem:** Roommates split identical bills every month (Netflix, Spotify, WiFi, maid, rent) and forget to log them repeatedly.
- **Solution:** Recurring expense scheduler:
  - Set frequency (Monthly, Bi-weekly, Weekly).
  - Automated generation of pending expenses on the scheduled date.
- **Technical Path:** MongoDB background cron job or scheduled task trigger.

---

### 9. Multi-Currency Support with Instant FX Conversion
- **Problem:** International trips involve multiple currencies (USD, EUR, GBP, JPY, AED, etc.).
- **Solution:** Allow selecting the transaction currency when logging an expense. Automatically converts to INR (or group base currency) using cached daily exchange rates.
- **Technical Path:** Cached free FX API (e.g., Frankfurter API or ExchangeRate-API) with offline fallback.

---

## ⚡ Tier 4: Power User & Travel Experience

### 10. Split by Shares, Ratios, or Percentages (Unequal Splits)
- **Problem:** Expenses are currently split equally or by manual custom paise calculations. Doesn't account for couples (2 shares vs 1 share), variable trip days (stayed 2 nights vs 4 nights), or percentage contributions (60% / 40%).
- **Solution:** Add "By Shares" and "By Percentage" tabs in `ExpenseModal`.
- **Technical Path:** Pure client-side math converting ratios/shares into individual `amountPaise` entries in the existing `splits` schema. Zero backend changes required.

---

### 11. Receipt Photo Attachments & Full-Screen Lightbox
- **Problem:** Group members frequently ask for bill photos or need invoice proof for reimbursements.
- **Solution:** Optional image/receipt photo attachment in the expense modal. Displays a subtle thumbnail pill on expense rows that opens into an Apple-style fluid zoom lightbox.
- **Technical Path:** Lightweight image compression client-side, stored as an image URL or cloud storage reference on the `Expense` model.

---

### 12. Spotlight Quick Search & Command Palette (`Cmd + K` / `Ctrl + K`)
- **Problem:** Searching for past expenses, transactions, or specific members across multiple groups becomes tedious.
- **Solution:** Apple Spotlight-inspired command palette:
  - Search any past expense by title, date, or member across all groups.
  - Instant navigation shortcuts (*"Go to Goa Trip"*, *"Create new group"*, *"Add expense"*).
- **Technical Path:** Client-side modal index with keyboard shortcut listener.

---

### 13. Trip Wrap-Up & Group Archiving ("Settle & Freeze")
- **Problem:** Old vacation groups clutter the active dashboard long after debts are settled.
- **Solution:** A "Wrap Up Group" action available when all simplified debts reach ₹0:
  - Locks group from accidental edits or unwanted additions.
  - Generates a celebratory summary card (Total group spend, top contributors).
  - Moves the group to a collapsible "Archived Groups" section.
- **Technical Path:** Add `isArchived: { type: Boolean, default: false }` to `Group` model.

---

### 14. Multi-Payer Expenses ("Multiple People Paid")
- **Problem:** For large collective expenses (e.g., villa deposit or restaurant banquet), two people often split the payment at the counter (*"Alice paid ₹6,000 and Bob paid ₹4,000"*).
- **Solution:** Allow adding multiple payers with individual paid amounts that sum to the total bill, resolving debt balances accurately in one single transaction.
- **Technical Path:** Support array of payers or split settlement records.

---

### 15. Native Mobile Share Sheet (`navigator.share`)
- **Problem:** Copying invite links to the clipboard requires opening WhatsApp or Messages manually to find the contact.
- **Solution:** Use Web Share API (`navigator.share`) on mobile devices to trigger the native iOS/Android share drawer, letting users share directly to WhatsApp, Telegram, or iMessage in one tap with automatic fallback to clipboard copy on desktop.
- **Technical Path:** Standard browser API check `if (navigator.share) { navigator.share(...) }`.

