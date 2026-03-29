# 📦 Ledger-Driven POS Billing System

> **Designed for correctness under concurrency, not just functionality.**

---

## 🧠 Overview

A **production-grade POS (Point of Sale) billing backend** built with **FastAPI** and **PostgreSQL**, designed to handle real-world retail challenges:

- Concurrent billing across multiple terminals  
- Strict stock consistency (no negative inventory)  
- GST-compliant invoicing (India-specific)  
- Auditability and financial traceability  

Unlike typical CRUD systems, this project focuses on **transactional correctness, data integrity, and reliability**.

---

## 🚀 Key Features

### 🔒 Concurrency-Safe Billing
- Row-level locking (`SELECT ... FOR UPDATE`)
- Deterministic lock ordering
- Atomic transactions (commit / rollback)

### 📦 Ledger-Based Inventory
- Stock movements (ledger) → source of truth  
- Stock snapshot → fast reads + locking  
- Fully replayable inventory state  

### 💳 Transactional Billing Engine
- Immutable orders  
- Idempotent requests (retry-safe)  
- No stock mutation outside billing  

### 🧾 GST-Compliant Invoicing (India)
- CGST / SGST / IGST calculation  
- Per-item tax breakdown  
- Invoice generation with totals  

### 📊 Reporting APIs
- Daily sales aggregation  
- Top-selling products  
- GST summaries  

### 🧾 Audit Logging
- All critical operations logged  
- Traceable financial events  

---

## 🏗️ Architecture
