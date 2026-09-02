# backend/app/core/config.py
"""
Master Configuration & Canonical IPR Schemas
Mendefinisikan skema baku kolom Master IPR (Fire & Kredit),
pemetaan lembar kerja Excel (Sheet-to-Table), dan alias kolom per cedant.
"""

from typing import Dict, List

# ==============================================================================
# CANONICAL IPR MASTER SCHEMAS (OFFICIAL 4-QUADRANT STANDARDS)
# ==============================================================================

CANONICAL_IPR_SCHEMAS: Dict[str, List[str]] = {
    # 1. Fire / Property - Premium (51 Kolom Standar)
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

    # 2. Fire / Property - Claim (43 Kolom Standar)
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

    # 3. Credit / Penjaminan - Premium (11 Kolom Standar)
    "CREDIT_PREMIUM": [
        "no", "policy_number", "insured_name", "date_of_birth", "tsi_100_percent",
        "period_start", "period_end", "tenor_months", "premium_100_percent",
        "indonesia_re_share_premium", "note"
    ],

    # 4. Credit / Penjaminan - Claim (9 Kolom Standar)
    "CREDIT_CLAIM": [
        "no", "claim_ref_number", "policy_number", "insured_name", "date_of_loss",
        "cause_of_loss", "total_incurred_claim_100", "paid_claims_indonesia_re_share", "note"
    ]
}

MASTER_IPR_FIRE_PREMIUM = CANONICAL_IPR_SCHEMAS["FIRE_PREMIUM"]
MASTER_IPR_FIRE_CLAIM = CANONICAL_IPR_SCHEMAS["FIRE_CLAIM"]
MASTER_IPR_CREDIT_PREMIUM = CANONICAL_IPR_SCHEMAS["CREDIT_PREMIUM"]
MASTER_IPR_CREDIT_CLAIM = CANONICAL_IPR_SCHEMAS["CREDIT_CLAIM"]


# ==============================================================================
# LEGACY PER-CEDANT COLUMN DEFINITIONS (FOR REFERENCE & FALLBACK)
# ==============================================================================

MASTER_COLUMNS_PREMI = {
    "aca": [
        "reinsured", "id", "name", "class_of_business", "type_of_cover",
        "treatytype", "treatyyear", "policyno", "endorsement", "sdate",
        "edate", "sdate_master_policy", "tsi_100", "ourshare", "exposure",
        "currency", "premium", "commission", "net", "roe", "production",
        "objekinfo01", "objekinfo02", "period"
    ],
    "tripakarta": [
        "no", "cob", "reinsured", "policy_number", "insured_name", "uw_year",
        "currency", "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
        "tsi_100", "basis_of_indemnity", "occupation_code", "occupation", "location",
        "period_of_insurance_start", "period_of_insurance_end", "cedant_s_share",
        "spreading_of_risk_or", "qs", "surplus", "others", "premium_100", "premium_rate",
        "premi_qs", "comm_qs", "premi_spl", "comm_spl", "marsh_re",
        "premium_qs_marsh_re_share", "premium_spl_marsh_re_share", "note", "remarks", "period"
    ],
    "buanaindependent": [
        "no", "cob_type_of_cover", "reinsured", "policy_number", "insured_name", "uw_year",
        "currency", "breakdown_of_si_md_building", "mb", "stock", "tpl", "bi", "other",
        "tsi_100", "occupation_code", "occupation", "location", "zip_code",
        "period_of_insurance_start", "period_of_insurance_end", "cedants_share",
        "spreading_of_risk_or", "spreading_of_risk_qs", "spreading_of_risk_surplus",
        "spreading_of_risk_others", "premium_100", "premium_rate",
        "premium_reinsurer_share_qs", "premium_reinsurer_share_spl", "new_renewal", "period"
    ],
    "askrida": [
        "no", "cob", "nama_bank_tertanggung", "insured_name", "tanggal_lahir",
        "policy_number", "uw_year", "tanggal_akad", "usia_saat_akad_tahun",
        "period_of_insurance_start", "period_of_insurance_end", "nilai_pertanggungan",
        "premi_original", "premi_reinsurer_share", "premi_indore_share", "currency",
        "reff_of_no_bordereaux", "100_reinsurer_sum_insured", "100_reinsurer_ri_comm",
        "100_reinsurer_netto", "reindo_sum_insured", "reindo_ri_comm", "reindo_netto", "period"
    ],
    "jakrejabar": [
        "no", "nomor_pengajuan", "tgl_pengajuan", "tgl_realisasi", "nomor_sp", "tanggal_sp",
        "nama", "checker", "alamat", "plafond_kredit", "nilai_penjaminan", "ijp",
        "fee_agenbroker", "ijp_netto", "nilai_penjaminan_regaransi", "ijp_regaransi",
        "ijp_riu", "persentase_premi_disesikan_qs", "persentase_premi_riureins",
        "persentase_premi_riuall", "ri_comm_35", "nett_ijp_riu", "bank", "skim", "kota",
        "jangka_waktu", "sektor", "bordero", "tgl_jatuh_tempo", "period"
    ],
    "jamkridajabar": [
        "no", "nomor_pengajuan", "tgl_pengajuan", "tgl_realisasi", "nomor_sp", "tanggal_sp",
        "nama", "checker", "alamat", "plafond_kredit", "nilai_penjaminan", "ijp",
        "fee_agenbroker", "ijp_netto", "nilai_penjaminan_regaransi", "ijp_regaransi",
        "ijp_riu", "persentase_premi_disesikan_qs", "persentase_premi_riureins",
        "persentase_premi_riuall", "ri_comm_35", "nett_ijp_riu", "bank", "skim", "kota",
        "jangka_waktu", "sektor", "bordero", "tgl_jatuh_tempo", "period"
    ]
}

