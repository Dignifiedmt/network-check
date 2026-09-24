# Cybersecurity & NDPR Privacy Standards

NetworkCheck enforces strict security and privacy controls aligned with the **Nigeria Data Protection Act (NDPA)** and the **Nigeria Data Protection Regulation (NDPR)**.

---

## 1. Phone Number Salted Hashing Pipeline

Raw MSISDNs dialed over USSD or texted via SMS are never stored in plain text:

```
[Citizen Phone: +2348031234567]
             │
             ▼
[Normalize: 2348031234567]
             │
             ▼
[HMAC SHA-256 + Server Salt]
             │
             ▼
[Persistent Storage: 9f82c...64char hex]
```

- **One-Way Irreversible:** Prevents identification if the database is audited or exported.
- **Deterministic:** Allows the server to detect duplicate outage spam from the same handset within a short time window.
- **Masked Presentation:** Admin audit views only ever see `+234 803 *** 4567`.

---

## 2. Access Control & Protection

- **Signed JWT:** Administrative routes require Bearer tokens with expiration.
- **Bcrypt:** Passwords hashed with standard 10 salt rounds.
- **Helmet & CORS:** HTTP security headers configured for containerized deployment.
- **Non-Root Container:** Docker container executes under unprivileged `node` user.
