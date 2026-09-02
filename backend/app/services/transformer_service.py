# backend/app/services/transformer_service.py
"""
Modul Layanan Transformasi Data (Transformer Service)
Bertanggung jawab untuk standardisasi skema Master IPR (Fire & Kredit),
penyusunan DataFrame 1-Dimensi aman, pemetaan kolom Non-IPR, sanitasi baris,
dan injeksi metadata sistem (period & cedant_name).
"""

import re
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd
from app.database.loader import make_unique_column_names

# ==============================================================================
# CANONICAL IPR SCHEMAS (4-QUADRANTS)
# ==============================================================================

CANONICAL_IPR_SCHEMAS: Dict[str, List[str]] = {
    "FIRE_PREMIUM": [
        "no", "cob", "policy_number", "certificate_number", "insured_name", "insured_affiliation",
        "period_start", "period_end", "uw_year", "coverage", "policy_type", "currency",
        "si_md_building", "si_machinery", "si_stock", "si_tpl", "si_bi", "si_others",
        "tsi_100_percent", "basis_of_indemnity", "pml_amount", "pml_percentage", "eq_zone",
        "occupation_code", "occupation", "location", "zip_code", "latitude", "longitude",
        "construction_class", "source_business", "is_endorsement", "endorsement_effective_date",
        "endorsement_description", "cedant_share_percent", "cedant_share_amount",
        "total_coinsurance_panels", "risk_or", "risk_qs", "risk_surplus", "risk_others",
        "premium_100_percent", "premium_gross_rate", "discount", "first_loss_scale",
        "premium_net_rate", "ceded_premium_100", "indonesia_re_share_premium",
        "special_acceptance", "special_acceptance_desc", "note"
    ],
    "FIRE_CLAIM": [
        "no", "cob", "claim_ref_number", "policy_number", "certificate_number",
        "reff_bordereaux_premium", "insured_name", "period_start", "period_end", "uw_year",
        "occupation_code", "occupation", "location", "zip_code", "latitude", "longitude",
        "date_of_loss", "settled_date", "proximate_cause", "cause_of_loss", "coverage_affected",
        "currency", "claim_md_building", "claim_machinery", "claim_stock", "claim_tpl",
        "claim_bi", "claim_other", "claim_adjuster_fee", "total_incurred_claim_100",
        "cedant_share_percent", "cedant_share_amount", "claim_or", "claim_qs", "claim_surplus",
        "claim_others", "type_of_loss", "paid_claims_reinsurer_share",
        "outstanding_claims_reinsurer_share", "paid_claims_indonesia_re_share",
        "outstanding_claims_indonesia_re_share", "note"
    ],
    "CREDIT_PREMIUM": [
        "no", "policy_number", "insured_name", "date_of_birth", "tsi_100_percent",
        "period_start", "period_end", "tenor_months", "premium_100_percent",
        "indonesia_re_share_premium", "note"
    ],
    "CREDIT_CLAIM": [
        "no", "claim_ref_number", "policy_number", "insured_name", "date_of_loss",
        "cause_of_loss", "total_incurred_claim_100", "paid_claims_indonesia_re_share", "note"
    ]
}


def get_canonical_ipr_schema(cob: str, category: str) -> List[str]:
    """
    Mengambil daftar urutan kolom kanonikal standar Master IPR
    berdasarkan kombinasi Line of Business (COB) dan Kategori Bordero.

    :param cob: 'fire' atau 'credit' / 'kredit'
    :param category: 'premi' / 'premium' atau 'claim' / 'klaim'
    :return: List nama kolom terstandarisasi
    """
    clean_cat = str(category or "").strip().lower()
    clean_cob = str(cob or "").strip().lower()

    is_claim = ("claim" in clean_cat) or ("klaim" in clean_cat)
    is_credit = ("credit" in clean_cob) or ("kredit" in clean_cob)
    schema_key = f"{'CREDIT' if is_credit else 'FIRE'}_{'CLAIM' if is_claim else 'PREMIUM'}"

    return CANONICAL_IPR_SCHEMAS.get(schema_key, CANONICAL_IPR_SCHEMAS["FIRE_PREMIUM"])


def extract_1d_series_values(df: pd.DataFrame, col_name: str) -> Optional[np.ndarray]:
    """
    Mengekstrak nilai kolom dari DataFrame secara aman dan menjamin
    output berupa array 1-Dimensi (mencegah ValueError 'Cannot set a DataFrame with multiple columns').

    :param df: pandas DataFrame sumber
    :param col_name: Nama kolom yang ingin diekstrak
    :return: 1D numpy array data kolom atau None jika tidak ditemukan
    """
    if not col_name:
        return None

    # 1. Exact Match
    if col_name in df.columns:
        val = df[col_name]
        if isinstance(val, pd.DataFrame):
            return val.iloc[:, 0].values
        elif isinstance(val, pd.Series):
            return val.values
        elif hasattr(val, "values"):
            return val.values
        return np.array(val)

    # 2. Case-Insensitive Match Fallback
    target_lower = str(col_name).strip().lower()
    for c in df.columns:
        if str(c).strip().lower() == target_lower:
            val = df[c]
            if isinstance(val, pd.DataFrame):
                return val.iloc[:, 0].values
            elif isinstance(val, pd.Series):
                return val.values
            elif hasattr(val, "values"):
                return val.values
            return np.array(val)

    return None


