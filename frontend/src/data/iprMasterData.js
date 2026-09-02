// src/data/iprMasterData.js

export const iprMasterColumns = {
  // ==========================================
  // 1. FIRE - PREMIUM (51 Kolom IPR)
  // ==========================================
  FIRE_PREMIUM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id", "no_urut", "no."] },
    { iprLabel: "COB", dbField: "cob", sqlType: "TEXT", required: true, aliases: ["cob", "class_of_business", "lini_bisnis", "class", "jenis_asuransi", "cob_type_of_cover"] },
    { iprLabel: "POLICY NUMBER", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["policy_number", "policy_no", "polis", "no_polis", "policy", "nomor_polis", "no_policy", "policyno", "nomor_kebijakan"] },
    { iprLabel: "CERTIFICATE NUMBER", dbField: "certificate_number", sqlType: "TEXT", required: false, aliases: ["certificate_number", "cert_no", "sertifikat", "no_peserta", "spaj", "no_sertifikat", "certificate_no", "no_cert"] },
    { iprLabel: "INSURED NAME", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["insured_name", "insured", "nama_tertanggung", "debitur", "nama", "tertanggung", "nama_nasabah", "nama_peserta", "name", "insuredname"] },
    { iprLabel: "INSURED AFFILIATION", dbField: "insured_affiliation", sqlType: "TEXT", required: false, aliases: ["insured_affiliation", "affiliation", "afiliasi", "group", "grup"] },
    { iprLabel: "PERIOD OF INSURANCE START", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["period_start", "start", "inception_date", "tgl_mulai", "eff_date", "period_of_insurance_start", "effective_date", "tgl_awal", "periode_awal", "start_date", "sdate"] },
    { iprLabel: "PERIOD OF INSURANCE END", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["period_end", "end", "expiry_date", "tgl_akhir", "exp_date", "period_of_insurance_end", "tgl_selesai", "periode_akhir", "end_date", "edate"] },
    { iprLabel: "UW YEAR", dbField: "uw_year", sqlType: "BIGINT", required: true, aliases: ["uw_year", "underwriting_year", "tahun_uw", "uw", "tahun_underwriting", "treatyyear", "treaty_year"] },
    { iprLabel: "COVERAGE", dbField: "coverage", sqlType: "TEXT", required: true, aliases: ["coverage", "jaminan", "tipe_jaminan", "perils", "type_of_cover"] },
    { iprLabel: "POLICY TYPE", dbField: "policy_type", sqlType: "TEXT", required: false, aliases: ["policy_type", "tipe_polis", "jenis_polis", "treatytype", "treaty_type"] },
    { iprLabel: "CURRENCY", dbField: "currency", sqlType: "TEXT", required: true, aliases: ["currency", "curr", "mata_uang", "valuta"] },
    { iprLabel: "BREAKDOWN SI: MD/Building", dbField: "si_md_building", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_md_building", "breakdown_of_si_mb", "breakdown_of_si_building", "si_building", "si_mb", "md_building", "bangunan", "building", "mb"] },
    { iprLabel: "BREAKDOWN SI: Machinery", dbField: "si_machinery", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_machinery", "si_machinery", "mesin", "machinery"] },
    { iprLabel: "BREAKDOWN SI: STOCK", dbField: "si_stock", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_stock", "si_stock", "stok", "persediaan", "stock"] },
    { iprLabel: "BREAKDOWN SI: TPL", dbField: "si_tpl", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_tpl", "si_tpl", "third_party", "tpl"] },
    { iprLabel: "BREAKDOWN SI: BI", dbField: "si_bi", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_bi", "si_bi", "business_interruption", "bi"] },
    { iprLabel: "BREAKDOWN SI: OTHERS", dbField: "si_others", sqlType: "NUMERIC(20,2)", required: false, aliases: ["breakdown_of_si_other", "breakdown_of_si_others", "breakdown_si_other", "si_other", "si_others", "others_si", "other", "lainnya"] },
    { iprLabel: "100% TSI", dbField: "tsi_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["tsi", "total_sum_insured", "100_tsi", "plafon", "nilai_pertanggungan", "100%_tsi", "tsi_100", "sum_insured", "suminsured", "total_tsi", "tsi_total"] },
    { iprLabel: "BASIS OF INDEMNITY", dbField: "basis_of_indemnity", sqlType: "TEXT", required: true, aliases: ["basis_of_indemnity", "indemnity", "dasar_ganti_rugi"] },
    { iprLabel: "LOL / PML / EML (amount)", dbField: "pml_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["pml_amount", "eml_amount", "lol_amount", "pml_nilai", "lol_pml_eml_amount"] },
    { iprLabel: "LOL / PML / EML (%)", dbField: "pml_percentage", sqlType: "NUMERIC(10,4)", required: true, aliases: ["pml_percentage", "pml_percent", "pml_%", "eml_%", "lol_pml_eml_%"] },
    { iprLabel: "EQ ZONE", dbField: "eq_zone", sqlType: "TEXT", required: true, aliases: ["eq_zone", "zona_gempa", "earthquake_zone", "zona_eq", "gempa_bumi"] },
    { iprLabel: "OCCUPATION CODE", dbField: "occupation_code", sqlType: "TEXT", required: true, aliases: ["occupation_code", "kode_okupasi", "occ_code", "kode_penggunaan"] },
    { iprLabel: "OCCUPATION", dbField: "occupation", sqlType: "TEXT", required: false, aliases: ["occupation", "okupasi", "penggunaan", "objekinfo01", "objekinfo02", "deskripsi_okupasi"] },
    { iprLabel: "LOCATION", dbField: "location", sqlType: "TEXT", required: true, aliases: ["location", "lokasi", "alamat", "risk_location", "alamat_risiko", "lokasi_objek"] },
    { iprLabel: "ZIP CODE", dbField: "zip_code", sqlType: "TEXT", required: true, aliases: ["zip_code", "kodepos", "postal_code", "kode_pos", "postcode"] },
    { iprLabel: "COORDINATES: Latitude", dbField: "latitude", sqlType: "TEXT", required: false, aliases: ["latitude", "lat", "lintang", "coordinates_latitude"] },
    { iprLabel: "COORDINATES: Longitude", dbField: "longitude", sqlType: "TEXT", required: false, aliases: ["longitude", "long", "bujur", "coordinates_longitude"] },
    { iprLabel: "CONSTRUCTION CLASS", dbField: "construction_class", sqlType: "TEXT", required: true, aliases: ["construction_class", "kelas_konstruksi", "construction", "konstruksi"] },
    { iprLabel: "SOURCE (DIRECT/INWARD)", dbField: "source_business", sqlType: "TEXT", required: true, aliases: ["source", "direct_inward", "sumber_bisnis", "source_business", "source_direct_coins_inward_fac"] },
    { iprLabel: "ENDORSEMENT (YES/ NO)", dbField: "is_endorsement", sqlType: "TEXT", required: true, aliases: ["endorsement", "is_endorsement", "endosemen"] },
    { iprLabel: "Effective Date of Endorsement", dbField: "endorsement_effective_date", sqlType: "TEXT", required: false, aliases: ["endorsement_effective_date", "tgl_endosemen", "end_date"] },
    { iprLabel: "Description of Endorsement", dbField: "endorsement_description", sqlType: "TEXT", required: false, aliases: ["endorsement_description", "ket_endosemen", "desc_endorsement"] },
    { iprLabel: "CEDANT'S SHARE %", dbField: "cedant_share_percent", sqlType: "NUMERIC(10,4)", required: true, aliases: ["cedants_share_%", "cedant_share_percent", "share_cedant_%", "our_share_percent", "share_%", "ourshare", "our_share"] },
    { iprLabel: "CEDANT'S SHARE IN AMOUNT", dbField: "cedant_share_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["cedants_share_in_amount", "cedant_share_amount", "share_cedant_amount", "our_share_amount", "exposure"] },
    { iprLabel: "TOTAL CO-INSURANCE PANELS", dbField: "total_coinsurance_panels", sqlType: "TEXT", required: false, aliases: ["coinsurance", "coinsurance_panels", "koasuransi"] },
    { iprLabel: "SPREADING OF RISK: OR", dbField: "risk_or", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_or", "spreading_risk_or", "risk_or", "own_retention", "retensi_sendiri", "or"] },
    { iprLabel: "SPREADING OF RISK: QS", dbField: "risk_qs", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_qs", "spreading_risk_qs", "risk_qs", "premi_qs", "premium_qs", "qs"] },
    { iprLabel: "SPREADING OF RISK: SURPLUS", dbField: "risk_surplus", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_surplus", "spreading_risk_surplus", "risk_surplus", "premi_spl", "premium_spl", "surplus"] },
    { iprLabel: "SPREADING OF RISK: OTHERS", dbField: "risk_others", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_risk_others", "spreading_of_risk_other", "spreading_risk_others", "risk_others", "others_risk", "others"] },
    { iprLabel: "100% Premium", dbField: "premium_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["100%_premium", "total_premium", "premi_100", "gross_premium", "premi", "100_premium", "premium", "premi_bruto", "total_premi", "premium_100"] },
    { iprLabel: "Premium Gross Rate", dbField: "premium_gross_rate", sqlType: "NUMERIC(10,6)", required: true, aliases: ["gross_rate", "rate_premi", "premium_gross_rate", "premium_rate", "rate", "tarif"] },
    { iprLabel: "Discount", dbField: "discount", sqlType: "NUMERIC(20,2)", required: false, aliases: ["discount", "diskon", "potongan", "commission", "komisi"] },
    { iprLabel: "First Loss Scale", dbField: "first_loss_scale", sqlType: "TEXT", required: false, aliases: ["first_loss_scale", "first_loss", "scale"] },
    { iprLabel: "Premium Net Rate", dbField: "premium_net_rate", sqlType: "NUMERIC(10,6)", required: false, aliases: ["net_rate", "rate_netto", "net"] },
    { iprLabel: "Premium (100% Ceded Premium)", dbField: "ceded_premium_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["ceded_premium", "100_ceded_premium", "premi_reasuransi"] },
    { iprLabel: "Premium (Indonesia Re Share)", dbField: "indonesia_re_share_premium", sqlType: "NUMERIC(20,2)", required: true, aliases: ["indonesia_re_share", "share_indonesiare_premi", "inbound_premium", "premium_marsh_re_share", "marsh_re", "premium_qs_marsh_re_share", "premium_spl_marsh_re_share", "premium_reinsurer_share_qs", "premium_reinsurer_share_spl"] },
    { iprLabel: "SPECIAL ACCEPTANCE (YES / NO)", dbField: "special_acceptance", sqlType: "TEXT", required: true, aliases: ["special_acceptance", "sp_acceptance", "akseptasi_khusus"] },
    { iprLabel: "Description (reason/ subjectivities)", dbField: "special_acceptance_desc", sqlType: "TEXT", required: false, aliases: ["subjectivities", "reason", "keterangan_akseptasi"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["note", "remarks", "catatan", "keterangan"] }
  ],

  // ==========================================
  // 2. FIRE - CLAIM (43 Kolom IPR)
  // ==========================================
  FIRE_CLAIM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id", "no_urut", "no."] },
    { iprLabel: "COB", dbField: "cob", sqlType: "TEXT", required: true, aliases: ["cob", "class_of_business", "lini_bisnis", "class", "jenis_asuransi"] },
    { iprLabel: "CLAIM REFFERENCE NUMBER", dbField: "claim_ref_number", sqlType: "TEXT", required: true, aliases: ["claim_ref_number", "claim_no", "no_klaim", "claim_number", "register", "register_no", "no_register", "nomor_klaim", "claimno"] },
    { iprLabel: "POLICY NUMBER", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["policy_number", "policy_no", "polis", "no_polis", "nomor_polis", "policy", "no_policy"] },
    { iprLabel: "CERTIFICATE NUMBER", dbField: "certificate_number", sqlType: "TEXT", required: false, aliases: ["certificate_number", "cert_no", "sertifikat", "no_peserta", "no_sertifikat"] },
    { iprLabel: "Reff No of Bordereaux (premium cession)", dbField: "reff_bordereaux_premium", sqlType: "TEXT", required: false, aliases: ["reff_bordereaux", "cession_ref", "no_bordero_premi", "reff_of_no_bordereaux"] },
    { iprLabel: "INSURED NAME", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["insured_name", "insured", "nama_tertanggung", "debitur", "nama", "tertanggung", "nama_nasabah", "name"] },
    { iprLabel: "PERIOD OF INSURANCE START", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["period_start", "start", "inception_date", "tgl_mulai", "period_of_insurance_start", "tgl_awal", "sdate"] },
    { iprLabel: "PERIOD OF INSURANCE END", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["period_end", "end", "expiry_date", "tgl_akhir", "period_of_insurance_end", "tgl_selesai", "edate"] },
    { iprLabel: "UW YEAR", dbField: "uw_year", sqlType: "BIGINT", required: true, aliases: ["uw_year", "underwriting_year", "tahun_uw", "uw", "tahun_underwriting"] },
    { iprLabel: "OCCUPATION CODE", dbField: "occupation_code", sqlType: "TEXT", required: true, aliases: ["occupation_code", "kode_okupasi", "occ_code"] },
    { iprLabel: "OCCUPATION", dbField: "occupation", sqlType: "TEXT", required: false, aliases: ["occupation", "okupasi", "penggunaan"] },
    { iprLabel: "LOCATION", dbField: "location", sqlType: "TEXT", required: true, aliases: ["location", "lokasi", "alamat", "risk_location", "alamat_risiko", "lokasi_objek"] },
    { iprLabel: "ZIP CODE", dbField: "zip_code", sqlType: "TEXT", required: true, aliases: ["zip_code", "kodepos", "postal_code", "kode_pos"] },
    { iprLabel: "COORDINATES: Latitude", dbField: "latitude", sqlType: "TEXT", required: false, aliases: ["latitude", "lat", "lintang", "coordinates_latitude"] },
    { iprLabel: "COORDINATES: Longitude", dbField: "longitude", sqlType: "TEXT", required: false, aliases: ["longitude", "long", "bujur", "coordinates_longitude"] },
    { iprLabel: "Date of Loss", dbField: "date_of_loss", sqlType: "TEXT", required: true, aliases: ["date_of_loss", "dol", "tgl_kejadian", "loss_date", "tanggal_kejadian", "tgl_kerugian"] },
    { iprLabel: "Settled Date", dbField: "settled_date", sqlType: "TEXT", required: true, aliases: ["settled_date", "tgl_selesai", "tgl_bayar", "paid_date", "tgl_pelunasan", "date_settled"] },
    { iprLabel: "PROXIMATE CAUSE", dbField: "proximate_cause", sqlType: "TEXT", required: true, aliases: ["proximate_cause", "sebab_utama", "penyebab_langsung"] },
    { iprLabel: "CAUSE OF LOSS", dbField: "cause_of_loss", sqlType: "TEXT", required: true, aliases: ["cause_of_loss", "cause", "penyebab_klaim", "alasan", "penyebab", "sebab_klaim"] },
    { iprLabel: "COVERAGE AFFECTED", dbField: "coverage_affected", sqlType: "TEXT", required: true, aliases: ["coverage_affected", "jaminan_terkena", "coverage"] },
    { iprLabel: "CURR", dbField: "currency", sqlType: "TEXT", required: true, aliases: ["currency", "curr", "mata_uang", "valuta"] },
    { iprLabel: "CLAIM 100%: MD/Building", dbField: "claim_md_building", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_building", "claim_bangunan", "claim_md", "claim_100_md_building", "claim_mb"] },
    { iprLabel: "CLAIM 100%: Machinery", dbField: "claim_machinery", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_machinery", "claim_mesin", "claim_100_machinery"] },
    { iprLabel: "CLAIM 100%: STOCK", dbField: "claim_stock", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_stock", "claim_stok", "claim_100_stock"] },
    { iprLabel: "CLAIM 100%: TPL", dbField: "claim_tpl", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_tpl", "claim_third_party", "claim_100_tpl"] },
    { iprLabel: "CLAIM 100%: BI", dbField: "claim_bi", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_bi", "claim_business_interruption", "claim_100_bi"] },
    { iprLabel: "CLAIM 100%: OTHER", dbField: "claim_other", sqlType: "NUMERIC(20,2)", required: false, aliases: ["claim_other", "claim_lainnya", "claim_100_other"] },
    { iprLabel: "CLAIM 100%: Adjuster Fee", dbField: "claim_adjuster_fee", sqlType: "NUMERIC(20,2)", required: false, aliases: ["adjuster_fee", "biaya_adjuster", "fee_adjuster", "claim_100_adjuster_fee"] },
    { iprLabel: "TOTAL INCURRED CLAIM 100%", dbField: "total_incurred_claim_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["total_incurred_claim", "claim_100", "nilai_klaim", "claim_amount", "tuntutan", "total_incurred_claim_100%", "total_klaim", "jumlah_klaim", "klaim_100", "incurred_claim"] },
    { iprLabel: "CEDANT'S SHARE %", dbField: "cedant_share_percent", sqlType: "NUMERIC(10,4)", required: true, aliases: ["cedants_share_%", "cedant_share_percent", "share_cedant_%", "our_share_%", "our_share_percent", "ourshare"] },
    { iprLabel: "CEDANT'S SHARE IN AMOUNT", dbField: "cedant_share_amount", sqlType: "NUMERIC(20,2)", required: true, aliases: ["cedants_share_in_amount", "cedant_share_amount", "share_cedant_amount", "our_share_amount", "exposure"] },
    { iprLabel: "SPREADING OF CLAIM: OR", dbField: "claim_or", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_or", "claim_or", "or_klaim", "retensi_klaim", "or"] },
    { iprLabel: "SPREADING OF CLAIM: QS", dbField: "claim_qs", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_qs", "claim_qs", "claim_quota_share", "claim_quota_share_marsh_re_share", "qs"] },
    { iprLabel: "SPREADING OF CLAIM: SURPLUS", dbField: "claim_surplus", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_surplus", "claim_surplus", "claim_surplus_marsh_re_share", "surplus"] },
    { iprLabel: "SPREADING OF CLAIM: OTHERS", dbField: "claim_others", sqlType: "NUMERIC(20,2)", required: true, aliases: ["spreading_of_claim_others", "claim_others", "lainnya_klaim", "others"] },
    { iprLabel: "TYPE OF LOSS (RISK / CAT)", dbField: "type_of_loss", sqlType: "TEXT", required: true, aliases: ["type_of_loss", "risk_cat", "tipe_klaim", "jenis_loss"] },
    { iprLabel: "Paid Claims (Reinsurer Share)", dbField: "paid_claims_reinsurer_share", sqlType: "NUMERIC(20,2)", required: false, aliases: ["paid_claims_reinsurer", "klaim_dibayar_reas", "paid_claims_reinsurer_share"] },
    { iprLabel: "Outstanding Claims (Reinsurer Share)", dbField: "outstanding_claims_reinsurer_share", sqlType: "NUMERIC(20,2)", required: false, aliases: ["outstanding_reinsurer", "klaim_os_reas", "outstanding_claims_reinsurer_share"] },
    { iprLabel: "Paid Claims (Indonesia Re Share)", dbField: "paid_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["paid_claims_indonesia_re", "reinsurance_claim", "klaim_reas", "paid_claims_marsh_re_share", "paid_claim_indore", "paid_claim"] },
    { iprLabel: "Outstanding Claims (Indonesia Re Share)", dbField: "outstanding_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["outstanding_indonesia_re", "os_claim_indonesia_re", "outstanding_claims_marsh_re_share", "os_claim"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["note", "remarks", "catatan", "keterangan"] }
  ],

  // ==========================================
  // 3. CREDIT - PREMIUM
  // ==========================================
  CREDIT_PREMIUM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id", "no_urut", "no."] },
    { iprLabel: "No PK / Sertifikat", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["no_pk", "pk", "policy_no", "polis", "sertifikat", "no_peserta", "no_sertifikat_peserta_debitur", "no_rekening"] },
    { iprLabel: "Nama Debitur", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["nama_debitur", "debitur", "nama", "insured_name", "nama_peserta_debitur", "nama_terjamin", "terjamin"] },
    { iprLabel: "Tgl Lahir", dbField: "date_of_birth", sqlType: "TEXT", required: false, aliases: ["tgl_lahir", "dob", "birth_date", "tanggal_lahir"] },
    { iprLabel: "Plafon Pinjaman", dbField: "tsi_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["plafon", "tsi", "pinjaman", "kredit", "pokok_kredit_plafond", "sum_insured", "nilai_kredit_mitra_jj", "plafon_kredit"] },
    { iprLabel: "Mulai Asuransi", dbField: "period_start", sqlType: "TEXT", required: true, aliases: ["mulai", "tgl_mulai", "start", "period_of_insurance_start", "inception_date", "sdate"] },
    { iprLabel: "Akhir Asuransi", dbField: "period_end", sqlType: "TEXT", required: true, aliases: ["akhir", "tgl_akhir", "end", "period_of_insurance_end", "expiry_date", "edate"] },
    { iprLabel: "Tenor (Bulan)", dbField: "tenor_months", sqlType: "BIGINT", required: false, aliases: ["tenor", "jangka_waktu", "bulan", "tenor_bulan"] },
    { iprLabel: "Premi Bruto", dbField: "premium_100_percent", sqlType: "NUMERIC(20,2)", required: true, aliases: ["premi", "gross_premium", "premi_bruto", "pelaporan_bordero_premi", "premium", "total_premi"] },
    { iprLabel: "Share Reasuransi", dbField: "indonesia_re_share_premium", sqlType: "NUMERIC(20,2)", required: true, aliases: ["share_reas", "indonesia_re_share", "bagian_nasional_re", "bagian_riu"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["keterangan", "note", "remarks", "catatan"] }
  ],

  // ==========================================
  // 4. CREDIT - CLAIM
  // ==========================================
  CREDIT_CLAIM: [
    { iprLabel: "No", dbField: "no", sqlType: "BIGINT", required: false, aliases: ["no", "nomor", "seq", "id", "no_urut", "no."] },
    { iprLabel: "No Laporan Klaim", dbField: "claim_ref_number", sqlType: "TEXT", required: true, aliases: ["no_klaim", "claim_no", "register", "claim_number", "no_register", "nomor_klaim"] },
    { iprLabel: "No PK / Sertifikat", dbField: "policy_number", sqlType: "TEXT", required: true, aliases: ["no_pk", "polis", "sertifikat", "policy_no", "no_sertifikat_peserta_debitur", "no_rekening"] },
    { iprLabel: "Nama Debitur", dbField: "insured_name", sqlType: "TEXT", required: true, aliases: ["nama_debitur", "debitur", "nama", "nama_peserta_debitur", "nama_terjamin", "insured_name"] },
    { iprLabel: "Tgl Kejadian / Meninggal", dbField: "date_of_loss", sqlType: "TEXT", required: true, aliases: ["tgl_kejadian", "dol", "tgl_meninggal", "date_of_loss", "tanggal_kejadian"] },
    { iprLabel: "Penyebab Klaim", dbField: "cause_of_loss", sqlType: "TEXT", required: true, aliases: ["penyebab", "sebab", "alasan", "cause_of_loss", "sebab_klaim", "penyebab_klaim"] },
    { iprLabel: "Tuntutan Klaim", dbField: "total_incurred_claim_100", sqlType: "NUMERIC(20,2)", required: true, aliases: ["tuntutan", "nilai_klaim", "claim_amount", "klaim_100", "total_incurred_claim", "pokok_kredit_plafond"] },
    { iprLabel: "Klaim Dibayar (Indonesia Re)", dbField: "paid_claims_indonesia_re_share", sqlType: "NUMERIC(20,2)", required: true, aliases: ["klaim_reas", "indonesia_re_claim", "bagian_nasional_re", "bagian_riu", "paid_claim_indore", "paid_claims_indonesia_re_share"] },
    { iprLabel: "NOTE", dbField: "note", sqlType: "TEXT", required: false, aliases: ["keterangan", "note", "remarks", "catatan"] }
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