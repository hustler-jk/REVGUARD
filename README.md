# REVGUARD — Revenue Leakage Intelligence Platform
**Cross-System Revenue Recovery Decision Engine**

---

## 1. What is REVGUARD?
REVGUARD is a cross-system **Revenue Leakage Intelligence Layer** that sits above existing ERP, CRM, Billing, and Payment systems. It correlates cross-lifecycle data, quantifies financial exposure and realistic recoverable amounts, clusters cases by shared root causes, attaches proactive leak immunization controls, and ranks actions by expected ₹ recovery.

### 🌟 Key Differentiators (Lead with these in your Pitch)
1. **Root-Cause Clustering (§7.8 - #1 Differentiator):**
   - Eliminates single-case whack-a-mole by grouping related leakages: *"1 Root Cause &rarr; 16 Cases &rarr; ₹42,000 Total Exposure"*.
   - Includes **Early-Warning Employee Risk (§7.4)** catching rogue slope patterns at **Week 2** before threshold breaches.
2. **Leak Immunization (§8.6):**
   - Attaches actionable, proactive ERP/CRM guardrails to seal root causes and block recurrence.
3. **Deterministic Financial Math (§8):**
   - Financial exposure & expected recovery amounts are **100% deterministic**; AI models never hallucinate dollar amounts.
4. **Tamper-Evident SHA-256 Audit Trail (§13):**
   - Cryptographically chained audit logging for financial compliance.

---

## 2. The 4 Hero Pitch Cases

| Case | Scenario | Technical Depth | Pitch Action |
|---|---|---|---|
| **Hero 1** | **Missing Invoice** (₹75,000) | Order marked COMPLETED, webhook dropped invoice generation &rarr; **Process Leakage**. | Shows cross-system mismatch detection. |
| **Hero 2** | **Employee Discount Pattern** (16 Cases / ₹42,000) | Employee `EMP-402` systematically approving over-policy discounts. | Pivot to **Root Cause View**: show 16 symptoms merged into **1 Root Cause** with Week 2 early-warning slope. |
| **Hero 3** | **Legitimate High-Value Refund** (₹50,000) | Statistically anomalous refund with valid VP SLA credit sign-off. | Shows model judgment: cleared as **NORMAL** with zero false alarms. |
| **Hero 4** | **Contract-vs-Billed Drift** (₹1,20,000) | GlobalTech committed to ₹6.0L ARR, billed only ₹4.8L across 4 quarters. | Demonstrates new contract reconciliation rule (§7.1). |

---

## 3. Quick Start (Run Locally)

### Step 1: Start Backend & Web Dashboard
```bash
# In project root
python backend/run_server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.
- Interactive Dashboard (all 6 screens): `http://localhost:8000`
- Interactive OpenAPI Swagger Docs: `http://localhost:8000/docs`

---

## 4. PostgreSQL & pgAdmin Setup (

By default, REVGUARD seamlessly runs on a local SQLite database for instant zero-config testing. To connect your local PostgreSQL 18 instance:

1. Open **pgAdmin 4**.
2. Right-click **Databases** &rarr; **Create** &rarr; **Database...** &rarr; Name: `revguard`.
3. Set your connection string in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/revguard
   ```
4. Restart the backend: `python backend/run_server.py`.

---

