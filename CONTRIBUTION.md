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