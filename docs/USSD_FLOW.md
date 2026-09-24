# USSD Menu Flow Specification (`*384*20220#`)

The NetworkCheck USSD gateway is engineered according to Africa's Talking session standards and optimized for sub-10-second feature phone timeouts.

---

## 1. Flow Diagram

```
[Dial *384*20220#]
       │
       ▼
 [Main Menu]
 1. Check my area
 2. Compare networks
 3. Report network problem
 4. Get result by SMS
 5. Help
 0. Exit
       │
 ┌─────┴──────────────────┬────────────────────────┬───────────────┐
 │                        │                        │               │
 ▼ (1)                    ▼ (2)                    ▼ (3)           ▼ (4)
[Select State]           [Select State]           [Select Op]     [Select State]
       │                        │                        │               │
       ▼                        ▼                        ▼               ▼
 [Select LGA]             [Select LGA]            [Select Issue]   [Select LGA]
       │                        │                        │               │
       ▼                        ▼                        ▼               ▼
[Area Ratings Display]  [Comparison Matrix]       [Select When]   [Direct SMS]
 1. Send SMS / 0. Exit   1. Send SMS / 0. Exit           │         (Session END)
                                                         ▼
                                                   [Select LGA]
                                                         │
                                                         ▼
                                                   [Save Report &
                                                    SMS Confirmation]
                                                    (Session END)
```

---

## 2. Africa's Talking Protocol Rules

- **`CON` Prefix:** Tells the telecom MSC to hold the radio channel open and prompt the handset user for another input.
- **`END` Prefix:** Tells the telecom MSC to terminate the session after displaying the final receipt message.
- **Text Parameter Accumulation:** Multi-step sessions accumulate choices concatenated by asterisks (e.g. `1*1*1` corresponds to *Check Area* &rarr; *Kaduna* &rarr; *Chikun*).
