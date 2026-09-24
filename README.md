# NetworkCheck Nigeria 🇳🇬

> **USSD & SMS-Based Connectivity & Bank Network Intelligence Service**  
> *Helping citizens, POS agents, traders, and rural communities discover verified mobile telecom coverage and live bank network status without needing mobile internet or smartphones.*

---

## 📌 Product Overview

Across Nigeria, millions of citizens rely on mobile networks and financial institutions for daily commerce, emergency communication, education, and access to digital services. However, millions using basic feature phones ("torchlight phones") or operating in rural corridors with zero data balance cannot access heavy web coverage maps, speed-test applications, or online banking status pages.

Furthermore, bank network downtime, delayed interbank transfer alerts (NIP timeouts), and POS terminal decline debits cause immense financial stress for market traders and POS operators.

**NetworkCheck** provides a unified, low-bandwidth, and offline-capable solution:

1. **Telecom Network Checker (`*384*244#` & Web):**
   - Check mobile network performance (Voice & Data) across Nigerian States and LGAs (Kaduna State geographic focus, scalable across all 774 LGAs).
   - Compare MTN, Airtel, Globacom, and 9mobile side-by-side.
   - Report local connectivity outages (no network, dropped calls, slow data) without mobile internet.
   - Receive verified results via SMS.

2. **Bank Network Status Monitor (`*384*244#` -> Option 4 & Web):**
   - Live network status of major Nigerian commercial banks and fintechs (GTBank, Access Bank, Zenith Bank, FirstBank, UBA, OPay, Moniepoint, Kuda, Stanbic IBTC, Fidelity, PalmPay, Union Bank).
   - Real-time success rates for **Instant Interbank Transfers (NIP)**, **USSD Banking Codes** (`*737#`, `*901#`, `*966#`, `*894#`, `*919#`, `*955#`, `*5573#`, etc.), and **Merchant POS Terminals**.
   - Citizen reporting for bank network issues (transfers debited without credit, POS declined with debit, USSD timeouts).
   - Critical advisory for POS operators and traders before executing high-value payments.

3. **Regulatory Baseline & Compliance Audit:**
   - Strict zero-fabrication provenance attribution: distinguishes **Official NCC Baseline Data**, **Community-Reported Data**, and **Demo/Test Data**.
   - Standardized CSV and Official PDF dossiers exportable directly for Nigerian Communications Commission (NCC) Quality of Service (QoS) compliance.
   - Multilingual AI classification via server-side Gemini (Hausa, Nigerian Pidgin, English).

---

## 🏦 Bank Network Status Feature

### Why It Matters
In Nigeria, POS operators and market traders regularly face customers asking: *"Which bank network dey work now?"* Failed interbank transfers or debited POS transactions with delayed reversals lock up trading capital. NetworkCheck empowers anyone to check bank network health on **any basic phone via free USSD** or on the web dashboard.

### How to Check on USSD (`*384*244#`)
1. Dial `*384*244#` on any phone.
2. Select **4. Check Bank Networks**.
3. Choose:
   - **1. All Banks Overview:** View which banks have instant transfers working vs. which banks have delays.
   - **2–6. Specific Bank (GTBank, Access, Zenith, FirstBank, Moniepoint/OPay):** View real-time transfer success %, USSD code reliability, and POS rates.
   - Press **1** to dispatch the bank status directly to your phone via SMS.
   - **7. Report Bank Down:** Report a failed transfer, POS decline with debit, or USSD code timeout to alert the community.

### How to Check on the Web Dashboard
1. Click the **Bank Networks** tab in the top navigation bar.
2. Filter banks by category (*Commercial Banks* or *FinTech / POS Networks*) or by status (*Working*, *Slow / Delays*, *Outage*).
3. Inspect instant transfer %, USSD code success %, and POS transaction rates.
4. Click **Report Bank Network Down** to submit an outage report and update the live community telemetry.

---

## 🚀 Guide: How to Run the Application

### 1. Prerequisites
- **Node.js:** Version 20.x or higher (tested on Node 22)
- **npm:** Version 10.x or higher
- **PostgreSQL (Optional for local, required for Railway production):** If PostgreSQL is not configured, NetworkCheck automatically activates in-memory `DEMO_MODE` with zero setup needed!

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone <repository-url>
cd networkcheck
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

