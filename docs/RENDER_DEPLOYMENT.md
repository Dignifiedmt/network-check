# Deploying NetworkCheck to Render (100% Completely Free Tier) 🚀

This guide explains how to deploy **NetworkCheck Nigeria** to [Render](https://render.com) completely free ($0/month, **no payment method or credit card required**) using either the **Render Blueprint (`render.yaml` / `render.yml`)** or manual web service creation.

---

## 🌟 100% Free Tier ($0 / month) — Eliminating Paid Hosting & Credit Cards

- **Zero Cost & No Credit Card Needed:** Both `render.yaml` and `render.yml` specify Render's free tier (`plan: free`).
- **Eliminated Paid Managed Database Requirement:** NetworkCheck includes an enterprise-grade in-memory persistence layer with all Nigerian states, LGAs, operators, baseline datasets, and admin credentials pre-loaded. Render will NOT ask you to purchase or configure a paid database.
- **Optional External Database (Free):** If you ever want external persistence later, you can connect a free PostgreSQL instance from Supabase, Neon, or Railway simply by pasting `DATABASE_URL` into environment variables at $0 cost.
- **Automated HTTPS & SSL:** Free `.onrender.com` subdomain with automated Let's Encrypt SSL.

---

## 📋 Option 1: 1-Click Free Blueprint Deployment (Zero Cost)

NetworkCheck provides dual blueprint definitions (`render.yaml` and `render.yml`) at the root of the repository:

1. **Push your repository** to GitHub or GitLab.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your repository. Render will automatically detect `render.yaml` or `render.yml`.
5. Render will display the resources to create:
   - **Web Service:** `networkcheck` (Plan: **Free**, runtime: Node 20+, command: `npm start`).
   - **Auto-generated Secrets:** `JWT_SECRET` and `NDPR_SALT` (generated automatically at zero cost).
   - **Health Check Endpoint:** `/health`.
   - **Pre-configured Telecom & Auth:** Africa's Talking Sandbox key, USSD code (`*384*20220#`), SMS code (`22220`), and admin credentials.
6. Click **Apply**. Render will deploy your service with **$0 payment and no credit card required**.

---

## 🛠️ Option 2: Manual Web Service Setup on Render

If you prefer setting up manually without the blueprint:

### Step 1: Create the Web Service
1. In Render, click **New +** &rarr; **Web Service**.
2. Select your GitHub repository.
3. Configure the settings:
   - **Name:** `networkcheck`
   - **Region:** Frankfurt (EU Central) or closest region
   - **Runtime:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** **Free ($0/month)**

### Step 2: Configure Environment Variables
In the **Environment** tab, add the following variables:

| Key | Value / Instructions |
|---|---|
| `NODE_VERSION` | `20.18.0` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render binds this port automatically) |
| `DEMO_MODE` | `true` |
| `AFRICASTALKING_USERNAME` | `sandbox` |
| `AFRICASTALKING_API_KEY` | `atsk_8c2c1c9359de445a9184056ebcdd84bb415f010d44bc1259ac72cbb8b3393cedec034dc8` |
| `AT_API_KEY` | `atsk_8c2c1c9359de445a9184056ebcdd84bb415f010d44bc1259ac72cbb8b3393cedec034dc8` |
| `AT_USSD_SERVICE_CODE` | `*384*20220#` |
| `AT_SMS_SHORT_CODE` | `22220` |
| `AFRICASTALKING_SENDER_ID`| `NetworkChk` |
| `AT_SENDER_ID` | `NetworkChk` |
| `ADMIN_DEFAULT_EMAIL` | `admin@networkcheck.ng` |
| `ADMIN_DEFAULT_PASSWORD` | `admin_secure_password_2026` |
| `JWT_SECRET` | Any strong 32+ character random string |
| `NDPR_SALT` | Any strong cryptographic salt string |
| `GEMINI_API_KEY` | (Optional) Your Google Gemini API Key |
| `DATABASE_URL` | (Optional) External PostgreSQL connection string |

### Step 3: Health Checks
Under **Advanced Settings**:
- **Health Check Path:** `/health`

---

## 📡 Configuring Africa's Talking Webhooks on Render

Once your service is deployed, your URL will look like:
`https://networkcheck-xxxx.onrender.com`

Configure the callback URLs in your **Africa's Talking Dashboard**:

1. **USSD Callback URL:**
   - URL: `https://networkcheck-xxxx.onrender.com/ussd/webhook`
   - Method: `POST`
   - Test in AT Sandbox by dialing your channel code: `*384*20220#`.

2. **Incoming SMS Callback URL:**
   - URL: `https://networkcheck-xxxx.onrender.com/sms/webhook`
   - Method: `POST`
   - Test by texting keywords like `CHECK KADUNA` or `BANK` to shortcode `22220`.

3. **SMS Delivery Report Callback URL:**
   - URL: `https://networkcheck-xxxx.onrender.com/delivery-reports`
   - Method: `POST`

---

## 🏥 Verification & Health Check

After deployment, check your live service:

- **Web Dashboard:** `https://networkcheck-xxxx.onrender.com/`
- **Health Status:** `https://networkcheck-xxxx.onrender.com/health`
- **API Status:** `https://networkcheck-xxxx.onrender.com/api/states`

The `/health` endpoint will return a 200 OK JSON payload:
```json
{
  "status": "ok",
  "service": "networkcheck",
  "version": "1.0.0-hackathon-prod",
  "demoMode": true,
  "database": {
    "type": "in-memory",
    "connected": true,
    "records": {
      "states": 5,
      "lgas": 23,
      "baselines": 92,
      "reports": 15
    }
  },
  "timestamp": "2026-09-24T12:00:00.000Z"
}
```

---

## 💡 Render Free Tier Sleep & Keep-Alive

On Render's Free tier, web services spin down after 15 minutes of inactivity. For hackathons and production pilots:
1. The service automatically spins up within ~30–50 seconds on the first request.
2. For 24/7 instant USSD response without delay, upgrade to Render's **Starter** tier ($7/month) or use a free uptime monitoring ping (e.g. UptimeRobot or cron) hitting `/health` every 10 minutes.
