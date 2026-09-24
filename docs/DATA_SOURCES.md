# Data Sources & Anti-Fabrication Principles

## 1. Provenance Triad

NetworkCheck implements a zero-fabrication policy. All displayed results are mapped to one of three strictly isolated sources:

| Source Type | Description | Display Badge |
|---|---|---|
| **Official** | Imported directly from Nigerian Communications Commission (NCC) published Quality of Service (QoS) drive-test bulletins and operator compliance reports. | `Source: Official NCC dataset` |
| **Community** | Crowd-sourced citizen problem submissions recorded via USSD (`*384*244#`) and SMS. Always indicates sample count. | `Source: Community reports (Based on N reports)` |
| **Demo / Test** | Synthetic fixture data used during development and hackathon testing. Never conflated with real measurements. | `DEMO DATA — not real network measurements` |

---

## 2. Regulatory Baselines (Kaduna Focus)

Kaduna State comprises 23 LGAs. The platform seeds verified baseline ratings across major urban, suburban, and rural corridors:
- **Chikun LGA:** High residential & business density (MTN: Good/Good, Airtel: Good/Fair, Glo: Fair/Fair).
- **Kaduna North LGA:** Central commercial & administrative district.
- **Kaduna South LGA:** Industrial and dense urban corridor.
- **Igabi LGA:** Major transit and rural farming communities.
- **Zaria LGA:** Educational and commercial hub.

---

## 3. Standardized NCC Baseline Compliance Export Specification

Administrators can export community-reported telemetry directly into standardized formats configured for the Nigerian Communications Commission (NCC) Quality of Service (QoS) enforcement divisions:

### Export Formats:
1. **Standardized NCC Compliance CSV:**
   - Formal header block with Commission Docket ID, Reporting Period, Audit Jurisdiction, Compliance Officer, and NDPR Verification.
   - Standardized columns:
     - `Compliance_Ref`: Unique regulatory incident identifier (`NC-XXXXX`).
     - `Submission_Timestamp`: Standardized ISO-8601/WAT date & time.
     - `State_Code` & `State_Name`: Administrative state division.
     - `LGA_Name`: Standardized Local Government Area.
     - `Operator_Code` & `Operator_Name`: MNO identifiers (MTN, Airtel, Globacom, 9mobile).
     - `QoS_Category`: Official NCC QoS parameter (Voice Call Retention, Call Setup Success Rate, Data Latency/Throughput, Base Station Availability).
     - `Reported_Issue`: Specific defect code (`slow_data`, `dropped_calls`, `no_network`, etc.).
     - `Severity_Grade`: Categorized according to regulatory breach levels (Grade-1 Critical Outage, Grade-2 Degraded Service, Grade-3 Minor Quality Deviation).
     - `Language_Detected`: Multilingual tag (Hausa, Nigerian Pidgin, English).
     - `Citizen_Narrative`: Citizen description logged via USSD or SMS.
     - `Data_Provenance`: Mandatory source badge (`Community-Reported`, `Official NCC Baseline`, or `DEMO TEST DATA`).
     - `NDPR_MSISDN_Mask`: Masked citizen phone for privacy compliance (`+234 803 *** 1234`).
     - `Integrity_Hash`: HMAC SHA-256 salted non-repudiation signature.
     - `Verification_Status`: Validation state.

2. **Official NCC Compliance PDF Dossier:**
   - Federal Green header & Nigerian Communications Commission crest styling.
   - Formal docket block, audit jurisdiction, and generation timestamp.
   - Executive QoS summary cards (Critical Outages, Data Latency Breaches, Voice Call Drops).
   - Operator incident distribution table with civic dissatisfaction rates.
   - Comprehensive community incident evidence log.
   - Regulatory attestation oath and compliance officer signature blocks.
