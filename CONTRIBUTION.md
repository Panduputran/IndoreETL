# Contribution Log - ETL Pipeline & Database Automation Updates

Rangkuman pembaruan sistem backend terkait pemrosesan ETL data Cedant (Askrida, ACA, Tripakarta, Buana Independent), standarisasi skema database, dan otomatisasi mapping nama tabel target.

---

## 1. Integrasi Modul Cedant Baru (`app/services/cedants/askrida.py`)
* **Implementasi Fungsi Pemrosesan Klaim**: Menambahkan fungsi `process_claim` khusus untuk Askrida.
* **Regex Word Boundary Mapping**: Menerapkan pemetaan pola kolom dinamis menggunakan regex `\b` agar menghindari *false-match* antar kolom.
* **Data Cleaning & Normalization**:
  * Penanganan *merged cell* menggunakan teknik *Forward Fill* (`ffill`).
  * Pembersihan baris *subtotal*, *grand total*, dan *summary text*.
  * Standardisasi format kapitalisasi dan konversi tipe data tanggal (`date_of_loss`, `period_of_insurance_start`, `period_of_insurance_end`).

---

## 2. Pembaruan Skema & Konfigurasi Master (`app/core/config.py`)
* **Skema Master Kolom Klaim (`MASTER_COLUMNS_CLAIM`)**:
  * Menambahkan master definisi kolom klaim untuk cedant **Askrida** (20 kolom target).
  * Menambahkan master definisi kolom klaim untuk cedant **ACA** (31 kolom target).
* **Mapping Sheet ke COB (`SHEET_TO_TABLE_MAPPING`)**:
  * Menambahkan pemetaan variasi sheet kredit/kuartal/TW (misal: `klaim qs tw 1`, `klaim qs tw 2`, `credit`, `kredit`).
  * Mengisolasi keyword umum agar tidak menimpa sheet dengan target tabel `_fire` secara *default*.

---

## 3. Peningkatan Logika Database Inspector (`app/services/inspector_service.py`)
* **Normalisasi Sheet Cerdas (`normalize_sheet_mapping`)**: Menambahkan *regex cleaner* untuk memotong angka tahun dinamis (misal: `2015`, `2016`) agar pencocokan pola sheet berjalan akurat.
* **Otomatisasi Nama Tabel Universal (`get_target_table_name`)**: 
  * Memprioritaskan parameter `custom_table_name` jika diinput oleh user.
  * Menghilangkan dependensi *hardcode* nama cedant/COB tertentu sehingga berlaku fleksibel untuk semua cedant.
* **Penerusan Parameter (`check_target_table_in_db`)**: Memperbarui signature fungsi agar menerima dan meneruskan `custom_table_name` saat memvalidasi keberadaan tabel di database.

---

## 4. Perbaikan Router & Endpoint Controller (`app/api/v1/endpoints/etl.py`)
* **Penghapusan Hardcode String**: Menghapus akhiran statis `_fire` pada endpoint `POST /process` dan `POST /process-batch`.
* **Dukungan Schema Dinamis (`ProcessETLRequest` & `CheckDBRequest`)**: Menambahkan *field* opsional `custom_table_name` pada skema Pydantic request body.
* **Integrasi Helper Generator Tabel**: Mengaitkan helper `get_target_table_name` secara konsisten pada seluruh flow eksekusi (`inspect` -> `check-db` -> `create-table` -> `process`).

---

## Ringkasan Endpoint Terkait
| Endpoint | Method | Deskripsi Perubahan |
| :--- | :---: | :--- |
| `/api/v1/etl/check-db` | `POST` | Meneruskan `custom_table_name` dan memvalidasi eksistensi tabel secara akurat. |
| `/api/v1/etl/create-table` | `POST` | Mendukung DDL dinamis untuk skema tabel klaim baru (`claim_askrida_kredit`, `claim_aca_fire`). |
| `/api/v1/etl/process` | `POST` | Menyimpan data langsung ke tabel target dinamis sesuai COB/sheet. |
| `/api/v1/etl/process-batch` | `POST` | Menjalankan multi-sheet/multi-file ETL berurutan dengan target tabel masing-masing. |


### Updates & Fixes (ACA ETL & Helpers)