Key environment variables:
| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Local web server and API port | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DEMO_MODE` | Standalone mode with in-memory database & simulated SMS | `true` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:password@localhost:5432/networkcheck` |
| `GEMINI_API_KEY` | Google Gemini API key for server-side multilingual NLP | Injected by AI Studio / custom key |
| `AFRICASTALKING_USERNAME` | Africa's Talking sandbox or production username | `sandbox` |
| `AFRICASTALKING_API_KEY` | Africa's Talking API key | `atsk_...` |
| `AFRICASTALKING_SENDER_ID`| Custom alphanumeric SMS sender ID | `NetworkChk` |
| `JWT_SECRET` | Secret key for signing admin access tokens | `your_secure_jwt_secret` |
| `NDPR_SALT` | Cryptographic salt for citizen phone hashing | `your_ndpr_hash_salt` |

### 4. Running the Development Server
Start the unified full-stack application (Express backend + Vite React frontend on port 3000):
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 5. Running Automated Tests
Run the 10-point automated test suite:
```bash
npm test
# Or run directly via tsx:
npx tsx server/src/tests/runTests.ts
```
**Test Coverage Includes:**
- State & LGA lookups (Kaduna + scalable architecture)
- Multi-operator baseline comparisons (MTN, Airtel, Glo, 9mobile)
- Community report creation with salted NDPR phone hashing
- Gemini AI multilingual classification (Hausa, Pidgin, English) with offline resilience
- USSD state machine flows (`*384*244#` check area, compare, SMS dispatch)
- USSD problem reporting flow
- CSV baseline validation and error detection
- Admin JWT authentication
- SMS simulation & outbox logging
- Nigerian Bank Network telemetry & USSD bank inspection flow

### 6. Building for Production
Compile the client application and verify TypeScript typing:
```bash
npm run build
```

### 7. Running with Docker
A multi-stage `Dockerfile` is included for containerized deployments:
```bash
# Build the Docker image
docker build -t networkcheck .

# Run the container
docker run -p 3000:3000 -e DEMO_MODE=true networkcheck
```

