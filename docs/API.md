# NetworkCheck REST & Webhook API Reference

All REST endpoints are rooted at `/api`. In development or production, CORS is enabled for web clients.

---

## 1. Public Geographic & Operator Metadata

### `GET /api/states`
Returns all supported Nigerian states.
```json
{
  "states": [
    { "id": 1, "name": "Kaduna", "code": "KD" },
    { "id": 2, "name": "Kano", "code": "KN" },
    { "id": 3, "name": "Federal Capital Territory (Abuja)", "code": "FCT" }
  ]
}
```

### `GET /api/states/:id/lgas`
Returns all Local Government Areas for a given state ID.
```json
{
  "stateId": 1,
  "lgas": [
    { "id": 1, "state_id": 1, "name": "Chikun" },
    { "id": 2, "state_id": 1, "name": "Kaduna North" },
    { "id": 3, "state_id": 1, "name": "Kaduna South" }
  ]
}
```

### `GET /api/operators`
Returns major Nigerian telecommunications network operators.
```json
{
  "operators": [
    { "id": 1, "name": "MTN Nigeria", "code": "MTN" },
    { "id": 2, "name": "Airtel Nigeria", "code": "AIRTEL" },
    { "id": 3, "name": "Globacom", "code": "GLO" },
    { "id": 4, "name": "9mobile", "code": "9MOBILE" }
  ]
}
```

---

## 2. Baselines & Comparisons

### `GET /api/network-baseline/compare?stateId=1&lgaId=1`
Returns comparative operator ratings and data source attribution.
```json
{
  "comparison": {
    "state": { "id": 1, "name": "Kaduna" },
    "lga": { "id": 1, "name": "Chikun" },
    "primarySource": {
      "name": "Nigerian Communications Commission (NCC) QoS Audit",
      "type": "Official",
      "lastUpdated": "2026-02-15"
    },
    "operators": [
      {
        "operator": { "id": 1, "name": "MTN Nigeria", "code": "MTN" },
        "baseline": {
          "voice_rating": "Good",
          "data_rating": "Good",
          "sms_rating": "Good"
        },
        "communityStats": {
          "totalReports": 14,
          "topIssue": "slow_data"
        }
      }
    ]
  }
}
```

---

## 3. Community Reports

### `POST /api/reports`
Submits a citizen report. Performs server-side Gemini multilingual classification (Hausa, Pidgin, English), salted SHA-256 phone hashing, and duplicate detection.
```json
// Request
{
  "state_id": 1,
  "lga_id": 1,
  "operator_id": 1,
  "issue_type": "slow_data",
  "description": "Internet baya aiki sosai tun safe a Sabon Tasha",
  "phone_number": "+2348031234567"
}

// Response (201 Created)
{
  "success": true,
  "report": {
    "id": 102,
    "reference": "NC-49201",
    "phone_masked": "+234 803 *** 4567",
    "issue_type": "slow_data",
    "ai_category": "mobile_data",
    "ai_severity": "moderate",
    "language": "Hausa",
    "source": "Community"
  },
  "aiClassification": {
    "language": "Hausa",
    "category": "mobile_data",
    "severity": "moderate",
    "confidence": 0.94
  }
}
```

---

## 4. Telecom Webhooks (Africa's Talking)

### `POST /api/ussd/webhook`
Standard callback URL for Africa's Talking USSD Gateway.
- Request payload format: `sessionId`, `serviceCode`, `phoneNumber`, `text`.
- Response format: `CON <menu>` or `END <message>`.

### `POST /api/sms/webhook`
Inbound SMS callback for Africa's Talking.
