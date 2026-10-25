# Spendly — Personal Finance & Expense Tracker

> **Spendly** is a production-quality, mobile-first personal finance application that combines the simplicity and elegance of Google Pay's transaction experience with robust personal expense tracking, automated balance management, multi-account ledger calculations, and visual analytics.

Spendly is **100% local-first and offline-capable**. All transaction ledgers, accounts, categories, and balances are stored securely in your browser's persistent IndexedDB via Dexie.js. No bank passwords, no API keys, and no paid backend subscriptions are required.

---

## Features

### 1. Account Setup & Opening Balance
* Onboarding setup with default currency (INR `₹`, USD `$`, EUR `€`, GBP `£`, and more).
* Starting account balance stored separately from ordinary transactions.
* Consequential balance adjustment protection requiring explicit confirmation.

### 2. Home Dashboard
* **Total Available Balance Card**: High-contrast, clean typography with one-tap eye privacy toggle to hide numbers from nearby onlookers.
* **Account Switcher**: Seamlessly view your combined net worth across all accounts or switch to a specific account (e.g. Bank Account, Cash Wallet).
* **Quick Actions**: Prominent 1-tap triggers:
  * `+ Add Money`: Fast credit recording with counterparty suggestions and celebration confetti.
  * `− Add Expense`: Lightning-fast 3-5 second expense entry with live balance projection.
  * `⇄ Transfer`: Internal transfers between accounts with zero net distortion to combined balance.
* **Monthly Overview**: Month-to-date money received, money spent, net cash flow, and budget progress.
* **Recent Transactions**: GPay-styled chronological transaction list with category icon, merchant/sender name, payment method, and amount.

### 3. Add Money (Received Income)
* Amount received (prominent numeric entry).
* Sender / Counterparty name with dynamic quick suggestion pills (e.g. Dinesh, Sakthi, Client).
* Category selector (Money Received, Salary, Allowance, Gift, Refund, Freelance, etc.).
* Destination account selector.
* Payment method (UPI, Cash, Debit Card, Credit Card, Net Banking).
* Optional note and UTR/Reference ID.
* Automatically credits destination account balance and updates combined net worth.

### 4. Add Expense (Ultra-Fast Entry)
* Autofocus amount with numeric keypad support.
* Live balance check: displays current available funds and projected balance.
* **Deficit Alert**: Visual warning banner if an expense exceeds available account balance.
* Horizontal category selector pills and dynamic subcategory chips (e.g. Food -> Breakfast, Lunch, Dinner, Restaurant, Food Delivery).
* Merchant/place name, payment method, and note.

### 5. Multi-Account Ledger & Internal Transfers
* **Formula**: `Current Balance = Opening Balance + Credits − Debits + Incoming Transfers − Outgoing Transfers`.
* Moving funds between two accounts (e.g. Bank to Cash) deducts the source account and credits the destination account while keeping the combined net worth strictly unchanged.
* Transfers are cleanly excluded from income and expense metrics.

### 6. GPay-Style Transaction History
* **Grouping**: Today, Yesterday, Earlier this week, This Month, and Older.
* **Multi-Field Search**: Real-time search by person's name, merchant, note, category name, amount, or reference ID.
* **Filters**: All, Received (+), Expenses (−), Transfers (⇄), Refunds (↺).
* **Advanced Filter Drawer**: Filter by account, category, or timeframe.
* **Transaction Receipt Modal**: Tap any transaction to view full receipt details, edit amounts, duplicate into a new entry, or delete with atomic balance reversal.

### 7. Reports & Analytics (Recharts)
* **Timeframes**: Today, This Week, This Month, Previous Month, and Custom Date Range.
* **KPI Metrics**: Total income, total expenses, net cash flow, largest single expense, daily spending average, and transaction count.
* **Daily Trend Chart**: Smooth area chart showing chronologically sorted spending and income flows.
* **Category Breakdown**: Interactive donut chart with percentages and drill-down subcategory totals.

### 8. Category & Subcategory Management
* Pre-configured with 12 expense categories and 8 income categories.
* Create custom categories with custom icons, colors, and subcategories.
* **Safe Deletion & Reassignment**: If a category has existing transactions, Spendly prompts you to reassign those transactions to another category before deleting, preventing orphaned records.

