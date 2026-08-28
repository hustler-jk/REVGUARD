import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models import Customer, Contract, CanonicalOrder, RevenueCase, RootCause, AuditLog, GroundTruth
from app.services.rules import rule_engine
from app.services.financial import financial_engine
from app.services.immunization import immunization_engine
from app.services.root_cause_clustering import root_cause_clustering_engine
from app.services.audit import audit_service
from app.ml.churn_model import churn_model

def seed_database(db: Session):
    """
    Seeds the database with canonical customer, contract, order, and case data,
    including the 4 HERO CASES and injected ground truth.
    """
    # Clean existing data
    db.query(AuditLog).delete()
    db.query(RevenueCase).delete()
    db.query(RootCause).delete()
    db.query(CanonicalOrder).delete()
    db.query(Contract).delete()
    db.query(Customer).delete()
    db.query(GroundTruth).delete()
    db.commit()

    now = datetime.utcnow()

    # 1. SEED CUSTOMERS
    customers_data = [
        {"id": "CUST-101", "name": "GlobalTech Enterprise", "segment": "Enterprise", "lifetime_rev": 1850000.0, "status": "ACTIVE"},
        {"id": "CUST-102", "name": "Apex Cloud Systems", "segment": "Enterprise", "lifetime_rev": 920000.0, "status": "ACTIVE"},
        {"id": "CUST-103", "name": "Nexus Retail Corp", "segment": "Mid-Market", "lifetime_rev": 450000.0, "status": "CHURN_RISK"},
        {"id": "CUST-104", "name": "HyperScale AI Labs", "segment": "Enterprise", "lifetime_rev": 1200000.0, "status": "ACTIVE"},
        {"id": "CUST-105", "name": "FinEdge Payments", "segment": "Mid-Market", "lifetime_rev": 380000.0, "status": "ACTIVE"},
        {"id": "CUST-106", "name": "Vanguard Logistics", "segment": "Enterprise", "lifetime_rev": 750000.0, "status": "CHURN_RISK"},
        {"id": "CUST-107", "name": "Orbital Commerce", "segment": "SMB", "lifetime_rev": 120000.0, "status": "ACTIVE"},
        {"id": "CUST-108", "name": "Zenith Healthcare", "segment": "Enterprise", "lifetime_rev": 640000.0, "status": "ACTIVE"},
    ]

    for c in customers_data:
        # Run ML churn model for initial prediction
        churn_inputs = {
            "payment_failure_count": 3 if c["status"] == "CHURN_RISK" else 0,
            "overdue_invoice_days": 42.0 if c["status"] == "CHURN_RISK" else 2.0,
            "support_escalation_count": 4 if c["status"] == "CHURN_RISK" else 1,
            "contract_tenure_months": 18.0,
            "order_velocity_pct_change": -35.0 if c["status"] == "CHURN_RISK" else 12.0
        }
        pred = churn_model.predict_customer(churn_inputs)
        cust_obj = Customer(
            customer_id=c["id"],
            name=c["name"],
            segment=c["segment"],
            status=c["status"],
            lifetime_revenue=c["lifetime_rev"],
            churn_probability=pred["churn_probability"],
            revenue_at_risk=round(c["lifetime_rev"] * 0.25 * pred["churn_probability"], 2),
            shap_factors=pred["shap_factors"],
            created_at=now - timedelta(days=random.randint(60, 365))
        )
        db.add(cust_obj)
    db.commit()

    # 2. SEED CONTRACTS
    contracts_data = [
        # HERO CASE 4: Contract agreed amount ₹6,00,000 vs billed ₹4,80,000 -> ₹1,20,000 drift
        {
            "contract_id": "CONT-2026-HERO4",
            "customer_id": "CUST-101",
            "agreed_amount": 600000.0,
            "terms": "Annual Dedicated Enterprise Capacity",
            "start_date": now - timedelta(days=330),
            "end_date": now + timedelta(days=35),
            "status": "ACTIVE"
        },
        {
            "contract_id": "CONT-2026-002",
            "customer_id": "CUST-102",
            "agreed_amount": 400000.0,
            "terms": "Multi-Region Cloud Subscription",
            "start_date": now - timedelta(days=200),
            "end_date": now + timedelta(days=165),
            "status": "ACTIVE"
        },
        {
            "contract_id": "CONT-2026-003",
            "customer_id": "CUST-104",
            "agreed_amount": 850000.0,
            "terms": "Enterprise High-Performance Compute",
            "start_date": now - timedelta(days=150),
            "end_date": now + timedelta(days=215),
            "status": "ACTIVE"
        }
    ]
    for ct in contracts_data:
        db.add(Contract(**ct))
    db.commit()

    # 3. SEED ORDERS & HERO CASES
    orders_to_create = []

    # HERO CASE 1: Missing invoice on completed ₹75,000 order
    hero1_order = CanonicalOrder(
        order_id="ORD-HERO-1001",
        customer_id="CUST-102",
        contract_id="CONT-2026-002",
        order_date=now - timedelta(days=14),
        order_amount=75000.0,
        currency="INR",
        order_status="COMPLETED",
        invoice_id=None,
        invoice_amount=None,
        invoice_status="UNBILLED",
        payment_id=None,
        payment_amount=0.0,
        payment_status="PENDING",
        discount_percent=0.0,
        employee_id="EMP-108",
        region="North America",
        product_line="Enterprise Cloud",
        channel="Direct Sales",
        notes="Hero Case 1: Order delivered and fulfilled, but ERP webhook failed to trigger billing invoice."
    )
    orders_to_create.append(hero1_order)

    # HERO CASE 2: Employee discount pattern (16 cases approved by EMP-402, totalling ₹42,000 exposure)
    for i in range(1, 17):
        week_idx = (i - 1) // 4 + 1
        days_ago = 28 - (week_idx * 6) + random.randint(0, 2)
        base_amt = 15000.0 + (i * 800)
        # Discount progresses from 18% up to 36%
        disc = 18.0 + (week_idx * 4.5)
        orders_to_create.append(CanonicalOrder(
            order_id=f"ORD-EMP402-{i:03d}",
            customer_id=random.choice(["CUST-103", "CUST-105", "CUST-107"]),
            contract_id=None,
            order_date=now - timedelta(days=days_ago),
            order_amount=base_amt,
            currency="INR",
            order_status="COMPLETED",
            invoice_id=f"INV-EMP402-{i:03d}",
            invoice_amount=round(base_amt * (1 - disc/100), 2),
            invoice_status="PAID",
            payment_id=f"PAY-EMP402-{i:03d}",
            payment_amount=round(base_amt * (1 - disc/100), 2),
            payment_status="SUCCESS",
            discount_percent=disc,
            employee_id="EMP-402",  # Rogue employee key
            region="EMEA",
            product_line="API Compute",
            channel="Partner Network",
            notes=f"Hero Case 2 (Sub-case {i}/16): Over-policy discount {disc}% authorized by EMP-402."
        ))

    # HERO CASE 3: Legitimate unusual refund (₹50,000, statistically anomalous, but cleared as NORMAL)
    hero3_order = CanonicalOrder(
        order_id="ORD-HERO-3001",
        customer_id="CUST-104",
        contract_id="CONT-2026-003",
        order_date=now - timedelta(days=45),
        order_amount=500000.0,
        currency="INR",
        order_status="COMPLETED",
        invoice_id="INV-HERO-3001",
        invoice_amount=500000.0,
        invoice_status="PAID",
        payment_id="PAY-HERO-3001",
        payment_amount=500000.0,
        payment_status="SUCCESS",
        refund_id="REF-HERO-3001",
        refund_amount=50000.0,  # 10% SLA credit with valid VP signature
        discount_percent=0.0,
        employee_id="VP-FIN-001",
        region="APAC",
        product_line="Enterprise Compute",
        channel="Direct Sales",
        notes="Hero Case 3: Legitimate ₹50,000 refund credit for documented Q3 service SLA window. Signed off by VP Finance."
    )
    orders_to_create.append(hero3_order)

    # HERO CASE 4: Contract drift billed orders (Customer GlobalTech billed 4.8L instead of 6.0L)
    for q in range(1, 5):
        orders_to_create.append(CanonicalOrder(
            order_id=f"ORD-CONT-HERO4-Q{q}",
            customer_id="CUST-101",
            contract_id="CONT-2026-HERO4",
            order_date=now - timedelta(days=300 - (q * 75)),
            order_amount=120000.0,  # 4 * 120k = 480k total billed vs 600k contract
            currency="INR",
            order_status="COMPLETED",
            invoice_id=f"INV-CONT-HERO4-Q{q}",
            invoice_amount=120000.0,
            invoice_status="PAID",
            payment_id=f"PAY-CONT-HERO4-Q{q}",
            payment_amount=120000.0,
            payment_status="SUCCESS",
            discount_percent=0.0,
            employee_id="EMP-102",
            region="North America",
            product_line="Enterprise Cloud",
            channel="Direct Sales",
            notes=f"Hero Case 4 (Quarter {q}): Invoiced ₹1,20,000 against contract CONT-2026-HERO4."
        ))

    # Additional standard cases for realistic dataset volume
    regions = ["North America", "EMEA", "APAC", "LATAM"]
    product_lines = ["Cloud Platform", "API Compute", "Security Suite", "Data Warehouse"]
    channels = ["Direct Sales", "Partner Network", "Self-Serve Web"]

    for k in range(1, 25):
        amt = random.randint(12000, 95000)
        has_issue = random.choice(["MISSING_INV", "INV_MISMATCH", "DUNNING_FAIL", "CLEAN"])
        if has_issue == "MISSING_INV":
            orders_to_create.append(CanonicalOrder(
                order_id=f"ORD-SYN-MIS-{k:03d}",
                customer_id=random.choice(customers_data)["id"],
                order_date=now - timedelta(days=random.randint(5, 30)),
                order_amount=amt,
                order_status="COMPLETED",
                invoice_id=None,
                invoice_amount=None,
                payment_status="PENDING",
                region=random.choice(regions),
                product_line=random.choice(product_lines),
                channel=random.choice(channels),
                notes="Automated synthetic missing invoice record."
            ))
        elif has_issue == "INV_MISMATCH":
            orders_to_create.append(CanonicalOrder(
                order_id=f"ORD-SYN-MISMATCH-{k:03d}",
                customer_id=random.choice(customers_data)["id"],
                order_date=now - timedelta(days=random.randint(5, 30)),
                order_amount=amt,
                order_status="COMPLETED",
                invoice_id=f"INV-SYN-{k:03d}",
                invoice_amount=round(amt * 0.82, 2),  # Underbilled
                payment_status="SUCCESS",
                payment_amount=round(amt * 0.82, 2),
                region=random.choice(regions),
                product_line=random.choice(product_lines),
                channel=random.choice(channels),
                notes="Automated synthetic invoice underbilling."
            ))
        elif has_issue == "DUNNING_FAIL":
            orders_to_create.append(CanonicalOrder(
                order_id=f"ORD-SYN-DUN-{k:03d}",
                customer_id=random.choice(customers_data)["id"],
                order_date=now - timedelta(days=random.randint(10, 40)),
                order_amount=amt,
                order_status="COMPLETED",
                invoice_id=f"INV-SYN-DUN-{k:03d}",
                invoice_amount=amt,
                payment_status="FAILED",
                payment_attempts=3,
                region=random.choice(regions),
                product_line=random.choice(product_lines),
                channel=random.choice(channels),
                notes="Automated synthetic dunning failure."
            ))
        else:
            orders_to_create.append(CanonicalOrder(
                order_id=f"ORD-SYN-NORM-{k:03d}",
                customer_id=random.choice(customers_data)["id"],
                order_date=now - timedelta(days=random.randint(1, 60)),
                order_amount=amt,
                order_status="COMPLETED",
                invoice_id=f"INV-NORM-{k:03d}",
                invoice_amount=amt,
                payment_id=f"PAY-NORM-{k:03d}",
                payment_amount=amt,
                payment_status="SUCCESS",
                discount_percent=0.0,
                region=random.choice(regions),
                product_line=random.choice(product_lines),
                channel=random.choice(channels),
                notes="Clean transaction."
            ))

    for o in orders_to_create:
        db.add(o)
    db.commit()

    # 4. GENERATE CASES VIA PIPELINE & INJECT HERO CASES
    generated_cases = []

    # CASE 1: HERO 1 (Missing Invoice ₹75,000)
    c1_eval = rule_engine.evaluate_order({
        "order_id": hero1_order.order_id,
        "customer_id": hero1_order.customer_id,
        "order_amount": hero1_order.order_amount,
        "order_status": hero1_order.order_status,
        "order_date": hero1_order.order_date,
        "invoice_id": None
    })
    c1_rec = financial_engine.calculate_expected_recovery(75000.0, "MISSING_INVOICE")
    c1_score = financial_engine.calculate_escalation_score(75000.0, case_aging_days=14, frequency_count=1)
    c1_immu = immunization_engine.get_suggestion_for_rule(c1_eval["rule_name"])
    
    hero1_case = RevenueCase(
        id="CASE-HERO-001",
        title="Unbilled Completed Order #ORD-HERO-1001 (₹75,000 Exposure)",
        category="PROCESS_LEAKAGE",
        status="VALIDATED",
        owner="Company-Side",
        entity_ref=hero1_order.order_id,
        exposure_amt=75000.0,
        recoverable_amt=c1_rec["recoverable_amt"],
        recovery_probability=c1_rec["recovery_probability"],
        expected_recovery=c1_rec["expected_recovery"],
        confidence=0.98,
        escalation_score=c1_score["total_score"],
        case_aging_days=14,
        opened_at=now - timedelta(days=14),
        approval_stage="STAGE_1_REVIEW",
        reason_codes=["MISSING_INVOICE", "UNBILLED_COMPLETION", "ERP_WEBHOOK_TIMEOUT"],
        evidence_data=c1_eval["evidence_data"],

        risk_breakdown=c1_score,
        suggested_immunization=c1_immu,
        graph_payload={
            "nodes": [
                {"id": "cust", "label": "Customer: Apex Cloud", "type": "customer", "status": "ok"},
                {"id": "order", "label": "Order: ORD-HERO-1001 (₹75k)", "type": "order", "status": "ok"},
                {"id": "inv", "label": "Invoice: [DROPPED / MISSING]", "type": "invoice", "status": "broken"},
                {"id": "pay", "label": "Payment: [BLOCKED]", "type": "payment", "status": "blocked"}
            ],
            "edges": [
                {"source": "cust", "target": "order", "label": "placed"},
                {"source": "order", "target": "inv", "label": "failed webhook (T+24h)", "broken": True},
                {"source": "inv", "target": "pay", "label": "pending invoice", "broken": True}
            ]
        },
        is_hero=True,
        hero_case_number=1
    )
    generated_cases.append(hero1_case)

    # CASE 2: HERO 2 (16 Cases from EMP-402)
    for i in range(1, 17):
        disc = 18.0 + (((i - 1) // 4 + 1) * 4.5)
        base_amt = 15000.0 + (i * 800)
        exp = round(base_amt * ((disc - 15.0) / 100.0), 2)
        c2_rec = financial_engine.calculate_expected_recovery(exp, "UNAUTHORIZED_DISCOUNT")
        c2_score = financial_engine.calculate_escalation_score(exp, case_aging_days=28 - i, frequency_count=16, is_pattern=True)
        c2_immu = immunization_engine.get_suggestion_for_rule("RULE_UNAUTHORIZED_DISCOUNT_OVERRIDE")

        c2_case = RevenueCase(
            id=f"CASE-EMP402-{i:03d}",
            title=f"Unauthorized {disc:.0f}% Discount Approved by EMP-402 (Sub-case #{i})",
            category="FINANCIAL_LEAKAGE",
            status="VALIDATED",
            owner="Company-Side",
            entity_ref=f"ORD-EMP402-{i:03d}",
            exposure_amt=exp,
            recoverable_amt=c2_rec["recoverable_amt"],
            recovery_probability=c2_rec["recovery_probability"],
            expected_recovery=c2_rec["expected_recovery"],
            confidence=0.96,
            escalation_score=c2_score["total_score"],
            case_aging_days=28 - i,
            opened_at=now - timedelta(days=28 - i),
            reason_codes=["EXCESSIVE_DISCOUNT", "POLICY_BREACH", "EMPLOYEE_EMP-402"],
            evidence_data={
                "order_id": f"ORD-EMP402-{i:03d}",
                "order_amount": base_amt,
                "applied_discount_pct": disc,
                "policy_limit_pct": 15.0,
                "approved_by_employee_id": "EMP-402"
            },
            risk_breakdown=c2_score,
            suggested_immunization=c2_immu,
            graph_payload={
                "nodes": [
                    {"id": "emp", "label": "Approver: EMP-402", "type": "employee", "status": "anomaly"},
                    {"id": "order", "label": f"Order: {disc:.0f}% Discount", "type": "order", "status": "policy_breach"},
                    {"id": "inv", "label": "Invoice: Discounted", "type": "invoice", "status": "financial_leak"}
                ],
                "edges": [
                    {"source": "emp", "target": "order", "label": "unauthorized override", "broken": True},
                    {"source": "order", "target": "inv", "label": "underbilled"}
                ]
            },
            is_hero=(i == 1),
            hero_case_number=2 if i == 1 else None
        )
        generated_cases.append(c2_case)

    # CASE 3: HERO 3 (Legitimate Unusual Refund ₹50,000 -> Cleared as NORMAL)
    hero3_case = RevenueCase(
        id="CASE-HERO-003",
        title="Unusual ₹50,000 Refund (Cleared as NORMAL - SLA Credit Sign-off)",
        category="NORMAL",
        status="CLOSED",
        owner="Company-Side",
        entity_ref="ORD-HERO-3001",
        exposure_amt=0.0,  # True exposure is 0 because it was legitimate
        recoverable_amt=0.0,
        recovery_probability=0.0,
        expected_recovery=0.0,
        confidence=0.99,
        escalation_score=5.0,
        case_aging_days=2,
        opened_at=now - timedelta(days=45),
        reason_codes=["STATISTICAL_OUTLIER_CLEARED", "VP_SIGN_OFF_VERIFIED"],
        evidence_data={
            "order_id": "ORD-HERO-3001",
            "refund_amount": 50000.0,
            "validation_note": "Legitimate enterprise SLA outage credit. Verified with VP Finance override ticket #SLA-8819."
        },
        risk_breakdown={"financial_impact": 0, "frequency": 0, "urgency": 0, "pattern_severity": 0, "total_score": 0},
        suggested_immunization={"control": "No mitigation required. Legitimate corporate exception."},
        graph_payload={
            "nodes": [
                {"id": "cust", "label": "Customer: HyperScale AI", "type": "customer", "status": "ok"},
                {"id": "order", "label": "Order: ₹500,000", "type": "order", "status": "ok"},
                {"id": "refund", "label": "Refund: ₹50,000 (SLA Verified)", "type": "refund", "status": "verified"}
            ],
            "edges": [
                {"source": "cust", "target": "order", "label": "enterprise deal"},
                {"source": "order", "target": "refund", "label": "VP signed SLA credit"}
            ]
        },
        is_hero=True,
        hero_case_number=3
    )
    generated_cases.append(hero3_case)

    # CASE 4: HERO 4 (Contract vs Billed Drift ₹1,20,000)
    c4_rec = financial_engine.calculate_expected_recovery(120000.0, "CONTRACT_DRIFT")
    c4_score = financial_engine.calculate_escalation_score(120000.0, case_aging_days=25, frequency_count=4, is_pattern=True)
    c4_immu = immunization_engine.get_suggestion_for_rule("RULE_CONTRACT_BILLED_DRIFT")

    hero4_case = RevenueCase(
        id="CASE-HERO-004",
        title="Contract-vs-Billed Drift: CONT-2026-HERO4 (₹1,20,000 Underbilled)",
        category="FINANCIAL_LEAKAGE",
        status="VALIDATED",
        owner="Company-Side",
        entity_ref="CONT-2026-HERO4",
        exposure_amt=120000.0,
        recoverable_amt=c4_rec["recoverable_amt"],
        recovery_probability=c4_rec["recovery_probability"],
        expected_recovery=c4_rec["expected_recovery"],
        confidence=0.97,
        escalation_score=c4_score["total_score"],
        case_aging_days=25,
        opened_at=now - timedelta(days=25),
        reason_codes=["CONTRACT_BILLED_DRIFT", "RECONCILIATION_GAP", "UNBILLED_ANNUAL_COMMITMENT"],
        evidence_data={
            "contract_id": "CONT-2026-HERO4",
            "customer_name": "GlobalTech Enterprise",
            "contract_agreed_amount": 600000.0,
            "total_invoiced_amount": 480000.0,
            "underbilled_gap": 120000.0,
            "drift_percentage": 20.0,
            "issue_summary": "Customer committed to ₹6,00,000 ARR in CONT-2026-HERO4, but only 4 quarterly invoices of ₹1,20,000 were issued (Total ₹4,80,000)."
        },
        risk_breakdown=c4_score,
        suggested_immunization=c4_immu,
        graph_payload={
            "nodes": [
                {"id": "contract", "label": "Contract: Agreed ₹600,000", "type": "contract", "status": "ok"},
                {"id": "invoices", "label": "Invoiced: ₹480,000 (4 Qtrs)", "type": "invoices", "status": "drift"},
                {"id": "gap", "label": "Unbilled Gap: ₹120,000", "type": "leakage", "status": "critical"}
            ],
            "edges": [
                {"source": "contract", "target": "invoices", "label": "quarterly billing"},
                {"source": "invoices", "target": "gap", "label": "missing milestone true-up", "broken": True}
            ]
        },
        is_hero=True,
        hero_case_number=4
    )
    generated_cases.append(hero4_case)

    # Process other orders into cases
    for o in orders_to_create:
        if o.order_id.startswith("ORD-SYN-"):
            res = rule_engine.evaluate_order({
                "order_id": o.order_id,
                "customer_id": o.customer_id,
                "order_amount": o.order_amount,
                "order_status": o.order_status,
                "order_date": o.order_date,
                "invoice_id": o.invoice_id,
                "invoice_amount": o.invoice_amount,
                "payment_status": o.payment_status,
                "payment_attempts": o.payment_attempts,
                "refund_amount": o.refund_amount,
                "discount_percent": o.discount_percent,
                "employee_id": o.employee_id
            })
            if res:
                exp = res["exposure_amt"]
                rec = financial_engine.calculate_expected_recovery(exp, res["rule_name"])
                days = random.randint(3, 20)
                sc = financial_engine.calculate_escalation_score(exp, case_aging_days=days)
                immu = immunization_engine.get_suggestion_for_rule(res["rule_name"])
                
                c_obj = RevenueCase(
                    id=f"CASE-SYN-{len(generated_cases)+1:03d}",
                    title=res["title"],
                    category=res["category"],
                    status="VALIDATED",
                    owner=res["owner"],
                    entity_ref=o.order_id,
                    exposure_amt=exp,
                    recoverable_amt=rec["recoverable_amt"],
                    recovery_probability=rec["recovery_probability"],
                    expected_recovery=rec["expected_recovery"],
                    confidence=round(random.uniform(0.88, 0.96), 2),
                    escalation_score=sc["total_score"],
                    case_aging_days=days,
                    opened_at=now - timedelta(days=days),
                    reason_codes=res["reason_codes"],
                    evidence_data=res["evidence_data"],
                    risk_breakdown=sc,
                    suggested_immunization=immu,
                    graph_payload={
                        "nodes": [
                            {"id": "order", "label": f"Order: {o.order_id}", "type": "order", "status": "ok"},
                            {"id": "issue", "label": res["rule_name"], "type": "leakage", "status": "broken"}
                        ],
                        "edges": [
                            {"source": "order", "target": "issue", "label": "exception"}
                        ]
                    }
                )
                generated_cases.append(c_obj)

    for c in generated_cases:
        db.add(c)
    db.commit()

    # 5. EXECUTE ROOT CAUSE CLUSTERING (§7.8)
    root_cause_clustering_engine.cluster_cases(db)

    # 6. SEED INITIAL AUDIT LOG WITH GENESIS CHAIN
    audit_service.record_action(
        db=db,
        case_id="SYSTEM-GENESIS",
        action="INITIALIZE_PLATFORM",
        reviewer_id="system_genesis_agent",
        previous_status=None,
        new_status="INITIALIZED",
        notes="Platform seeded with canonical datasets, 4 hero cases, and initial cryptographic chain."
    )

    # Record 1 simulated confirmation for demo
    audit_service.record_action(
        db=db,
        case_id="CASE-HERO-004",
        action="CONFIRM_LEAKAGE",
        reviewer_id="cfo_demo_user",
        previous_status="VALIDATED",
        new_status="CONFIRMED",
        notes="Confirmed ₹1,20,000 Contract Drift with GlobalTech. Triggered simulated NetSuite billing adjustment invoice."
    )

    # 7. SEED GROUND TRUTH TABLE
    # Hero 1: True process leakage (Missing invoice)
    db.add(GroundTruth(entity_id="ORD-HERO-1001", actual_problem="Missing invoice on fulfilled order", problem_type="PROCESS_LEAKAGE", actual_exposure=75000.0, is_true_leakage=True, shared_root_cause="RC-WORKFLOW-BILLING-SYNC"))
    # Hero 2: True financial leakage (EMP-402 discounts)
    for i in range(1, 17):
        db.add(GroundTruth(entity_id=f"ORD-EMP402-{i:03d}", actual_problem="Unauthorized employee override discount", problem_type="FINANCIAL_LEAKAGE", actual_exposure=2600.0, is_true_leakage=True, shared_root_cause="RC-EMP-402"))
    # Hero 3: Legitimate SLA refund (NORMAL)
    db.add(GroundTruth(entity_id="ORD-HERO-3001", actual_problem="Valid SLA Outage credit exception", problem_type="NORMAL", actual_exposure=0.0, is_true_leakage=False, shared_root_cause=None))
    # Hero 4: True financial leakage (Contract Drift)
    db.add(GroundTruth(entity_id="CONT-2026-HERO4", actual_problem="Unbilled annual commitment drift", problem_type="FINANCIAL_LEAKAGE", actual_exposure=120000.0, is_true_leakage=True, shared_root_cause="RC-CONTRACT-ANNUAL-DRIFT"))
    db.commit()

    return {
        "status": "SUCCESS",
        "customers_seeded": len(customers_data),
        "contracts_seeded": len(contracts_data),
        "orders_seeded": len(orders_to_create),
        "cases_generated": len(generated_cases),
        "root_causes_clustered": db.query(RootCause).count()
    }
