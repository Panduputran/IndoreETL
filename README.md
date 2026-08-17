<div align="center">

# Insurance Bordero ETL & Cleansing Platform

Enterprise-Grade Full-Stack Data Pipeline, Cleansing Engine & Analytics Portal

![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![NumPy](https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white)
![Pandas](https://img.shields.io/badge/Pandas-150458?style=for-the-badge&logo=pandas&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Starcore-red?style=for-the-badge)

</div>

---

## Overview

**Insurance Bordero ETL & Cleansing Platform** is a full-stack, enterprise-grade automated data pipeline and web management application designed to handle large-scale multi-cedant reinsurance/insurance transaction records.

The system combines an interactive **React** web dashboard with a high-performance **Python/FastAPI** processing engine. It automates file inspection, dynamic header detection, vectorized data sanitization via **NumPy & Pandas**, automated schema generation, and high-precision batch ingestion into **PostgreSQL** for datasets exceeding millions of transaction records across cedants such as **Askrida, Tripakarta, ACA, Buana Independent**, and others.

---

## Key Features

- **Dynamic Header & Metadata Detection:** Automatically identifies metadata offsets, header rows, and column variations across heterogeneous cedant formats.
- **High-Precision Data Cleansing:** Comprehensive sanitization routines handling currency normalizations, date parsing, missing values, and policy number validations.
- **Vectorized Numerical Transformations:** Utilizes NumPy and Pandas for ultra-fast data type coercion, mathematical reconciliations, and premium rate calculations.
- **Automated Schema Generation:** Auto-detects and synchronizes database table structures and types according to cedant contract definitions.
- **High-Throughput Batch Processing:** Optimized for high-volume datasets (>1M+ rows) with memory-safe streaming, chunked transformations, and batch SQL loading.
- **Interactive Web Interface:** Modern React frontend with drag-and-drop file upload, real-time ingestion progress monitoring, and interactive cleansing validation.
- **Audit Logging & Traceability:** Comprehensive administrative audit trails logging file checksums, processing durations, error distributions, and row-level rejection reports.
- **Multi-Cedant Architecture:** Pluggable engine modules tailored for cedants including **Askrida, Tripakarta, ACA, Buana Independent**, and custom schemas.

---

## System Architecture

```text
┌──────────────────────────────┐
│  React Frontend (Web Portal) │
│  - Drag & Drop File Upload   │
│  - Real-Time Progress Visual │
│  - Schema & Audit Dashboard  │
└──────────────┬───────────────┘
               │ REST API / Multipart Upload
               ▼
┌──────────────────────────────┐
│   FastAPI Backend Engine     │
│  - File Inspection & Parsing │
│  - NumPy / Pandas Cleansing  │
│  - Dynamic Schema Mapping    │
└──────────────┬───────────────┘
               │ Batch Insert (SQLAlchemy / Copy)
               ▼
┌──────────────────────────────┐
│     PostgreSQL Database      │
│  - Normalized Bordero Tables │
│  - Audit Logs & Error Trails │
└──────────────────────────────┘