### 9. Budgets & Spending Limits
* Set overall monthly spending caps and category-specific targets.
* Real-time progress bars with color-coded warnings (Green < 80%, Amber 80–99%, Red ≥ 100%).

### 10. Data Backup, Export & Restore
* **CSV Export**: Export all transactions to standard CSV for spreadsheet analysis (Excel, Google Sheets).
* **JSON Backup**: Download a full JSON snapshot of accounts, categories, budgets, and transactions.
* **JSON Restore**: Choose between *Replace All* or *Safe Merge* to restore data without creating duplicates.
* **Clear History & Factory Reset**: Double-confirmation dialogs to clear transactions or reset the app safely.

### 11. Progressive Web App (PWA)
* Fully offline-functional application shell with service worker caching.
* Installable on Android (Chrome), iOS (Safari Add to Home Screen), and desktop.

---

## Technology Stack

* **Framework:** React 19 + TypeScript + Vite
* **Styling:** Tailwind CSS (Vanilla CSS variables, light/dark mode support)
* **Database:** IndexedDB with Dexie.js & `dexie-react-hooks`
* **Charts:** Recharts
* **Icons:** Lucide React
* **Dates:** date-fns
* **PWA:** vite-plugin-pwa (Workbox)
* **Testing:** Vitest (13 passing automated accounting & backup tests)

---

## Getting Started Locally

### Prerequisites
* Node.js v18+ (tested on Node v24)
* npm v9+

### Installation

1. Clone or navigate to the project directory:
   ```bash
   cd Spendly
   ```

2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Run automated test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

---

## Free Netlify Deployment

Spendly requires **zero backend services, API keys, or databases**, making it 100% compatible with Netlify's free starter tier.

### Deployment Steps

#### Option A: Deploy via GitHub (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Spendly personal finance app"
   git remote add origin https://github.com/<your-username>/spendly.git
   git push -u origin main
   ```
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **Add new site** > **Import an existing project** > **GitHub**.
4. Select your `spendly` repository.
5. The build settings are auto-detected from [`netlify.toml`](file:///c:/Users/dines/OneDrive/Desktop/Spendly/netlify.toml):
   * **Build command:** `npm run build`
   * **Publish directory:** `dist`
6. Click **Deploy spendly**. Netlify will build and provide a secure HTTPS URL (e.g. `https://spendly.netlify.app`).

#### Option B: Netlify CLI Manual Deploy
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Build the production bundle:
   ```bash
   npm run build
   ```
3. Deploy the `dist` folder:
   ```bash
   netlify deploy --prod --dir=dist
   ```

### SPA Routing & PWA Configuration
Spendly includes both [`_redirects`](file:///c:/Users/dines/OneDrive/Desktop/Spendly/public/_redirects) and [`netlify.toml`](file:///c:/Users/dines/OneDrive/Desktop/Spendly/netlify.toml) configured with SPA route fallbacks (`/* -> /index.html 200`), ensuring that direct URL navigation and PWA caching work seamlessly without 404 errors.

---

## Accounting Conventions & Invariants

1. **Balance Formula**:
   $$\text{Current Balance} = \text{Opening Balance} + \text{Credits} - \text{Debits} + \text{Incoming Transfers} - \text{Outgoing Transfers}$$
2. **Transfer Invariance**:
   An internal transfer from Account $A$ to Account $B$ decreases Account $A$ by $X$ and increases Account $B$ by $X$. Across the combined balance of all tracked accounts:
   $$\Delta \text{Combined Balance} = (-X) + (+X) = 0$$
3. **Refund Convention**:
   Refunds are treated as positive credits to the destination account, increasing available balance and tracked with income/reimbursements without distorting expense totals.
4. **Precision**:
   All monetary calculations use strict 2-decimal rounding with `Number.EPSILON` to prevent IEEE 754 floating-point drift.

---

## Privacy & Persistence Notes

* **Local Storage**: All data is stored in the browser's IndexedDB on the device where you use Spendly.
* **Device Backups**: Because browser local storage can be wiped if you clear site cookies or browser data, use the **Settings > Backup & Export** feature to regularly save a `.json` backup file.
* **No Synchronization**: Spendly does not sync across devices automatically unless an optional cloud backup is manually imported.

---

## License

MIT License. Built with modern web standards and fintech design aesthetics.