#### 1. `app/utils/helpers.py`
- **Fix Multi-Index Header:** Mencegah penggabungan baris header dengan baris data pertama (mengatasi bug kolom `reinsured_pt_asuransi...`).
- **Smart Dynamic Header:** Menambahkan deteksi otomatis baris header untuk single-header vs multi-level header.
- **Universal Keyword Detection:** Memperluas kamus `target_keywords` (bilingual ID/EN) agar akurat mendeteksi baris header di berbagai baris (baris 1, 8, dst.) untuk semua cedant.

#### 2. `app/services/cedants/aca.py`
- **Feature `process_claim`:**
  - Implementasi penuh ekstraksi data klaim ACA (Non Marine & Marine).
  - Mapping alias kolom (`claimno` -> `claim_no`, `gross_claim` -> `claim_amount_100`, dll.).
  - Fix kolom persentase `ACA'S SHARE (%)` dan `REINSURER SHARE (%)` agar tidak `null`.
  - Sanitasi ID string (hapus `.0`), validasi tanggal, dan filter baris total/rekap.
- **Fix & Refactor `process_premi`:**
  - Fix issue `total_rows_inserted: 0` akibat mismatch mapping `policyno`.
  - Menambahkan alias untuk kolom `endorsement` (`endorsement_no`, `no_endorsement`, dll.).
  - Sinkronisasi master output dengan `MASTER_COLUMNS_PREMI["aca"]`.

#### 3. Database Schema (DDL & JSON Config) di test_db
- Pembuatan struktur tabel dan JSON Schema untuk `claim_aca_fire`.
- Pembuatan struktur tabel dan JSON Schema untuk `premi_aca_fire`.

notes: sudah ada backups

### 🚀 Changelog & Contributions

#### 1. `app/core/config.py`
- **Enhanced `SHEET_TO_TABLE_MAPPING`:** Memperluas kamus pemetaan nama sheet (bilingual ID/EN) untuk mendeteksi berbagai variasi nama sheet bordereaux secara universal (Fire/Property, Marine Cargo, Marine Hull, Motor, Engineering, Askrida Credit, Buana, dll.).

#### 2. `app/services/inspector_service.py`
- **Smart Dynamic Table Name Resolver (`get_target_table_name` & `resolve_cob_from_sheet`):**
  - Mengintegrasikan resolusi nama tabel otomatis berbasis kamus mapping tanpa perlu input manual `custom_table_name`.
  - **Special Naming Convention for Askrida:** Menambahkan aturan khusus format tabel Askrida:
    - Klaim: `claim_kredit_askrida` (COB di tengah, format bahasa Indonesia).
    - Premi: `premi_credit_askrida` (COB di tengah, format bahasa Inggris).
    - Cedant lain tetap mengikuti standar: `{tipe_proses}_{cedant}_{cob}` (contoh: `claim_aca_fire`).
- **Fix DB Check & Inspector:**
  - Memperbaiki bug urutan *positional arguments* saat memanggil resolver nama tabel pada `check_target_table_in_db`.
  - Menambahkan import `zipfile` dan `xml.etree.ElementTree` untuk ekstraksi instan manifest sheet Excel.
  - Sanitasi penanganan input default Swagger (`""` atau `"string"`).

#### 3. `app/services/cedants/aca.py`
- **Fix Scientific Notation & String Formatting (`format_id_column`):**
  - Mencegah konversi nomor klaim/polis berukuran besar menjadi notasi ilmiah float/eksponensial (contoh: `8.11e+16`).
  - Menghilangkan suffix `.0` pada kolom identifier teks/ID (`claim_no`, `policy_number`, `reinsurer_id`, `treaty_id`, dll.).
- **Data Pipeline Refactor (`process_premi` & `process_claim`):**
  - Pemetaan alias header Excel ACA yang komprehensif.
  - Penanganan kolom persentase share (`ACA'S SHARE (%)` & `REINSURER SHARE (%)`).
  - Pembersihan baris footer/rekap/total serta sinkronisasi master output columns.

#### 4. `app/api/v1/endpoints/etl.py` (Controller/Router)
- **Safe Payload & Validation:**
  - Menambahkan validasi pengecekan *empty dataframe* sebelum proses insert database.
  - Sinkronisasi passing parameter `override_cob` pada batch processing endpoint (`/process-batch`).