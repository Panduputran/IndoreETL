MASTER_COLUMNS_PREMI = {
    "aca": [
        "reinsured", "id", "name", "class_of_business", "type_of_cover",
        "treatytype", "treatyyear", "policyno", "endorsement", "sdate",
        "edate", "sdate_master_policy", "tsi_100", "ourshare", "exposure",
        "currency", "premium", "commission", "net", "roe", "production",
        "objekinfo01", "objekinfo02", "period"
    ],
    "tripakarta": [
        "no", "cob", "reinsured", "policy_number", "insured_name",
        "uw_year", "currency", "breakdown_of_si_md_building", "mb", "stock",
        "tpl", "bi", "other", "100_tsi", "basis_of_indemnity",
        "occupation_code", "occupation", "location", "period_of_insurance_start", "end",
        "source_direct_coins_inward_fac", "cedant_s_share", "spreading_of_risk_or", "qs", "surplus",
        "others", "100_premium", "premium_rate", "premi_qs", "comm_qs",
        "premi_spl", "comm_spl", "marsh_re", "premium_qs_marsh_re_share", "premium_spl_marsh_re_share",
        "note", "remarks", "period", "treaty_name_qs", "treaty_name_surplus"
    ],
    "buanaindependent": [
        "no", "cob_type_of_cover", "reinsured", "policy_number", "insured_name",
        "uw_year", "currency", "breakdown_of_si_md_building", "mb", "stock",
        "tpl", "bi", "other", "tsi_100", "occupation_code", "occupation",  # Gunakan tsi_100 untuk Buana
        "location", "zip_code", "period_of_insurance_start", "period_of_insurance_end",
        "cedants_share", "spreading_of_risk_or", "spreading_of_risk_qs",
        "spreading_of_risk_surplus", "spreading_of_risk_others", "premium_100",  # Gunakan premium_100 untuk Buana
        "premium_rate", 

        # --- DUA KOLOM TERPISAH ---
        "premium_reinsurer_share_qs",
        "premium_reinsurer_share_spl",
        "new_renewal",
        "period"
    ]
}

MASTER_COLUMNS_CLAIM = {
    "buanaindependent": [
        "no", "claim_reff_no", "policy_number", "insured_name", "cob_type_of_cover",
        "risk_cat", "uw_year", "period_of_insurance_start", "period_of_insurance_end",
        "occupation_code", "occupation", "zip_code", "dol", "source_direct_coins_inward_fac",
        "curr", "claim_100", "cedants_share_percent", "cedants_share_in_amount",
        "spreading_of_claim_or", "spreading_of_claim_qs", "spreading_of_claim_surplus",
        "spreading_of_claim_others", "paid_claims_treaty_share", "outstanding_claims_treaty_share",
        "note", "period"
    ]
}

SHEET_TO_TABLE_MAPPING = {
    # --- ACA / TRIPAKARTA ---
    "property": "fire",
    "mv": "motor",
    "marine cargo": "cargo",
    "cargo": "cargo",
    "marine hull": "hull",
    "hull": "hull",
    "engineering": "engineering",
    "liability": "liability",
    "travel ins": "travel",
    "credit ins sbqs": "credit",
    "surety ship sbqs": "surety",
    "misc": "misc",
    "pa": "pa",
    
    # --- BUANA INDEPENDENT ---
    "premium qs": "fire",
    "premium spl": "fire",
    "premium_qs": "fire",
    "premium_spl": "fire",
    
    # --- CLAIM (Satu Tabel Fire) ---
    "claims qs": "fire",
    "claims spl": "fire",
    "claims_qs": "fire",
    "claims_spl": "fire",
    "claim qs": "fire",
    "claim spl": "fire",
    "claim_qs": "fire",
    "claim_spl": "fire"
}