def clean_and_filter_rows(df: pd.DataFrame, mapped_cols: List[str]) -> pd.DataFrame:
    """
    Membersihkan baris kosong, baris sub-total, atau baris tidak valid
    dengan memeriksa keberadaan data nyata pada kolom-kolom yang di-mapping.

    :param df: DataFrame yang telah ditransformasikan
    :param mapped_cols: Daftar kolom yang terpetakan dari sumber
    :return: DataFrame bersih bebas baris kosong/invalid
    """
    if df.empty:
        return df

    filter_cols = [c for c in mapped_cols if c in df.columns]
    if not filter_cols:
        filter_cols = [c for c in df.columns if c not in ["period", "cedant_name"]]

    if filter_cols:
        invalid_tokens = {"", "nan", "none", "null", "<na>", "total", "jumlah", "grand total", "sub total"}
        valid_mask = df[filter_cols].apply(
            lambda row: any(
                pd.notna(val) and str(val).strip().lower() not in invalid_tokens
                for val in row
            ),
            axis=1
        )
        df_filtered = df[valid_mask].copy()
    else:
        df_filtered = df.dropna(how="all").copy()

    df_filtered.reset_index(drop=True, inplace=True)
    return df_filtered


def transform_raw_dataframe(
    df_raw: pd.DataFrame,
    file_info: Any,
    clean_cob: str,
    clean_cat: str,
    cedant_label: str
) -> Tuple[pd.DataFrame, List[Dict[str, str]]]:
    """
    Fungsi inti transformasi dataset bordero:
    1. Membangun kerangka DataFrame berbasis seluruh kolom Master IPR (diisi NULL jika unmapped).
    2. Mengisi nilai kolom IPR yang terpetakan secara aman (vektor 1D).
    3. Menyuntikkan kolom kustom Non-IPR yang diaktifkan oleh operator.
    4. Menambahkan metadata sistem 'period' dan 'cedant_name'.
    5. Membersihkan baris kosong/invalid.

    :param df_raw: DataFrame mentah hasil pembacaan berkas
    :param file_info: Metadata file item dari Pydantic payload
    :param clean_cob: 'fire' atau 'credit'
    :param clean_cat: 'premi' atau 'claim'
    :param cedant_label: Nama representasi resmi cedant
    :return: Tuple berisi (df_transformed, active_non_ipr_columns)
    """
    # 1. Ambil skema kanonikal IPR
    canonical_cols = get_canonical_ipr_schema(clean_cob, clean_cat)
    df_transformed = pd.DataFrame(index=df_raw.index)

    user_mapping = getattr(file_info, "column_mapping", {}) or {}
    if isinstance(user_mapping, dict) is False:
        user_mapping = {}

    # 2. Isi seluruh kolom IPR (data dari Excel jika di-mapping, atau NULL jika unmapped)
    mapped_source_cols: List[str] = []
    for ipr_col in canonical_cols:
        src_col = user_mapping.get(ipr_col)
        if src_col:
            src_val = extract_1d_series_values(df_raw, src_col)
            if src_val is not None:
                df_transformed[ipr_col] = src_val
                mapped_source_cols.append(ipr_col)
            else:
                df_transformed[ipr_col] = None
        else:
            df_transformed[ipr_col] = None

    # 3. Tambahkan kolom Non-IPR kustom yang diaktifkan
    active_non_ipr_columns: List[Dict[str, str]] = []
    non_ipr_mapping = getattr(file_info, "non_ipr_mapping", {}) or {}

    if isinstance(non_ipr_mapping, dict):
        for source_col, cfg in non_ipr_mapping.items():
            if isinstance(cfg, dict):
                is_enabled = cfg.get("enabled", True)
                target_db_name = cfg.get("dbField", source_col)
            else:
                is_enabled = getattr(cfg, "enabled", True)
                target_db_name = getattr(cfg, "dbField", source_col)

            clean_non_ipr = re.sub(r"[^a-zA-Z0-9_]", "_", str(target_db_name).strip().lower())
            clean_non_ipr = re.sub(r"_+", "_", clean_non_ipr).strip("_")

            if is_enabled and clean_non_ipr and clean_non_ipr not in df_transformed.columns:
                src_val = extract_1d_series_values(df_raw, source_col)
                if src_val is not None:
                    df_transformed[clean_non_ipr] = src_val
                    active_non_ipr_columns.append({"source": source_col, "target": clean_non_ipr})
                    mapped_source_cols.append(clean_non_ipr)

    # 4. Format Periode & Cedant Name
    raw_period = str(getattr(file_info, "period", "") or "").strip()
    raw_year = str(getattr(file_info, "received_date", "") or "").strip()
    full_period = f"{raw_period.upper()} {raw_year}".strip() if (raw_year and raw_year not in raw_period) else raw_period.upper().strip()

    for reserved_col in ["period", "cedant_name"]:
        if reserved_col in df_transformed.columns:
            df_transformed.drop(columns=[reserved_col], inplace=True)

    df_transformed["period"] = full_period
    df_transformed["cedant_name"] = cedant_label

    # Pastikan seluruh nama kolom terhindar dari benturan nama
    df_transformed.columns = make_unique_column_names(df_transformed.columns)

    # 5. Pembersihan Baris Invalid
    df_transformed = clean_and_filter_rows(df_transformed, mapped_source_cols)

    return df_transformed, active_non_ipr_columns