MASTER_COLUMNS_CLAIM = {
    "aca": [
        "claim_no", "policy_number", "class_of_business", "period_of_insurance_start",
        "period_of_insurance_end", "start_period_master_policy", "date_of_loss",
        "cause_of_loss", "claim_event", "our_share_percent", "reinsurer_share_percent",
        "claim_amount_100", "reinsurance_claim", "object_info_1", "object_info_2",
        "treaty_id", "treaty_year", "reinsurer_id", "period"
    ],
    "buanaindependent": [
        "no", "claim_reff_no", "policy_number", "insured_name", "cob_type_of_cover",
        "risk_cat", "uw_year", "period_of_insurance_start", "period_of_insurance_end",
        "occupation_code", "occupation", "zip_code", "dol", "source_direct_coins_inward_fac",
        "curr", "claim_100", "cedants_share_percent", "cedants_share_in_amount",
        "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_surplus",
        "spreading_of_claim_others", "paid_claims_treaty_share", "outstanding_claims_treaty_share",
        "note", "period"
    ],
    "tripakarta": [
        "no", "register_no", "policy_number", "insured_name", "cob", "uw_year",
        "period_of_insurance_start", "period_of_insurance_end", "occupation_code",
        "occupation", "dol", "source_direct_coins_fac", "curr", "claim_100",
        "cedants_share_percent", "cedants_share_in_amount", "spreading_of_claim_or",
        "spreading_of_claim_qs", "spreading_of_claim_spl", "spreading_of_claim_others",
        "claim_qs_marsh_re_share", "claim_spl_marsh_re_share", "os_claims_100",
        "os_claims_marsh_re_share", "note", "period"
    ],
    "askrida": [
        "no", "cob", "claim_reff_number", "policy_number", "reff_of_no_bordereaux",
        "nama_bank_tertanggung", "insured_name", "insured_amount", "period_of_insurance_start",
        "period_of_insurance_end", "waktu_pertanggungan_bulan", "uw_year", "date_of_loss",
        "cause_of_loss", "currency", "total_incurred_claim", "paid_claims_reins_share",
        "paid_claims_indore_share", "note", "period"
    ],
    "jakrejabar": [
        "no", "policy_number", "id_terjamin", "cob_type_of_cover", "bank_name",
        "insured_name", "period_of_insurance_start", "period_of_insurance_end",
        "uw_year", "sum_insured", "claim_amount_100", "our_share_percent",
        "our_share_amount", "reinsurer_share_percent", "reinsurance_claim",
        "paid_claim_indore", "cession_period", "period"
    ],
    "jamkridajabar": [
        "no", "treaty_year", "bank_pemegang_polis", "nama_peserta_debitur",
        "no_sertifikat_peserta_debitur", "tanggal_lahir", "pelaporan_bordero_premi",
        "date_of_loss", "cause_of_loss", "pokok_kredit_plafond", "klaim_100",
        "bagian_bank_retensi", "bagian_penjaminan_asuransi", "bagian_nasional_re",
        "bagian_riu", "skim", "nilai_kredit_mitra_jj", "trx", "cob", "period"
    ]
}


# ==============================================================================
# SHEET_TO_TABLE_MAPPING (STANDARDIZED LOB CODES: 'fire', 'credit', 'motor', etc.)
# ==============================================================================

SHEET_TO_TABLE_MAPPING = {
    # --- JAMKRIDAJABAR / JAKRE JABAR / ASKRIDA (KREDIT / CREDIT) ---
    "klaim": "credit",
    "restitusi": "credit",
    "subrogasi": "credit",
    "detail premi": "credit",
    "premi jj": "credit",
    "klaim jj": "credit",
    "klaim jakre": "credit",
    "detail klaim": "credit",
    "kredit": "credit",
    "credit": "credit",
    "asuransi kredit": "credit",
    "penjaminan": "credit",
    
    # --- ASKRIDA CLAIM & PREMI ---
    "premi credit qs": "credit",
    "premi credit": "credit",
    "premi_credit": "credit",
    "credit qs": "credit",
    "qs credit": "credit",
    "klaim qs tw 1": "credit",
    "klaim qs tw 2": "credit",
    "klaim qs tw 3": "credit",
    "klaim qs tw 4": "credit",
    "claim qs tw 1": "credit",
    "claim qs tw 2": "credit",
    "claim qs tw 3": "credit",
    "claim qs tw 4": "credit",

    # --- ACA SPESIFIK ---
    "non marine": "fire",
    "non-marine": "fire",
    "nonmarine": "fire",
    "non_marine": "fire",
    "fire": "fire",
    "kebakaran": "fire",

    # --- ACA / TRIPAKARTA / BUANA INDEPENDENT ---
    "property": "fire",
    "mv": "motor",
    "motor vehicle": "motor",
    "motor": "motor",
    "marine cargo": "cargo",
    "cargo": "cargo",
    "marine hull": "hull",
    "hull": "hull",
    "engineering": "engineering",
    "liability": "liability",
    "travel ins": "travel",
    "travel": "travel",
    "credit ins sbqs": "credit",
    "surety ship sbqs": "surety",
    "surety": "surety",
    "misc": "misc",
    "pa": "pa",

    # --- BUANA INDEPENDENT & GENERAL CLAIMS ---
    "premium qs": "fire",
    "premium spl": "fire",
    "premium_qs": "fire",
    "premium_spl": "fire",
    "claims qs": "fire",
    "claims spl": "fire",
    "claims_qs": "fire",
    "claims_spl": "fire",
    "claim qs": "fire",
    "claim spl": "fire",
    "claim_qs": "fire",
    "claim_spl": "fire",
}