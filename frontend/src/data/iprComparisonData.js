// src/data/iprComparisonData.js
/**
 * Matriks Perbandingan Format IPR vs Kolom Sumber Masing-Masing Cedant
 * Menyajikan padanan kolom baku IPR (Individual Policy Record) 
 * terhadap struktur berkas mentah masing-masing ceding company.
 */

export const CEDANTS_COMPARISON_LIST = [
  { id: 'aca', label: 'ACA', fullName: 'PT Asuransi Central Asia' },
  { id: 'tripakarta', label: 'TRIPAKARTA', fullName: 'PT Asuransi Tri Pakarta' },
  { id: 'buanaindependent', label: 'BUANA INDEPENDENT', fullName: 'PT Asuransi Buana Independent' },
  { id: 'askrida', label: 'ASKRIDA', fullName: 'PT Asuransi Bangun Askrida' },
  { id: 'jamkridajabar', label: 'JAMKRIDA JABAR', fullName: 'PT Jamkrida Jabar' },
  { id: 'jakrejabar', label: 'JAKRE JABAR', fullName: 'PT Jakre Jabar' }
];

export const IPR_COMPARISON_MATRIX = {
  // =========================================================================
  // 1. FIRE - PREMIUM (51 Standard Attributes)
  // =========================================================================
  FIRE_PREMIUM: [
    {
      no: 1,
      iprLabel: "No",
      dbField: "no",
      sqlType: "BIGINT",
      required: false,
      description: "Nomor urut registrasi data",
      cedants: {
        aca: "id",
        tripakarta: "no",
        buanaindependent: "no",
        askrida: "no",
        jamkridajabar: "no",
        jakrejabar: "no"
      }
    },
    {
      no: 2,
      iprLabel: "COB",
      dbField: "cob",
      sqlType: "TEXT",
      required: true,
      description: "Class of Business (Lini Bisnis Asuransi / Okupasi)",
      cedants: {
        aca: "class_of_business",
        tripakarta: "cob",
        buanaindependent: "cob_type_of_cover",
        askrida: "cob",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 3,
      iprLabel: "POLICY NUMBER",
      dbField: "policy_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Polis Asuransi Pokok",
      cedants: {
        aca: "policyno",
        tripakarta: "policy_number",
        buanaindependent: "policy_number",
        askrida: "policy_number",
        jamkridajabar: "nomor_sp",
        jakrejabar: "nomor_sp"
      }
    },
    {
      no: 4,
      iprLabel: "CERTIFICATE NUMBER",
      dbField: "certificate_number",
      sqlType: "TEXT",
      required: false,
      description: "Nomor Sertifikat / Peserta Kepesertaan",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "nomor_pengajuan",
        jakrejabar: "nomor_pengajuan"
      }
    },
    {
      no: 5,
      iprLabel: "INSURED NAME",
      dbField: "insured_name",
      sqlType: "TEXT",
      required: true,
      description: "Nama Lengkap Tertanggung / Debitur",
      cedants: {
        aca: "name",
        tripakarta: "insured_name",
        buanaindependent: "insured_name",
        askrida: "insured_name",
        jamkridajabar: "nama",
        jakrejabar: "nama"
      }
    },
    {
      no: 6,
      iprLabel: "INSURED AFFILIATION",
      dbField: "insured_affiliation",
      sqlType: "TEXT",
      required: false,
      description: "Afiliasi Tertanggung / Nama Bank Penyalur Kredit",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "nama_bank_tertanggung",
        jamkridajabar: "bank",
        jakrejabar: "bank"
      }
    },
    {
      no: 7,
      iprLabel: "PERIOD OF INSURANCE START",
      dbField: "period_start",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Awal Pertanggungan (Inception Date)",
      cedants: {
        aca: "sdate",
        tripakarta: "period_of_insurance_start",
        buanaindependent: "period_of_insurance_start",
        askrida: "period_of_insurance_start",
        jamkridajabar: "tgl_realisasi",
        jakrejabar: "tgl_realisasi"
      }
    },
    {
      no: 8,
      iprLabel: "PERIOD OF INSURANCE END",
      dbField: "period_end",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Akhir Pertanggungan (Expiry Date)",
      cedants: {
        aca: "edate",
        tripakarta: "period_of_insurance_end",
        buanaindependent: "period_of_insurance_end",
        askrida: "period_of_insurance_end",
        jamkridajabar: "tgl_jatuh_tempo",
        jakrejabar: "tgl_jatuh_tempo"
      }
    },
    {
      no: 9,
      iprLabel: "UW YEAR",
      dbField: "uw_year",
      sqlType: "BIGINT",
      required: true,
      description: "Tahun Underwriting / Treaty Year",
      cedants: {
        aca: "treatyyear",
        tripakarta: "uw_year",
        buanaindependent: "uw_year",
        askrida: "uw_year",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 10,
      iprLabel: "COVERAGE",
      dbField: "coverage",
      sqlType: "TEXT",
      required: true,
      description: "Tipe Jaminan / Skim Pertanggungan",
      cedants: {
        aca: "type_of_cover",
        tripakarta: "cob",
        buanaindependent: "cob_type_of_cover",
        askrida: "cob",
        jamkridajabar: "skim",
        jakrejabar: "skim"
      }
    },
    {
      no: 11,
      iprLabel: "POLICY TYPE",
      dbField: "policy_type",
      sqlType: "TEXT",
      required: false,
      description: "Jenis Perjanjian / Tipe Polis",
      cedants: {
        aca: "treatytype",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 12,
      iprLabel: "CURRENCY",
      dbField: "currency",
      sqlType: "TEXT",
      required: true,
      description: "Mata Uang Transaksi (IDR, USD, dll)",
      cedants: {
        aca: "currency",
        tripakarta: "currency",
        buanaindependent: "currency",
        askrida: "currency",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 13,
      iprLabel: "BREAKDOWN SI: MD/Building",
      dbField: "si_md_building",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Bangunan (Material Damage)",
      cedants: {
        aca: "-",
        tripakarta: "breakdown_of_si_md_building",
        buanaindependent: "breakdown_of_si_md_building",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 14,
      iprLabel: "BREAKDOWN SI: Machinery",
      dbField: "si_machinery",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Mesin & Peralatan",
      cedants: {
        aca: "-",
        tripakarta: "mb",
        buanaindependent: "mb",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 15,
      iprLabel: "BREAKDOWN SI: STOCK",
      dbField: "si_stock",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Stok / Persediaan Barang",
      cedants: {
        aca: "-",
        tripakarta: "stock",
        buanaindependent: "stock",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 16,
      iprLabel: "BREAKDOWN SI: TPL",
      dbField: "si_tpl",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Third Party Liability",
      cedants: {
        aca: "-",
        tripakarta: "tpl",
        buanaindependent: "tpl",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 17,
      iprLabel: "BREAKDOWN SI: BI",
      dbField: "si_bi",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Business Interruption",
      cedants: {
        aca: "-",
        tripakarta: "bi",
        buanaindependent: "bi",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 18,
      iprLabel: "BREAKDOWN SI: OTHERS",
      dbField: "si_others",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Nilai Pertanggungan Objek Lainnya",
      cedants: {
        aca: "-",
        tripakarta: "other",
        buanaindependent: "other",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 19,
      iprLabel: "100% TSI",
      dbField: "tsi_100_percent",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Total Sum Insured / Plafond Pinjaman 100%",
      cedants: {
        aca: "tsi_100",
        tripakarta: "tsi_100",
        buanaindependent: "tsi_100",
        askrida: "nilai_pertanggungan",
        jamkridajabar: "plafond_kredit",
        jakrejabar: "plafond_kredit"
      }
    },
    {
      no: 20,
      iprLabel: "BASIS OF INDEMNITY",
      dbField: "basis_of_indemnity",
      sqlType: "TEXT",
      required: true,
      description: "Dasar Ganti Rugi / Nilai Penjaminan",
      cedants: {
        aca: "-",
        tripakarta: "basis_of_indemnity",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "nilai_penjaminan",
        jakrejabar: "nilai_penjaminan"
      }
    },
    {
      no: 21,
      iprLabel: "LOL / PML / EML (amount)",
      dbField: "pml_amount",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Estimated Maximum Loss / Probable Maximum Loss (Nominal)",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "100_reinsurer_sum_insured",
        jamkridajabar: "nilai_penjaminan_regaransi",
        jakrejabar: "nilai_penjaminan_regaransi"
      }
    },
    {
      no: 22,
      iprLabel: "LOL / PML / EML (%)",
      dbField: "pml_percentage",
      sqlType: "NUMERIC(10,4)",
      required: true,
      description: "Persentase Estimasi Kerugian Maksimal (PML %)",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "persentase_premi_disesikan_qs",
        jakrejabar: "persentase_premi_disesikan_qs"
      }
    },
    {
      no: 23,
      iprLabel: "EQ ZONE",
      dbField: "eq_zone",
      sqlType: "TEXT",
      required: true,
      description: "Zona Gempa Bumi (Earthquake Zone)",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 24,
      iprLabel: "OCCUPATION CODE",
      dbField: "occupation_code",
      sqlType: "TEXT",
      required: true,
      description: "Kode Okupasi / Penggunaan Risiko (Tarif OJK)",
      cedants: {
        aca: "-",
        tripakarta: "occupation_code",
        buanaindependent: "occupation_code",
        askrida: "-",
        jamkridajabar: "sektor",
        jakrejabar: "sektor"
      }
    },
    {
      no: 25,
      iprLabel: "OCCUPATION",
      dbField: "occupation",
      sqlType: "TEXT",
      required: false,
      description: "Deskripsi Okupasi / Bidang Usaha",
      cedants: {
        aca: "objekinfo01",
        tripakarta: "occupation",
        buanaindependent: "occupation",
        askrida: "-",
        jamkridajabar: "sektor",
        jakrejabar: "sektor"
      }
    },
    {
      no: 26,
      iprLabel: "LOCATION",
      dbField: "location",
      sqlType: "TEXT",
      required: true,
      description: "Alamat / Lokasi Objek Pertanggungan",
      cedants: {
        aca: "objekinfo02",
        tripakarta: "location",
        buanaindependent: "location",
        askrida: "-",
        jamkridajabar: "alamat",
        jakrejabar: "alamat"
      }
    },
    {
      no: 27,
      iprLabel: "ZIP CODE",
      dbField: "zip_code",
      sqlType: "TEXT",
      required: true,
      description: "Kode Pos Wilayah Risiko",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "zip_code",
        askrida: "-",
        jamkridajabar: "kota",
        jakrejabar: "kota"
      }
    },
    {
      no: 28,
      iprLabel: "COORDINATES: Latitude",
      dbField: "latitude",
      sqlType: "TEXT",
      required: false,
      description: "Koordinat Lintang Lokasi Risiko",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 29,
      iprLabel: "COORDINATES: Longitude",
      dbField: "longitude",
      sqlType: "TEXT",
      required: false,
      description: "Koordinat Bujur Lokasi Risiko",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 30,
      iprLabel: "CONSTRUCTION CLASS",
      dbField: "construction_class",
      sqlType: "TEXT",
      required: true,
      description: "Kelas Konstruksi Bangunan (Kelas 1, 2, atau 3)",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 31,
      iprLabel: "SOURCE (DIRECT/INWARD)",
      dbField: "source_business",
      sqlType: "TEXT",
      required: true,
      description: "Sumber Bisnis Penutupan Asuransi",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "source_direct_coins_inward_fac",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 32,
      iprLabel: "ENDORSEMENT (YES/ NO)",
      dbField: "is_endorsement",
      sqlType: "TEXT",
      required: true,
      description: "Status Perubahan / Endosemen Polis",
      cedants: {
        aca: "endorsement",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 33,
      iprLabel: "Effective Date of Endorsement",
      dbField: "endorsement_effective_date",
      sqlType: "TEXT",
      required: false,
      description: "Tanggal Efektif Berlakunya Endosemen",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 34,
      iprLabel: "Description of Endorsement",
      dbField: "endorsement_description",
      sqlType: "TEXT",
      required: false,
      description: "Uraian / Keterangan Perubahan Endosemen",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 35,
      iprLabel: "CEDANT'S SHARE %",
      dbField: "cedant_share_percent",
      sqlType: "NUMERIC(10,4)",
      required: true,
      description: "Porsi Retensi / Share Perusahaan Ceding (%)",
      cedants: {
        aca: "ourshare",
        tripakarta: "cedant_s_share",
        buanaindependent: "cedants_share",
        askrida: "-",
        jamkridajabar: "persentase_premi_riureins",
        jakrejabar: "persentase_premi_riureins"
      }
    },
    {
      no: 36,
      iprLabel: "CEDANT'S SHARE IN AMOUNT",
      dbField: "cedant_share_amount",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Nominal Nilai Eksposur Share Cedant",
      cedants: {
        aca: "exposure",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 37,
      iprLabel: "TOTAL CO-INSURANCE PANELS",
      dbField: "total_coinsurance_panels",
      sqlType: "TEXT",
      required: false,
      description: "Daftar Panel Perusahaan Koasuransi",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 38,
      iprLabel: "SPREADING OF RISK: OR",
      dbField: "risk_or",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Alokasi Retensi Sendiri (Own Retention)",
      cedants: {
        aca: "-",
        tripakarta: "spreading_of_risk_or",
        buanaindependent: "spreading_of_risk_or",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 39,
      iprLabel: "SPREADING OF RISK: QS",
      dbField: "risk_qs",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Alokasi Porsi Quota Share (QS)",
      cedants: {
        aca: "-",
        tripakarta: "qs",
        buanaindependent: "spreading_of_risk_qs",
        askrida: "-",
        jamkridajabar: "persentase_premi_disesikan_qs",
        jakrejabar: "persentase_premi_disesikan_qs"
      }
    },
    {
      no: 40,
      iprLabel: "SPREADING OF RISK: SURPLUS",
      dbField: "risk_surplus",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Alokasi Porsi Surplus Treaty",
      cedants: {
        aca: "-",
        tripakarta: "surplus",
        buanaindependent: "spreading_of_risk_surplus",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 41,
      iprLabel: "SPREADING OF RISK: OTHERS",
      dbField: "risk_others",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Alokasi Porsi Fasilitas Lainnya / Fac Inward",
      cedants: {
        aca: "-",
        tripakarta: "others",
        buanaindependent: "spreading_of_risk_others",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 42,
      iprLabel: "100% Premium",
      dbField: "premium_100_percent",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Total Premi Bruto 100% (Gross Premium)",
      cedants: {
        aca: "premium",
        tripakarta: "premium_100",
        buanaindependent: "premium_100",
        askrida: "premi_original",
        jamkridajabar: "ijp",
        jakrejabar: "ijp"
      }
    },
    {
      no: 43,
      iprLabel: "Premium Gross Rate",
      dbField: "premium_gross_rate",
      sqlType: "NUMERIC(10,6)",
      required: true,
      description: "Tarif Suku Premi Bruto",
      cedants: {
        aca: "-",
        tripakarta: "premium_rate",
        buanaindependent: "premium_rate",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 44,
      iprLabel: "Discount",
      dbField: "discount",
      sqlType: "NUMERIC(20,2)",
      required: false,
      description: "Komisi / Potongan Biaya Reasuransi",
      cedants: {
        aca: "commission",
        tripakarta: "comm_qs",
        buanaindependent: "-",
        askrida: "100_reinsurer_ri_comm",
        jamkridajabar: "fee_agenbroker",
        jakrejabar: "fee_agenbroker"
      }
    },
    {
      no: 45,
      iprLabel: "First Loss Scale",
      dbField: "first_loss_scale",
      sqlType: "TEXT",
      required: false,
      description: "Skala First Loss (bila polis First Loss)",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 46,
      iprLabel: "Premium Net Rate",
      dbField: "premium_net_rate",
      sqlType: "NUMERIC(10,6)",
      required: false,
      description: "Tarif Suku Premi Netto / Pendapatan Bersih",
      cedants: {
        aca: "net",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "100_reinsurer_netto",
        jamkridajabar: "ijp_netto",
        jakrejabar: "ijp_netto"
      }
    },
    {
      no: 47,
      iprLabel: "Premium (100% Ceded Premium)",
      dbField: "ceded_premium_100",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Premi Reasuransi yang Disesikan (100% Treaty)",
      cedants: {
        aca: "production",
        tripakarta: "premi_qs",
        buanaindependent: "premium_reinsurer_share_qs",
        askrida: "premi_reinsurer_share",
        jamkridajabar: "ijp_regaransi",
        jakrejabar: "ijp_regaransi"
      }
    },
    {
      no: 48,
      iprLabel: "Premium (Indonesia Re Share)",
      dbField: "indonesia_re_share_premium",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Premi Bagian Khusus PT Reasuransi Indonesia Utama (Persero)",
      cedants: {
        aca: "-",
        tripakarta: "marsh_re",
        buanaindependent: "premium_reinsurer_share_spl",
        askrida: "premi_indore_share",
        jamkridajabar: "ijp_riu",
        jakrejabar: "ijp_riu"
      }
    },
    {
      no: 49,
      iprLabel: "SPECIAL ACCEPTANCE (YES / NO)",
      dbField: "special_acceptance",
      sqlType: "TEXT",
      required: true,
      description: "Akseptasi Khusus / Keterangan Persetujuan Reasuransi",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "new_renewal",
        askrida: "-",
        jamkridajabar: "checker",
        jakrejabar: "checker"
      }
    },
    {
      no: 50,
      iprLabel: "Description (reason/ subjectivities)",
      dbField: "special_acceptance_desc",
      sqlType: "TEXT",
      required: false,
      description: "Keterangan Subjektivitas / Alasan Akseptasi Khusus",
      cedants: {
        aca: "-",
        tripakarta: "remarks",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "bordero",
        jakrejabar: "bordero"
      }
    },
    {
      no: 51,
      iprLabel: "NOTE",
      dbField: "note",
      sqlType: "TEXT",
      required: false,
      description: "Catatan Tambahan Transaksi Bordero",
      cedants: {
        aca: "-",
        tripakarta: "note",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    }
  ],

  // =========================================================================
  // 2. FIRE - CLAIM (43 Standard Attributes)
  // =========================================================================
  FIRE_CLAIM: [
    {
      no: 1,
      iprLabel: "No",
      dbField: "no",
      sqlType: "BIGINT",
      required: false,
      description: "Nomor urut registrasi klaim",
      cedants: {
        aca: "claim_no",
        tripakarta: "no",
        buanaindependent: "no",
        askrida: "no",
        jamkridajabar: "no",
        jakrejabar: "no"
      }
    },
    {
      no: 2,
      iprLabel: "COB",
      dbField: "cob",
      sqlType: "TEXT",
      required: true,
      description: "Lini Bisnis Objek Klaim",
      cedants: {
        aca: "class_of_business",
        tripakarta: "cob",
        buanaindependent: "cob_type_of_cover",
        askrida: "cob",
        jamkridajabar: "cob_type_of_cover",
        jakrejabar: "cob_type_of_cover"
      }
    },
    {
      no: 3,
      iprLabel: "CLAIM REFFERENCE NUMBER",
      dbField: "claim_ref_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Registrasi / Berkas Klaim Cedant",
      cedants: {
        aca: "claim_no",
        tripakarta: "register_no",
        buanaindependent: "claim_reff_no",
        askrida: "claim_reff_number",
        jamkridajabar: "id_terjamin",
        jakrejabar: "id_terjamin"
      }
    },
    {
      no: 4,
      iprLabel: "POLICY NUMBER",
      dbField: "policy_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Polis Induk Terkait Klaim",
      cedants: {
        aca: "policy_number",
        tripakarta: "policy_number",
        buanaindependent: "policy_number",
        askrida: "policy_number",
        jamkridajabar: "policy_number",
        jakrejabar: "policy_number"
      }
    },
    {
      no: 5,
      iprLabel: "CERTIFICATE NUMBER",
      dbField: "certificate_number",
      sqlType: "TEXT",
      required: false,
      description: "Nomor Sertifikat Peserta",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "reff_of_no_bordereaux",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 6,
      iprLabel: "Reff No of Bordereaux",
      dbField: "reff_bordereaux_premium",
      sqlType: "TEXT",
      required: false,
      description: "Nomor Referensi Bordero Premi Awal",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "reff_of_no_bordereaux",
        jamkridajabar: "cession_period",
        jakrejabar: "cession_period"
      }
    },
    {
      no: 7,
      iprLabel: "INSURED NAME",
      dbField: "insured_name",
      sqlType: "TEXT",
      required: true,
      description: "Nama Tertanggung yang Mengalami Kerugian",
      cedants: {
        aca: "-",
        tripakarta: "insured_name",
        buanaindependent: "insured_name",
        askrida: "insured_name",
        jamkridajabar: "insured_name",
        jakrejabar: "insured_name"
      }
    },
    {
      no: 8,
      iprLabel: "PERIOD OF INSURANCE START",
      dbField: "period_start",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Awal Pertanggungan Polis",
      cedants: {
        aca: "period_of_insurance_start",
        tripakarta: "period_of_insurance_start",
        buanaindependent: "period_of_insurance_start",
        askrida: "period_of_insurance_start",
        jamkridajabar: "period_of_insurance_start",
        jakrejabar: "period_of_insurance_start"
      }
    },
    {
      no: 9,
      iprLabel: "PERIOD OF INSURANCE END",
      dbField: "period_end",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Akhir Pertanggungan Polis",
      cedants: {
        aca: "period_of_insurance_end",
        tripakarta: "period_of_insurance_end",
        buanaindependent: "period_of_insurance_end",
        askrida: "period_of_insurance_end",
        jamkridajabar: "period_of_insurance_end",
        jakrejabar: "period_of_insurance_end"
      }
    },
    {
      no: 10,
      iprLabel: "UW YEAR",
      dbField: "uw_year",
      sqlType: "BIGINT",
      required: true,
      description: "Tahun Underwriting / Perjanjian Treaty",
      cedants: {
        aca: "treaty_year",
        tripakarta: "uw_year",
        buanaindependent: "uw_year",
        askrida: "uw_year",
        jamkridajabar: "uw_year",
        jakrejabar: "uw_year"
      }
    },
    {
      no: 11,
      iprLabel: "OCCUPATION CODE",
      dbField: "occupation_code",
      sqlType: "TEXT",
      required: true,
      description: "Kode Okupasi Objek Klaim",
      cedants: {
        aca: "-",
        tripakarta: "occupation_code",
        buanaindependent: "occupation_code",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 12,
      iprLabel: "OCCUPATION",
      dbField: "occupation",
      sqlType: "TEXT",
      required: false,
      description: "Deskripsi Okupasi Objek Klaim",
      cedants: {
        aca: "object_info_1",
        tripakarta: "occupation",
        buanaindependent: "occupation",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 13,
      iprLabel: "LOCATION",
      dbField: "location",
      sqlType: "TEXT",
      required: true,
      description: "Lokasi Terjadinya Peristiwa Kerugian",
      cedants: {
        aca: "object_info_2",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 14,
      iprLabel: "ZIP CODE",
      dbField: "zip_code",
      sqlType: "TEXT",
      required: true,
      description: "Kode Pos Wilayah Kejadian",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "zip_code",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 15,
      iprLabel: "Date of Loss (DOL)",
      dbField: "date_of_loss",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Kejadian Peristiwa Klaim",
      cedants: {
        aca: "date_of_loss",
        tripakarta: "dol",
        buanaindependent: "dol",
        askrida: "date_of_loss",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 16,
      iprLabel: "Settled Date",
      dbField: "settled_date",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Penyelesaian / Pembayaran Klaim",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 17,
      iprLabel: "PROXIMATE CAUSE",
      dbField: "proximate_cause",
      sqlType: "TEXT",
      required: true,
      description: "Penyebab Langsung / Pokok Kerugian",
      cedants: {
        aca: "claim_event",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 18,
      iprLabel: "CAUSE OF LOSS",
      dbField: "cause_of_loss",
      sqlType: "TEXT",
      required: true,
      description: "Sebab Kerugian (Kebakaran, Banjir, dll)",
      cedants: {
        aca: "cause_of_loss",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "cause_of_loss",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 19,
      iprLabel: "CURRENCY",
      dbField: "currency",
      sqlType: "TEXT",
      required: true,
      description: "Mata Uang Pembayaran Klaim",
      cedants: {
        aca: "-",
        tripakarta: "curr",
        buanaindependent: "curr",
        askrida: "currency",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 20,
      iprLabel: "TOTAL INCURRED CLAIM 100%",
      dbField: "total_incurred_claim_100",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Total Kerugian Klaim 100% (Incurred)",
      cedants: {
        aca: "claim_amount_100",
        tripakarta: "claim_100",
        buanaindependent: "claim_100",
        askrida: "total_incurred_claim",
        jamkridajabar: "claim_amount_100",
        jakrejabar: "claim_amount_100"
      }
    },
    {
      no: 21,
      iprLabel: "CEDANT'S SHARE %",
      dbField: "cedant_share_percent",
      sqlType: "NUMERIC(10,4)",
      required: true,
      description: "Share Retensi Perusahaan Ceding (%)",
      cedants: {
        aca: "our_share_percent",
        tripakarta: "cedants_share_percent",
        buanaindependent: "cedants_share_percent",
        askrida: "-",
        jamkridajabar: "our_share_percent",
        jakrejabar: "our_share_percent"
      }
    },
    {
      no: 22,
      iprLabel: "CEDANT'S SHARE IN AMOUNT",
      dbField: "cedant_share_amount",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Nominal Share Cedant",
      cedants: {
        aca: "-",
        tripakarta: "cedants_share_in_amount",
        buanaindependent: "cedants_share_in_amount",
        askrida: "-",
        jamkridajabar: "our_share_amount",
        jakrejabar: "our_share_amount"
      }
    },
    {
      no: 23,
      iprLabel: "SPREADING OF CLAIM: OR",
      dbField: "claim_or",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Beban Klaim Retensi Sendiri (OR)",
      cedants: {
        aca: "-",
        tripakarta: "spreading_of_claim_or",
        buanaindependent: "spreading_of_claim_or",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 24,
      iprLabel: "SPREADING OF CLAIM: QS",
      dbField: "claim_qs",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Beban Klaim Quota Share",
      cedants: {
        aca: "-",
        tripakarta: "spreading_of_claim_qs",
        buanaindependent: "spreading_of_claim_qs",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 25,
      iprLabel: "SPREADING OF CLAIM: SURPLUS",
      dbField: "claim_surplus",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Beban Klaim Surplus Treaty",
      cedants: {
        aca: "-",
        tripakarta: "spreading_of_claim_spl",
        buanaindependent: "spreading_of_claim_surplus",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 26,
      iprLabel: "Paid Claims (Indonesia Re Share)",
      dbField: "paid_claims_indonesia_re_share",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Klaim Dibayar Bagian PT Indonesia Re",
      cedants: {
        aca: "reinsurance_claim",
        tripakarta: "claim_qs_marsh_re_share",
        buanaindependent: "paid_claims_treaty_share",
        askrida: "paid_claims_indore_share",
        jamkridajabar: "paid_claim_indore",
        jakrejabar: "paid_claim_indore"
      }
    },
    {
      no: 27,
      iprLabel: "Outstanding Claims (Indonesia Re Share)",
      dbField: "outstanding_claims_indonesia_re_share",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Cadangan Klaim Terutang Bagian Indonesia Re",
      cedants: {
        aca: "-",
        tripakarta: "os_claims_marsh_re_share",
        buanaindependent: "outstanding_claims_treaty_share",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 28,
      iprLabel: "NOTE",
      dbField: "note",
      sqlType: "TEXT",
      required: false,
      description: "Keterangan Tambahan Klaim",
      cedants: {
        aca: "-",
        tripakarta: "note",
        buanaindependent: "note",
        askrida: "note",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    }
  ],

  // =========================================================================
  // 3. CREDIT - PREMIUM (11 Standard Attributes)
  // =========================================================================
  CREDIT_PREMIUM: [
    {
      no: 1,
      iprLabel: "No",
      dbField: "no",
      sqlType: "BIGINT",
      required: false,
      description: "Nomor Urut Pendaftaran Debitur",
      cedants: {
        aca: "no",
        tripakarta: "no",
        buanaindependent: "no",
        askrida: "no",
        jamkridajabar: "no",
        jakrejabar: "no"
      }
    },
    {
      no: 2,
      iprLabel: "No PK / Sertifikat",
      dbField: "policy_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Perjanjian Kredit (PK) atau Nomor Sertifikat",
      cedants: {
        aca: "policyno",
        tripakarta: "policy_number",
        buanaindependent: "policy_number",
        askrida: "policy_number",
        jamkridajabar: "nomor_sp",
        jakrejabar: "nomor_sp"
      }
    },
    {
      no: 3,
      iprLabel: "Nama Debitur",
      dbField: "insured_name",
      sqlType: "TEXT",
      required: true,
      description: "Nama Lengkap Debitur / Terjamin",
      cedants: {
        aca: "name",
        tripakarta: "insured_name",
        buanaindependent: "insured_name",
        askrida: "insured_name",
        jamkridajabar: "nama",
        jakrejabar: "nama"
      }
    },
    {
      no: 4,
      iprLabel: "Tgl Lahir",
      dbField: "date_of_birth",
      sqlType: "TEXT",
      required: false,
      description: "Tanggal Lahir Debitur",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "tanggal_lahir",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 5,
      iprLabel: "Plafon Pinjaman",
      dbField: "tsi_100_percent",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Plafond Pinjaman / Nilai Pertanggungan Kredit",
      cedants: {
        aca: "tsi_100",
        tripakarta: "tsi_100",
        buanaindependent: "tsi_100",
        askrida: "nilai_pertanggungan",
        jamkridajabar: "plafond_kredit",
        jakrejabar: "plafond_kredit"
      }
    },
    {
      no: 6,
      iprLabel: "Mulai Asuransi",
      dbField: "period_start",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Mulai Masa Penjaminan Kredit",
      cedants: {
        aca: "sdate",
        tripakarta: "period_of_insurance_start",
        buanaindependent: "period_of_insurance_start",
        askrida: "period_of_insurance_start",
        jamkridajabar: "tgl_realisasi",
        jakrejabar: "tgl_realisasi"
      }
    },
    {
      no: 7,
      iprLabel: "Akhir Asuransi",
      dbField: "period_end",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Jatuh Tempo / Akhir Pinjaman",
      cedants: {
        aca: "edate",
        tripakarta: "period_of_insurance_end",
        buanaindependent: "period_of_insurance_end",
        askrida: "period_of_insurance_end",
        jamkridajabar: "tgl_jatuh_tempo",
        jakrejabar: "tgl_jatuh_tempo"
      }
    },
    {
      no: 8,
      iprLabel: "Tenor (Bulan)",
      dbField: "tenor_months",
      sqlType: "BIGINT",
      required: false,
      description: "Jangka Waktu Pinjaman dalam Satuan Bulan",
      cedants: {
        aca: "-",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "waktu_pertanggungan_bulan",
        jamkridajabar: "jangka_waktu",
        jakrejabar: "jangka_waktu"
      }
    },
    {
      no: 9,
      iprLabel: "Premi Bruto",
      dbField: "premium_100_percent",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Nilai Premi / IJP Bruto",
      cedants: {
        aca: "premium",
        tripakarta: "premium_100",
        buanaindependent: "premium_100",
        askrida: "premi_original",
        jamkridajabar: "ijp",
        jakrejabar: "ijp"
      }
    },
    {
      no: 10,
      iprLabel: "Share Reasuransi",
      dbField: "indonesia_re_share_premium",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Share Porsi Reasuransi Indonesia Re",
      cedants: {
        aca: "-",
        tripakarta: "marsh_re",
        buanaindependent: "premium_reinsurer_share_spl",
        askrida: "premi_indore_share",
        jamkridajabar: "ijp_riu",
        jakrejabar: "ijp_riu"
      }
    },
    {
      no: 11,
      iprLabel: "NOTE",
      dbField: "note",
      sqlType: "TEXT",
      required: false,
      description: "Catatan atau Keterangan Tambahan",
      cedants: {
        aca: "-",
        tripakarta: "note",
        buanaindependent: "-",
        askrida: "-",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    }
  ],

  // =========================================================================
  // 4. CREDIT - CLAIM (9 Standard Attributes)
  // =========================================================================
  CREDIT_CLAIM: [
    {
      no: 1,
      iprLabel: "No",
      dbField: "no",
      sqlType: "BIGINT",
      required: false,
      description: "Nomor Urut Pendaftaran Klaim",
      cedants: {
        aca: "no",
        tripakarta: "no",
        buanaindependent: "no",
        askrida: "no",
        jamkridajabar: "no",
        jakrejabar: "no"
      }
    },
    {
      no: 2,
      iprLabel: "No Laporan Klaim",
      dbField: "claim_ref_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Registrasi / Berkas Klaim Penjaminan",
      cedants: {
        aca: "claim_no",
        tripakarta: "register_no",
        buanaindependent: "claim_reff_no",
        askrida: "claim_reff_number",
        jamkridajabar: "id_terjamin",
        jakrejabar: "id_terjamin"
      }
    },
    {
      no: 3,
      iprLabel: "No PK / Sertifikat",
      dbField: "policy_number",
      sqlType: "TEXT",
      required: true,
      description: "Nomor Polis / Nomor Perjanjian Kredit Terjamin",
      cedants: {
        aca: "policyno",
        tripakarta: "policy_number",
        buanaindependent: "policy_number",
        askrida: "policy_number",
        jamkridajabar: "policy_number",
        jakrejabar: "policy_number"
      }
    },
    {
      no: 4,
      iprLabel: "Nama Debitur",
      dbField: "insured_name",
      sqlType: "TEXT",
      required: true,
      description: "Nama Debitur Terjamin yang Mengalami Gagal Bayar / Meninggal",
      cedants: {
        aca: "name",
        tripakarta: "insured_name",
        buanaindependent: "insured_name",
        askrida: "insured_name",
        jamkridajabar: "insured_name",
        jakrejabar: "insured_name"
      }
    },
    {
      no: 5,
      iprLabel: "Tgl Kejadian / Meninggal",
      dbField: "date_of_loss",
      sqlType: "TEXT",
      required: true,
      description: "Tanggal Kejadian Kerugian / Tanggal Debitur Meninggal",
      cedants: {
        aca: "date_of_loss",
        tripakarta: "dol",
        buanaindependent: "dol",
        askrida: "date_of_loss",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 6,
      iprLabel: "Penyebab Klaim",
      dbField: "cause_of_loss",
      sqlType: "TEXT",
      required: true,
      description: "Penyebab Kerugian Klaim Kredit (Meninggal, PHK, Macet)",
      cedants: {
        aca: "cause_of_loss",
        tripakarta: "-",
        buanaindependent: "-",
        askrida: "cause_of_loss",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    },
    {
      no: 7,
      iprLabel: "Tuntutan Klaim",
      dbField: "total_incurred_claim_100",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Nilai Pengajuan Klaim Pokok Pinjaman Terjamin",
      cedants: {
        aca: "claim_amount_100",
        tripakarta: "claim_100",
        buanaindependent: "claim_100",
        askrida: "total_incurred_claim",
        jamkridajabar: "claim_amount_100",
        jakrejabar: "claim_amount_100"
      }
    },
    {
      no: 8,
      iprLabel: "Klaim Dibayar (Indonesia Re)",
      dbField: "paid_claims_indonesia_re_share",
      sqlType: "NUMERIC(20,2)",
      required: true,
      description: "Nominal Klaim Dibayar Share Reasuransi Indonesia Re",
      cedants: {
        aca: "reinsurance_claim",
        tripakarta: "claim_qs_marsh_re_share",
        buanaindependent: "paid_claims_treaty_share",
        askrida: "paid_claims_indore_share",
        jamkridajabar: "paid_claim_indore",
        jakrejabar: "paid_claim_indore"
      }
    },
    {
      no: 9,
      iprLabel: "NOTE",
      dbField: "note",
      sqlType: "TEXT",
      required: false,
      description: "Catatan atau Keterangan Status Klaim",
      cedants: {
        aca: "-",
        tripakarta: "note",
        buanaindependent: "note",
        askrida: "note",
        jamkridajabar: "-",
        jakrejabar: "-"
      }
    }
  ]
};
