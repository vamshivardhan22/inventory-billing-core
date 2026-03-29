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
Client (POS UI)
↓
FastAPI (API Layer)
↓
Services Layer
├── Billing Service
├── Stock Engine
├── GST Engine
├── Reporting Service
↓
PostgreSQL
├── products
├── stock_snapshot
├── stock_movements
├── orders
├── order_items
├── invoices
├── invoice_items
├── idempotency_keys
└── audit_logs


---

## 📁 Project Structure


app/
├── main.py
├── core/
├── db/
├── models/
├── schemas/
├── services/
└── api/

init_db.py
requirements.txt
Dockerfile


---

## ⚙️ Tech Stack

- **Backend:** FastAPI  
- **Database:** PostgreSQL  
- **ORM:** SQLAlchemy  
- **Containerization:** Docker  

---

## 🛠️ Setup Instructions

### 1. Clone Repository
bash
git clone https://github.com/your-username/ledger-driven-pos.git
cd ledger-driven-pos
2. Start PostgreSQL (Docker)
docker run -d -p 5432:5432 \
-e POSTGRES_PASSWORD=postgres \
-e POSTGRES_DB=pos postgres
3. Install Dependencies
pip install -r requirements.txt
4. Initialize Database
python init_db.py
5. Run Server
uvicorn app.main:app --reload
6. Open API Docs
http://127.0.0.1:8000/docs
🧪 Example Workflow
Create Product
POST /products
Add Stock
POST /stock/add
Create Bill
POST /bill
Fetch Order
GET /orders/{id}
View Reports
GET /reports/sales/daily
GET /reports/products/top
GET /reports/gst
🔒 Core Design Principles
No negative stock under any condition
Orders are immutable after creation
Stock changes only via ledger entries
All critical operations are transactional
Cart does not mutate inventory
Explicit concurrency control
⚠️ Known Constraints
Single-node deployment (can be extended)
No authentication layer (can be added)
Optimized for correctness over raw throughput
🚀 Future Improvements
PDF invoice generation
Multi-store / warehouse support
Role-based access (admin / cashier)
Event-driven architecture (Kafka)
Offline POS sync
🧠 Why This Project?

This project demonstrates:

Real-world backend system design
Concurrency-safe transaction handling
Financial-grade data integrity
Scalable architecture thinking