### 8. Deploying to Render (Recommended) 🚀
NetworkCheck is fully configured for [Render](https://render.com) using the included `render.yaml` blueprint:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Push your repository to GitHub or GitLab.
2. Go to your [Render Dashboard](https://dashboard.render.com) &rarr; **New +** &rarr; **Blueprint**.
3. Select this repository. Render automatically provisions:
   - Full-stack web service (`runtime: node`, build: `npm ci && npm run build`, start: `npm start`).
   - Free PostgreSQL database (`networkcheck-db`) with automatic `DATABASE_URL` linking.
   - Built-in zero-config `DEMO_MODE=true` fallback.
   - Health check endpoint at `/health`.
4. Add your Africa's Talking credentials (`AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY`) and `GEMINI_API_KEY`.
5. Point your Africa's Talking USSD & SMS callback URLs to:
   - USSD Webhook: `https://<your-render-subdomain>.onrender.com/ussd/webhook`
   - SMS Webhook: `https://<your-render-subdomain>.onrender.com/sms/webhook`
   - Delivery Reports: `https://<your-render-subdomain>.onrender.com/delivery-reports`

*See [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) for detailed step-by-step documentation and configuration tips.*

### 9. Deploying to Railway (Alternative)
NetworkCheck also maintains `railway.json` support:
1. Push your code to GitHub.
2. Log in to [Railway](https://railway.app) and create a new project from your GitHub repo.
3. Add a **PostgreSQL** database service in your Railway project.
4. Railway automatically binds `DATABASE_URL` and `PORT`.
5. Set `DEMO_MODE=false` in Railway variables to persist all community reports and imports to PostgreSQL.
6. The container builds automatically and mounts health checks at `/health`.

---

## 🛠️ Guide: How to Add Everything (Extensibility Guide)

NetworkCheck is designed to be easily extensible. Here is how to add new data and integrations across the application:

### 1. How to Add a New Nigerian State
To add a new state (e.g. Kano, Lagos, Abuja FCT, Rivers):
1. **In `server/src/db/seedData.ts`**:
   Add to `initialStates`:
   ```ts
   { id: 6, name: 'Kano', code: 'KN' },
   { id: 7, name: 'Lagos', code: 'LA' },
   { id: 8, name: 'Abuja (FCT)', code: 'FC' },
   ```
2. **In `server/src/db/schema.sql`** (for PostgreSQL):
   ```sql
   INSERT INTO states (name, code) VALUES ('Kano', 'KN'), ('Lagos', 'LA'), ('Abuja (FCT)', 'FC');
   ```

### 2. How to Add New Local Government Areas (LGAs)
To add LGAs for any state:
1. **In `server/src/db/seedData.ts`**:
   Add to `initialLgas` referencing the parent `state_id`:
   ```ts
   { id: 24, state_id: 6, name: 'Kano Municipal' },
   { id: 25, state_id: 6, name: 'Fagge' },
   { id: 26, state_id: 7, name: 'Ikeja' },
   ```
2. **In `server/src/db/schema.sql`**:
   ```sql
   INSERT INTO lgas (state_id, name) VALUES (6, 'Kano Municipal'), (6, 'Fagge'), (7, 'Ikeja');
   ```

### 3. How to Add a New Telecom Operator
To add a new mobile operator or MVNO (e.g. Ntel, Spectranet, Starlink, or 5G MVNO):
1. **In `server/src/db/seedData.ts`**:
   ```ts
   { id: 5, name: 'Ntel', code: 'NTEL' },
   ```
2. **In `server/src/db/schema.sql`**:
   ```sql
   INSERT INTO operators (name, code) VALUES ('Ntel', 'NTEL');
   ```

### 4. How to Add a New Bank or FinTech POS Network
To add a new bank, microfinance bank, or payment switch (e.g., Sterling Bank, Wema Bank, Ecobank, Jaiz Bank):
1. **In `server/src/db/seedData.ts`**:
   Add an entry to `initialBanks`:
   ```ts
   {
     id: 13,
     name: 'Wema Bank (ALAT)',
     code: 'WEMA',
     ussd_code: '*945#',
     category: 'commercial', // 'commercial' | 'fintech' | 'microfinance'
     status: 'operational',  // 'operational' | 'degraded' | 'down'
     transfer_success_rate: 97,
     ussd_success_rate: 96,
     pos_success_rate: 98,
     last_updated: 'Just now',
     source: 'Community',
     active_reports_count: 0,
     notes: 'Instant ALAT and USSD *945# transfers operating smoothly.',
   }
   ```
2. The bank automatically appears in the Web Bank Network Status page, search filters, and the USSD banking menu!

### 5. How to Import Official NCC Baseline Datasets (CSV)
Administrators can upload verified regulatory datasets through the **Baseline Data** tab (`/baselines`):
- **CSV Headers Format:**
  ```csv
  state,lga,operator,voice_rating,data_rating,sms_rating,source_name,source_type,source_url,dataset_version,last_updated,notes
  Kaduna,Chikun,MTN,Good,Good,Good,NCC Q1 Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-01,Verified urban drive test
  Kaduna,Zaria,Airtel,Good,Fair,Good,NCC Q1 Audit,Official,https://ncc.gov.ng,NCC-2026-Q1,2026-03-01,Educational corridor
  ```
- **Validation Rules:**
  - Ratings must be one of: `Good`, `Fair`, `Poor`, `No Service`.
  - State and LGA must exist in the database.
  - Source type must be `Official`, `Community`, or `Demo`.
  - Uploading performs a 2-step validation preview before inserting or updating records.

### 6. How to Export NCC Baseline Compliance Dossiers
In the **Reports** register:
1. Filter reports by date, LGA, operator, or severity.
2. Click **NCC Compliance Export**:
   - **Download Standardized NCC CSV:** Formatted with regulatory columns, docket numbers, and NDPR phone hashes.
   - **Download Official NCC PDF Dossier:** Executive audit document with NCC crest styling, outage KPIs, incident breakdown, and regulatory sign-off blocks.

### 7. How to Connect Live Africa's Talking API & Use the Simulators

NetworkCheck is engineered to work smoothly in both **Real Production Mode** (live Africa's Talking telco gateway) and **Interactive Simulator Mode** (for hackathon demos and offline testing).

#### A. Running in Real Africa's Talking Mode (Live Telco Gateway)
1. Register for an account on [Africa's Talking](https://africastalking.com).
2. Grab your **API Key** from the Africa's Talking dashboard.
3. Configure your environment variables on Railway or in `.env`:
   ```bash
   DEMO_MODE=false
   AFRICASTALKING_USERNAME=your_username # Use "sandbox" or your production username
   AFRICASTALKING_API_KEY=atsk_your_secret_key_here
   AFRICASTALKING_SENDER_ID=NetCheck     # Optional (leave blank in sandbox)
   ```
4. **Configure Webhook URLs in your Africa's Talking Dashboard:**
   - **USSD Callback URL:** Set to `https://your-app.up.railway.app/api/ussd/webhook` (or `https://your-app.up.railway.app/ussd`)
   - **Incoming SMS Callback URL:** Set to `https://your-app.up.railway.app/api/sms/webhook` (or `https://your-app.up.railway.app/sms`)
   - **SMS Delivery Reports Callback URL:** Set to `https://your-app.up.railway.app/api/sms/delivery-reports` (or `https://your-app.up.railway.app/delivery-reports`)

#### B. Using the Official Africa's Talking Web Simulator
Africa's Talking provides a web phone simulator that tests real webhook requests against your deployed Railway instance:
1. Open [https://simulator.africastalking.com:1517/](https://simulator.africastalking.com:1517/) in your browser.
2. Enter your Africa's Talking **Username** (e.g. `sandbox`) and **API Key**.
3. On the simulated phone keypad, dial `*384*244#` (or your assigned USSD service code) and press Call.
4. You will see the live interactive NetworkCheck menu responding directly from your Railway server!
5. You can also send an SMS from the web simulator to your assigned shortcode (e.g. text `"BANK"` or `"CHIKUN"`) and observe the instant automated reply.

#### C. Using the Built-in In-App Simulators
If you are developing locally or presenting a live demonstration without wanting to connect an external dashboard:
1. Click **Dial *384*244#** in the top navigation bar.
2. The modal provides three integrated tabs:
   - **📱 Handset USSD (*384*244#):** Interactive feature phone ("torchlight phone") with LCD display and 12-key keypad to test all USSD flows (Check Area, Compare Networks, Report Issue, Check Bank Networks, SMS dispatch).
   - **📩 Two-Way SMS Tester:** Simulate a citizen texting `"BANK"`, `"CHIKUN"`, `"ZARIA"`, `"HELP"`, or `"REPORT MTN KADUNA NO NETWORK"` and see the automated reply immediately.
   - **🌍 Railway & AT Guide:** Live diagnostic status card showing whether you are connected to live AT or simulator, plus one-click copyable webhook URLs tailored to your active domain!
3. Click **SMS Outbox** in the navigation bar to inspect every dispatched and received SMS in real time with NDPR masking.

### 8. How to Configure Server-Side Gemini AI
NetworkCheck uses Google Gemini (via `@google/genai` TypeScript SDK) to automatically translate, categorize, and score citizen outage complaints in Hausa, Nigerian Pidgin, and English:
1. Provide your `GEMINI_API_KEY` in `.env` (or via AI Studio secrets).
2. The service uses `gemini-3.8-flash` for low-latency JSON classification.
3. If the Gemini API is temporarily unavailable (e.g. rate limit / 503), the built-in offline linguistic fallback automatically classifies the complaint so citizen reports are never lost!

---

## 🔒 Privacy & NDPR Compliance

NetworkCheck strictly complies with the **Nigeria Data Protection Regulation (NDPR)**:
- **No Raw Phone Numbers Stored:** Citizen phone numbers are irreversibly hashed using HMAC SHA-256 with a secret server-side salt before being written to the database.
- **Auditable Masking:** All UI views display phone numbers with the middle digits masked (e.g., `+234 803 *** 1492`).
- **Data Minimization:** No unnecessary personal identifying data is requested over USSD or web forms.

---

## 📄 License & Attribution
Licensed under the Apache-2.0 License. Built for telecommunications accessibility and civic connectivity intelligence in Nigeria.
