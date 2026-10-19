# Inventory and Billing System

A point-of-sale (POS) and inventory management application for recording products, processing sales, monitoring stock, and reviewing business reports. The repository includes a React and TypeScript frontend with Firebase integration and service modules for billing, stock, GST calculations, and reporting.

## Features

- Product catalog and inventory management.
- Point-of-sale cart and billing workflow.
- Stock movement and inventory updates.
- GST calculation support for itemized sales.
- Sales reports and product performance summaries.
- Firebase Authentication and Firestore data access.
- Dashboard interface built with React.

## Tech stack

- React
- TypeScript
- Vite
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS
- Recharts

## Run locally

Requirements: Node.js and npm, plus a configured Firebase project.

```bash
git clone https://github.com/vamshivardhan22/inventory-billing-core.git
cd inventory-billing-core
npm install
```

Configure the Firebase project settings required by `src/firebase.ts` and the deployment environment. Do not commit private service credentials or production secrets.

Start the development server:

```bash
npm run dev
```

Run a production build with:

```bash
npm run build
```

## Project structure

```text
src/
  components/
    Dashboard/     Reporting views
    Inventory/     Inventory management
    POS/           Product catalog and cart
  services/
    billing_service.ts
    gst_engine.ts
    report_service.ts
    stock_engine.ts
  firebase.ts      Firebase client setup
  App.tsx          Application entry and routing
```

## Notes

This repository's UI and client-side service modules should be reviewed together when validating end-to-end billing behavior. GST rules and inventory records should be checked against the needs of the target business before operational use. A successful local build alone does not verify production security, tax compliance, or data consistency under concurrent usage.

## Skills demonstrated

React, TypeScript, Firebase, inventory workflows, POS billing, GST calculations, reporting dashboards, and frontend application development.
