// src/data/iprMasterData.js

export const iprMasterColumns = {
  // ==========================================
  // 1. FIRE - PREMIUM (51 Kolom IPR)
  // ==========================================
  FIRE_PREMIUM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id"] },
    { iprLabel: "COB", dbField: "cob", sqlType: "TEXT", required: true, aliases: ["cob", "class_of_business", "lini_bisnis", "class"] },
    { iprLabel: "POLICY NUMBER", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["policy_number", "policy_no", "polis", "no_polis", "policy"] },
    { iprLabel: "CERTIFICATE NUMBER", dbField: "certificate_number", sqlType: "TEXT", required: false, aliases: ["certificate_number", "cert_no", "sertifikat", "no_peserta", "spaj"] },
    { iprLabel: "INSURED NAME", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["insured_name", "insured", "nama_tertanggung", "debitur", "nama"] },
    { iprLabel: "INSURED AFFILIATION", dbField: "insured_affiliation", sqlType: "TEXT", required: false, aliases: ["insured_affiliation", "affiliation", "afiliasi", "group"] },
    { iprLabel: "PERIOD OF INSURANCE START", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["period_start", "start", "inception_date", "tgl_mulai", "eff_date", "period_of_insurance_start"] },
    { iprLabel: "PERIOD OF INSURANCE END", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["period_end", "end", "expiry_date", "tgl_akhir", "exp_date", "period_of_insurance_end"] },
    { iprLabel: "UW YEAR", dbField: "uw_year", sqlType: "BIGINT", required: true, aliases: ["uw_year", "underwriting_year", "tahun_uw", "uw"] },
    { iprLabel: "COVERAGE", dbField: "coverage", sqlType: "TEXT", required: true, aliases: ["coverage", "jaminan", "tipe_jaminan", "perils"] },
    { iprLabel: "POLICY TYPE", dbField: "policy_type", sqlType: "TEXT", required: false, aliases: ["policy_type", "tipe_polis", "jenis_polis"] },
    { iprLabel: "CURRENCY", dbField: "currency", sqlType: "TEXT", required: true, aliases: ["currency", "curr", "mata_uang", "valuta"] },
    { iprLabel: "BREAKDOWN SI: MD/Building", dbField: "si_md_building", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_md_building", "breakdown_of_si_mb", "breakdown_of_si_building", "si_building", "si_mb", "md_building"] },
    { iprLabel: "BREAKDOWN SI: Machinery", dbField: "si_machinery", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_machinery", "si_machinery", "mesin"] },
    { iprLabel: "BREAKDOWN SI: STOCK", dbField: "si_stock", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_stock", "si_stock", "stok", "persediaan"] },
    { iprLabel: "BREAKDOWN SI: TPL", dbField: "si_tpl", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_tpl", "si_tpl", "third_party"] },
    { iprLabel: "BREAKDOWN SI: BI", dbField: "si_bi", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_bi", "si_bi", "business_interruption"] },
    { iprLabel: "BREAKDOWN SI: OTHERS", dbField: "si_others", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_other", "breakdown_of_si_others", "breakdown_si_other", "si_other", "si_others", "others_si"] },
    { iprLabel: "100% TSI", dbField: "tsi_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["tsi", "total_sum_insured", "100_tsi", "plafon", "nilai_pertanggungan", "100%_tsi"] },
    { iprLabel: "BASIS OF INDEMNITY", dbField: "basis_of_indemnity", sqlType: "TEXT", required: true, aliases: ["basis_of_indemnity", "indemnity", "dasar_ganti_rugi"] },
    { iprLabel: "LOL / PML / EML (amount)", dbField: "pml_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["pml_amount", "eml_amount", "lol_amount", "pml_nilai", "lol_pml_eml_amount"] },
    { iprLabel: "LOL / PML / EML (%)", dbField: "pml_percentage", sqlType: "NUMERIC(10,4)", required: true, aliases: ["pml_percentage", "pml_percent", "pml_%", "eml_%", "lol_pml_eml_%"] },
    { iprLabel: "EQ ZONE", dbField: "eq_zone", sqlType: "TEXT", required: true, aliases: ["eq_zone", "zona_gempa", "earthquake_zone", "zona_eq"] },
    { iprLabel: "OCCUPATION CODE", dbField: "occupation_code", sqlType: "TEXT", required: true, aliases: ["occupation_code", "kode_okupasi", "occ_code"] },
    { iprLabel: "OCCUPATION", dbField: "occupation", sqlType: "TEXT", required: false, aliases: ["occupation", "okupasi", "penggunaan"] },
    { iprLabel: "LOCATION", dbField: "location", sqlType: "TEXT", required: true, aliases: ["location", "lokasi", "alamat", "risk_location"] },
    { iprLabel: "ZIP CODE", dbField: "zip_code", sqlType: "TEXT", required: true, aliases: ["zip_code", "kodepos", "postal_code", "kode_pos"] },
    { iprLabel: "COORDINATES: Latitude", dbField: "latitude", sqlType: "TEXT", required: false, aliases: ["latitude", "lat", "lintang", "coordinates_latitude"] },
    { iprLabel: "COORDINATES: Longitude", dbField: "longitude", sqlType: "TEXT", required: false, aliases: ["longitude", "long", "bujur", "coordinates_longitude"] },
    { iprLabel: "CONSTRUCTION CLASS", dbField: "construction_class", sqlType: "TEXT", required: true, aliases: ["construction_class", "kelas_konstruksi", "construction"] },
    { iprLabel: "SOURCE (DIRECT/INWARD)", dbField: "source_business", sqlType: "TEXT", required: true, aliases: ["source", "direct_inward", "sumber_bisnis", "source_business", "source_direct_coins_inward_fac"] },
    { iprLabel: "ENDORSEMENT (YES/ NO)", dbField: "is_endorsement", sqlType: "TEXT", required: true, aliases: ["endorsement", "is_endorsement", "endosemen"] },
    { iprLabel: "Effective Date of Endorsement", dbField: "endorsement_effective_date", sqlType: "TEXT", required: false, aliases: ["endorsement_effective_date", "tgl_endosemen", "end_date"] },
    { iprLabel: "Description of Endorsement", dbField: "endorsement_description", sqlType: "TEXT", required: false, aliases: ["endorsement_description", "ket_endosemen", "desc_endorsement"] },
    { iprLabel: "CEDANT'S SHARE %", dbField: "cedant_share_percent", sqlType: "NUMERIC(10,4)", required: true, aliases: ["cedants_share_%", "cedant_share_percent", "share_cedant_%", "our_share_percent", "share_%"] },
    { iprLabel: "CEDANT'S SHARE IN AMOUNT", dbField: "cedant_share_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["cedants_share_in_amount", "cedant_share_amount", "share_cedant_amount", "our_share_amount"] },
    { iprLabel: "TOTAL CO-INSURANCE PANELS", dbField: "total_coinsurance_panels", sqlType: "TEXT", required: false, aliases: ["coinsurance", "coinsurance_panels", "koasuransi"] },
    { iprLabel: "SPREADING OF RISK: OR", dbField: "risk_or", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_or", "spreading_risk_or", "risk_or", "own_retention"] },
    { iprLabel: "SPREADING OF RISK: QS", dbField: "risk_qs", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_qs", "spreading_risk_qs", "risk_qs", "premi_qs", "premium_qs"] },
    { iprLabel: "SPREADING OF RISK: SURPLUS", dbField: "risk_surplus", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_surplus", "spreading_risk_surplus", "risk_surplus", "premi_spl", "premium_spl"] },
    { iprLabel: "SPREADING OF RISK: OTHERS", dbField: "risk_others", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_others", "spreading_of_risk_other", "spreading_risk_others", "risk_others", "others_risk"] },
    { iprLabel: "100% Premium", dbField: "premium_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["100%_premium", "total_premium", "premi_100", "gross_premium", "premi", "100_premium"] },
    { iprLabel: "Premium Gross Rate", dbField: "premium_gross_rate", sqlType: "NUMERIC(10,6)", required: true, aliases: ["gross_rate", "rate_premi", "premium_gross_rate", "premium_rate"] },
    { iprLabel: "Discount", dbField: "discount", sqlType: "NUMERIC(20,2)", required: false, aliases: ["discount", "diskon", "potongan"] },
    { iprLabel: "First Loss Scale", dbField: "first_loss_scale", sqlType: "TEXT", required: false, aliases: ["first_loss_scale", "first_loss", "scale"] },
    { iprLabel: "Premium Net Rate", dbField: "premium_net_rate", sqlType: "NUMERIC(10,6)", required: false, aliases: ["net_rate", "rate_netto"] },
    { iprLabel: "Premium (100% Ceded Premium)", dbField: "ceded_premium_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["ceded_premium", "100_ceded_premium", "premi_reasuransi"] },
    { iprLabel: "Premium (Indonesia Re Share)", dbField: "indonesia_re_share_premium", sqlType: "NUMERIC(20,2)", required: true, aliases: ["indonesia_re_share", "share_indonesiare_premi", "inbound_premium", "premium_marsh_re_share"] },
    { iprLabel: "SPECIAL ACCEPTANCE (YES / NO)", dbField: "special_acceptance", sqlType: "TEXT", required: true, aliases: ["special_acceptance", "sp_acceptance", "akseptasi_khusus"] },
    { iprLabel: "Description (reason/ subjectivities)", dbField: "special_acceptance_desc", sqlType: "TEXT", required: false, aliases: ["subjectivities", "reason", "keterangan_akseptasi"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["note", "remarks", "catatan", "keterangan"] }
  ],

  // ==========================================
  // 2. FIRE - CLAIM (43 Kolom IPR)
  // ==========================================
  FIRE_CLAIM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id"] },
    { iprLabel: "COB", dbField: "cob", sqlType: "TEXT", required: true, aliases: ["cob", "class_of_business", "lini_bisnis", "class"] },
    { iprLabel: "CLAIM REFFERENCE NUMBER", dbField: "claim_ref_number", sqlType: "TEXT", required: true, aliases: ["claim_ref_number", "claim_no", "no_klaim", "claim_number", "register", "register_no"] },
    { iprLabel: "POLICY NUMBER", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["policy_number", "policy_no", "polis", "no_polis"] },
    { iprLabel: "CERTIFICATE NUMBER", dbField: "certificate_number", sqlType: "TEXT", required: false, aliases: ["certificate_number", "cert_no", "sertifikat", "no_peserta"] },
    { iprLabel: "Reff No of Bordereaux (premium cession)", dbField: "reff_bordereaux_premium", sqlType: "TEXT", required: false, aliases: ["reff_bordereaux", "cession_ref", "no_bordero_premi"] },
    { iprLabel: "INSURED NAME", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["insured_name", "insured", "nama_tertanggung", "debitur", "nama"] },
    { iprLabel: "PERIOD OF INSURANCE START", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["period_start", "start", "inception_date", "tgl_mulai", "period_of_insurance_start"] },
    { iprLabel: "PERIOD OF INSURANCE END", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["period_end", "end", "expiry_date", "tgl_akhir", "period_of_insurance_end"] },
    { iprLabel: "UW YEAR", dbField: "uw_year", sqlType: "BIGINT", required: true, aliases: ["uw_year", "underwriting_year", "tahun_uw", "uw"] },
    { iprLabel: "OCCUPATION CODE", dbField: "occupation_code", sqlType: "TEXT", required: true, aliases: ["occupation_code", "kode_okupasi", "occ_code"] },
    { iprLabel: "OCCUPATION", dbField: "occupation", sqlType: "TEXT", required: false, aliases: ["occupation", "okupasi", "penggunaan"] },
    { iprLabel: "LOCATION", dbField: "location", sqlType: "TEXT", required: true, aliases: ["location", "lokasi", "alamat", "risk_location"] },
    { iprLabel: "ZIP CODE", dbField: "zip_code", sqlType: "TEXT", required: true, aliases: ["zip_code", "kodepos", "postal_code", "kode_pos"] },
    { iprLabel: "COORDINATES: Latitude", dbField: "latitude", sqlType: "TEXT", required: false, aliases: ["latitude", "lat", "lintang", "coordinates_latitude"] },
    { iprLabel: "COORDINATES: Longitude", dbField: "longitude", sqlType: "TEXT", required: false, aliases: ["longitude", "long", "bujur", "coordinates_longitude"] },
    { iprLabel: "Date of Loss", dbField: "date_of_loss", sqlType: "TEXT", required: true, aliases: ["date_of_loss", "dol", "tgl_kejadian", "loss_date"] },
    { iprLabel: "Settled Date", dbField: "settled_date", sqlType: "TEXT", required: true, aliases: ["settled_date", "tgl_selesai", "tgl_bayar", "paid_date"] },
    { iprLabel: "PROXIMATE CAUSE", dbField: "proximate_cause", sqlType: "TEXT", required: true, aliases: ["proximate_cause", "sebab_utama", "penyebab_langsung"] },
    { iprLabel: "CAUSE OF LOSS", dbField: "cause_of_loss", sqlType: "TEXT", required: true, aliases: ["cause_of_loss", "cause", "penyebab_klaim", "alasan"] },
    { iprLabel: "COVERAGE AFFECTED", dbField: "coverage_affected", sqlType: "TEXT", required: true, aliases: ["coverage_affected", "jaminan_terkena", "coverage"] },
    { iprLabel: "CURR", dbField: "currency", sqlType: "TEXT", required: true, aliases: ["currency", "curr", "mata_uang", "valuta"] },
    { iprLabel: "CLAIM 100%: MD/Building", dbField: "claim_md_building", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_building", "claim_bangunan", "claim_md", "claim_100_md_building"] },
    { iprLabel: "CLAIM 100%: Machinery", dbField: "claim_machinery", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_machinery", "claim_mesin", "claim_100_machinery"] },
    { iprLabel: "CLAIM 100%: STOCK", dbField: "claim_stock", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_stock", "claim_stok", "claim_100_stock"] },
    { iprLabel: "CLAIM 100%: TPL", dbField: "claim_tpl", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_tpl", "claim_third_party", "claim_100_tpl"] },
    { iprLabel: "CLAIM 100%: BI", dbField: "claim_bi", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_bi", "claim_business_interruption", "claim_100_bi"] },
    { iprLabel: "CLAIM 100%: OTHER", dbField: "claim_other", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_other", "claim_lainnya", "claim_100_other"] },
    { iprLabel: "CLAIM 100%: Adjuster Fee", dbField: "claim_adjuster_fee", sqlType: "NUMERIC(20,2)", required: false, aliases: ["adjuster_fee", "biaya_adjuster", "fee_adjuster", "claim_100_adjuster_fee"] },
    { iprLabel: "TOTAL INCURRED CLAIM 100%", dbField: "total_incurred_claim_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["total_incurred_claim", "claim_100", "nilai_klaim", "claim_amount", "tuntutan", "total_incurred_claim_100%"] },
    { iprLabel: "CEDANT'S SHARE %", dbField: "cedant_share_percent", sqlType: "NUMERIC(10,4)", required: true, aliases: ["cedants_share_%", "cedant_share_percent", "share_cedant_%", "our_share_%"] },
    { iprLabel: "CEDANT'S SHARE IN AMOUNT", dbField: "cedant_share_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["cedants_share_in_amount", "cedant_share_amount", "share_cedant_amount"] },
    { iprLabel: "SPREADING OF CLAIM: OR", dbField: "claim_or", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_or", "claim_or", "or_klaim", "retensi_klaim"] },
    { iprLabel: "SPREADING OF CLAIM: QS", dbField: "claim_qs", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_qs", "claim_qs", "claim_quota_share", "claim_quota_share_marsh_re_share"] },
    { iprLabel: "SPREADING OF CLAIM: SURPLUS", dbField: "claim_surplus", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_surplus", "claim_surplus", "claim_surplus_marsh_re_share"] },
    { iprLabel: "SPREADING OF CLAIM: OTHERS", dbField: "claim_others", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_others", "claim_others", "lainnya_klaim"] },
    { iprLabel: "TYPE OF LOSS (RISK / CAT)", dbField: "type_of_loss", sqlType: "TEXT", required: true, aliases: ["type_of_loss", "risk_cat", "tipe_klaim", "jenis_loss"] },
    { iprLabel: "Paid Claims (Reinsurer Share)", dbField: "paid_claims_reinsurer_share", sqlType: "NUMERIC(20,2)", required: false, aliases: ["paid_claims_reinsurer", "klaim_dibayar_reas", "paid_claims_reinsurer_share"] },
    { iprLabel: "Outstanding Claims (Reinsurer Share)", dbField: "outstanding_claims_reinsurer_share", sqlType: "NUMERIC(20,2)", required: false, aliases: ["outstanding_reinsurer", "klaim_os_reas", "outstanding_claims_reinsurer_share"] },
    { iprLabel: "Paid Claims (Indonesia Re Share)", dbField: "paid_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["paid_claims_indonesia_re", "reinsurance_claim", "klaim_reas", "paid_claims_marsh_re_share"] },
    { iprLabel: "Outstanding Claims (Indonesia Re Share)", dbField: "outstanding_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["outstanding_indonesia_re", "os_claim_indonesia_re", "outstanding_claims_marsh_re_share"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["note", "remarks", "catatan", "keterangan"] }
  ],

  // ==========================================
  // 3. CREDIT - PREMIUM
  // ==========================================
  CREDIT_PREMIUM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq"] },
    { iprLabel: "No PK / Sertifikat", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["no_pk", "pk", "policy_no", "polis", "sertifikat", "no_peserta"] },
    { iprLabel: "Nama Debitur", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["nama_debitur", "debitur", "nama", "insured_name"] },
    { iprLabel: "Tgl Lahir", dbField: "date_of_birth", sqlType: "TEXT", required: false, aliases: ["tgl_lahir", "dob", "birth_date"] },
    { iprLabel: "Plafon Pinjaman", dbField: "tsi_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["plafon", "tsi", "pinjaman", "kredit"] },
    { iprLabel: "Mulai Asuransi", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["mulai", "tgl_mulai", "start"] },
    { iprLabel: "Akhir Asuransi", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["akhir", "tgl_akhir", "end"] },
    { iprLabel: "Tenor (Bulan)", dbField: "tenor_months", sqlType: "BIGINT", required: false, aliases: ["tenor", "jangka_waktu", "bulan"] },
    { iprLabel: "Premi Bruto", dbField: "premium_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["premi", "gross_premium", "premi_bruto"] },
    { iprLabel: "Share Reasuransi", dbField: "indonesia_re_share_premium", sqlType: "NUMERIC(20,2)", required: true, aliases: ["share_reas", "indonesia_re_share"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["keterangan", "note", "remarks"] }
  ],

  // ==========================================
  // 4. CREDIT - CLAIM
  // ==========================================
  CREDIT_CLAIM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq"] },
    { iprLabel: "No Laporan Klaim", dbField: "claim_ref_number", sqlType: "TEXT", required: true, aliases: ["no_klaim", "claim_no", "register"] },
    { iprLabel: "No PK / Sertifikat", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["no_pk", "polis", "sertifikat"] },
    { iprLabel: "Nama Debitur", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["nama_debitur", "debitur", "nama"] },
    { iprLabel: "Tgl Kejadian / Meninggal", dbField: "date_of_loss", sqlType: "TEXT", required: true, aliases: ["tgl_kejadian", "dol", "tgl_meninggal"] },
    { iprLabel: "Penyebab Klaim", dbField: "cause_of_loss", sqlType: "TEXT", required: true, aliases: ["penyebab", "sebab", "alasan"] },
    { iprLabel: "Tuntutan Klaim", dbField: "total_incurred_claim_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["tuntutan", "nilai_klaim", "claim_amount"] },
    { iprLabel: "Klaim Dibayar (Indonesia Re)", dbField: "paid_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["klaim_reas", "indonesia_re_claim"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["keterangan", "note"] }
  ]
};

export function getIprSchema(cob = "FIRE", category = "PREMIUM") {
  const isClaim = String(category || "").toUpperCase().includes("CLAIM") || String(category || "").toUpperCase().includes("KLAIM");
  const isCredit = String(cob || "").toUpperCase().includes("CREDIT") || String(cob || "").toUpperCase().includes("KREDIT");

  if (isCredit) {
    return isClaim ? (iprMasterColumns.CREDIT_CLAIM || []) : (iprMasterColumns.CREDIT_PREMIUM || []);
  }
  return isClaim ? (iprMasterColumns.FIRE_CLAIM || []) : (iprMasterColumns.FIRE_PREMIUM || []);
}

export const IPR_COLUMNS_DEFINITION = iprMasterColumns;
export default iprMasterColumns;