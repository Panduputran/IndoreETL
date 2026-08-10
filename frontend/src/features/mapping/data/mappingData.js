// src/features/mapping/data/mappingData.js

// 1. RAW EXCEL HEADERS IPR FORMAT (Standard Acuan)
export const rawExcelHeadersIPR = [
  '-- Biarkan Kosong / Ignored --',
  'No',
  'COB',
  'POLICY NUMBER',
  'CERTIFICATE NUMBER',
  'INSURED NAME',
  'INSURED AFFILIATION',
  'PERIOD OF INSURANCE - START',
  'PERIOD OF INSURANCE - END',
  'UW YEAR',
  'COVERAGE',
  'POLICY TYPE',
  'CURRENCY',
  'BREAKDOWN OF SI - MD/Building',
  'BREAKDOWN OF SI - Machinery',
  'BREAKDOWN OF SI - STOCK',
  'BREAKDOWN OF SI - TPL',
  'BREAKDOWN OF SI - BI',
  'BREAKDOWN OF SI - OTHERS',
  '100% TSI',
  'BASIS OF INDEMNITY',
  'LOL / PML / EML (amount)',
  'LOL / PML / EML (%)',
  'EQ ZONE',
  'OCCUPATION CODE',
  'OCCUPATION',
  'LOCATION',
  'ZIP CODE',
  'COORDINATES - Latitude',
  'COORDINATES - Longitude',
  'CONSTRUCTION CLASS',
  'SOURCE (DIRECT/INWARD)',
  'ENDORSEMENT (YES/ NO)',
  'Effective Date of Endorsement',
  'Description',
  "CEDANT'S SHARE - %",
  "CEDANT'S SHARE - IN AMOUNT",
  'TOTAL CO-INSURANCE PANELS',
  'SPREADING OF RISK - OR',
  'SPREADING OF RISK - QS',
  'SPREADING OF RISK - SURPLUS',
  'SPREADING OF RISK - OTHERS',
  '100% Premium',
  'Premium Gross Rate',
  'Discount',
  'First Loss Scale',
  'Premium Net Rate',
  'Premium (100% Ceded Premium)',
  'Premium (Indonesia Re Share)',
  'SPECIAL ACCEPTANCE (YES / NO)',
  'Description (reason/ subjectivities)',
  'NOTE'
];

// 2. RAW EXCEL HEADERS BORDERO PREMI ASKRIDA (TW4 2016)
export const rawExcelHeadersAskridaPremi = [
  '-- Biarkan Kosong / Ignored --',
  'Nr.',
  'The Insured',
  'Name of Insured',
  'Policy Number',
  'UY',
  'Policy Date',
  'Age',
  'Period Start',
  'Period End',
  'Insured Amount',
  'Gross Premium',
  '100% Reinsurer Premium',
  'REINDO Premium',
  'Curr',
  'PERIODE (SOA 2016 TW 4)'
];

// 3. RAW EXCEL HEADERS BORDERO CLAIM ASKRIDA (TW4 2016)
export const rawExcelHeadersClaim = [
  '-- Biarkan Kosong / Ignored --',
  'Nr.',
  'Policy Number',
  'LKP',
  'SOA',
  'The Insured',
  'Name of Insured',
  'Insured Amount',
  'Period Start',
  'Period End',
  'Umur Asuransi',
  'Treaty Name',
  'DOL',
  'Cause of Loss',
  'Curr',
  'Claim Amount - Gross',
  'Claim Amount - 100% Reinsurer',
  'Claim Amount - RIU Share',
  'Remarks'
];

// 4. RAW EXCEL HEADERS TRIPAKARTA (Q4 PREMI)
export const rawExcelHeadersTripakarta = [
  '-- Biarkan Kosong / Ignored --',
  'No',
  'COB',
  'REINSURED',
  'POLICY NUMBER',
  'INSURED NAME',
  'UW YEAR',
  'CURRENCY',
  'BREAKDOWN OF SI - MD/Building',
  'BREAKDOWN OF SI - MB',
  'BREAKDOWN OF SI - STOCK',
  'BREAKDOWN OF SI - TPL',
  'BREAKDOWN OF SI - BI',
  'BREAKDOWN OF SI - OTHER',
  '100% TSI',
  'BASIS OF INDEMNITY',
  'OCCUPATION CODE',
  'OCCUPATION',
  'LOCATION',
  'PERIOD OF INSURANCE - START',
  'PERIOD OF INSURANCE - END',
  'SOURCE (DIRECT/COINS/INWARD FAC.)',
  "CEDANT'S SHARE",
  'SPREADING OF RISK - OR',
  'SPREADING OF RISK - QS',
  'SPREADING OF RISK - SURPLUS',
  'SPREADING OF RISK - OTHERS',
  '100% Premium',
  'Premium Rate',
  'Premi QS',
  'Comm QS',
  'Premi SPL',
  'Comm SPL',
  '% Marsh Re',
  'Premium QS (Marsh Re Share)',
  'Premium SPL (Marsh Re Share)',
  'NOTE',
  'REMARKS'
];

// 5. RAW EXCEL HEADERS ACA BORDERO
export const rawExcelHeadersACA = [
  '-- Biarkan Kosong / Ignored --',
  'REINSURED',
  'ID',
  'Name',
  'Class of Business',
  'Type of Cover',
  'TreatyType',
  'TreatyYear',
  'PolicyNo',
  'Endorsement',
  'SDate',
  'EDate',
  'SDATE Master Policy',
  'TSI 100%',
  'Ourshare',
  'Exposure',
  'Currency',
  'Premium',
  'Commission',
  'Net',
  'ROE',
  'Production',
  'ObjekInfo01',
  'ObjekInfo02'
];

// 6. RAW EXCEL HEADERS BUANA INDEPENDENT FIRE (LENGKAP SESUAI GAMBAR COKELAT)
export const rawExcelHeadersBuana = [
  '-- Biarkan Kosong / Ignored --',
  'No',
  'COB',
  'REINSURED',
  'POLICY NUMBER',
  'INSURED NAME',
  'UW YEAR',
  'CURRENCY',
  'BREAKDOWN OF SI - MD/Building',
  'BREAKDOWN OF SI - MB',
  'BREAKDOWN OF SI - STOCK',
  'BREAKDOWN OF SI - TPL',
  'BREAKDOWN OF SI - BI',
  'BREAKDOWN OF SI - OTHER',
  '100% TSI',
  'OCCUPATION CODE',
  'OCCUPATION',
  'LOCATION',
  'ZIP CODE',
  'PERIOD OF INSURANCE - START',
  'PERIOD OF INSURANCE - END',
  "CEDANT'S SHARE",
  'SPREADING OF RISK - OR',
  'SPREADING OF RISK - QS',
  'SPREADING OF RISK - SURPLUS',
  'SPREADING OF RISK - OTHERS',
  '100% Premium',
  'Premium Rate',
  'Premium (Reinsurer Share)',
  'NEW/'
];

// DATA DUMMY UNIVERSAL MASTER MAPPING SOURCES
export const dummyEtlSources = [
  { 
    id: 'ETL-ASK-PREMI', 
    name: 'Bordero_Premi_TW4_2016_Askrida.xlsx', 
    cedant: 'PT Asuransi Askrida', 
    type: 'Bordero Premi Kredit',
    rawHeaders: rawExcelHeadersAskridaPremi,
    sheets: [
      { 
        name: 'Premi Kredit Askrida', 
        dbColumns: [
          { key: 'NO', label: 'NO', required: false, type: 'NUMBER' },
          { key: 'COB', label: 'COB (DIISI KREDIT)', required: true, type: 'STRING' },
          { key: 'NAMA_BANK_TERTANGGUNG', label: 'NAMA_BANK_TERTANGGUNG', required: false, type: 'STRING' },
          { key: 'INSURED_NAME', label: 'INSURED_NAME', required: true, type: 'STRING' },
          { key: 'POLICY_NUMBER', label: 'POLICY_NUMBER', required: true, type: 'STRING' },
          { key: 'UW_YEAR', label: 'UW_YEAR', required: false, type: 'NUMBER' },
          { key: 'TANGGAL_AKAD', label: 'TANGGAL_AKAD', required: false, type: 'TIMESTAMP' },
          { key: 'USIA_SAAT_AKAD_TAHUN', label: 'USIA_SAAT_AKAD_TAHUN', required: false, type: 'NUMBER' },
          { key: 'USIA_AKHIR_AKAD_TAHUN', label: 'USIA_AKHIR_AKAD_TAHUN (CALC)', required: false, type: 'NUMBER' },
          { key: 'PERIOD_OF_INSURANCE_START', label: 'PERIOD_OF_INSURANCE_START', required: true, type: 'TIMESTAMP' },
          { key: 'PERIOD_OF_INSURANCE_END', label: 'PERIOD_OF_INSURANCE_END', required: true, type: 'TIMESTAMP' },
          { key: 'WAKTU_PERTANGGUNGAN_BULAN', label: 'WAKTU_PERTANGGUNGAN_BULAN (CALC)', required: false, type: 'NUMBER' },
          { key: 'NILAI_PERTANGGUNGAN', label: 'NILAI_PERTANGGUNGAN', required: true, type: 'DECIMAL (0.01)' },
          { key: 'PREMI_ORIGINAL', label: 'PREMI_ORIGINAL', required: false, type: 'DECIMAL (0.01)' },
          { key: 'PREMI_REINSURER_SHARE', label: 'PREMI_REINSURER_SHARE', required: false, type: 'DECIMAL (0.01)' },
          { key: 'PREMI_INDORE_SHARE', label: 'PREMI_INDORE_SHARE', required: false, type: 'DECIMAL (0.01)' },
          { key: 'CURRENCY', label: 'CURRENCY', required: true, type: 'STRING' },
          { key: 'REFF_OF_NO_BORDEREAUX', label: 'REFF_OF_NO_BORDEREAUX', required: false, type: 'STRING' }
        ],
        defaultMappings: { 
          NO: 'Nr.',
          COB: 'DIISI KREDIT',
          NAMA_BANK_TERTANGGUNG: 'The Insured',
          INSURED_NAME: 'Name of Insured',
          POLICY_NUMBER: 'Policy Number',
          UW_YEAR: 'UY',
          TANGGAL_AKAD: 'Policy Date',
          USIA_SAAT_AKAD_TAHUN: 'Age',
          PERIOD_OF_INSURANCE_START: 'Period Start',
          PERIOD_OF_INSURANCE_END: 'Period End',
          NILAI_PERTANGGUNGAN: 'Insured Amount',
          PREMI_ORIGINAL: 'Gross Premium',
          PREMI_REINSURER_SHARE: '100% Reinsurer Premium',
          PREMI_INDORE_SHARE: 'REINDO Premium',
          CURRENCY: 'Curr',
          REFF_OF_NO_BORDEREAUX: 'PERIODE (SOA 2016 TW 4)'
        }
      }
    ]
  },
  { 
    id: 'ETL-ASK-CLAIM', 
    name: 'Bordero_Claim_TW4_2016_Askrida.xlsx', 
    cedant: 'PT Asuransi Askrida', 
    type: 'Bordero Claim Kredit',
    rawHeaders: rawExcelHeadersClaim,
    sheets: [
      { 
        name: 'Bordero Claim', 
        dbColumns: [
          { key: 'NO', label: 'NO', required: false, type: 'NUMBER' },
          { key: 'COB', label: 'COB (DIISI KREDIT)', required: true, type: 'STRING' },
          { key: 'CLAIM_REFF_NUMBER', label: 'CLAIM_REFF_NUMBER (LKP)', required: true, type: 'STRING' },
          { key: 'POLICY_NUMBER', label: 'POLICY_NUMBER', required: true, type: 'STRING' },
          { key: 'REFF_OF_NO_BORDEREAUX', label: 'REFF_OF_NO_BORDEREAUX (SOA)', required: false, type: 'STRING' },
          { key: 'NAMA_BANK_TERTANGGUNG', label: 'NAMA_BANK_TERTANGGUNG', required: false, type: 'STRING' },
          { key: 'INSURED_NAME', label: 'INSURED_NAME', required: true, type: 'STRING' },
          { key: 'NILAI_PERTANGGUNGAN', label: 'NILAI_PERTANGGUNGAN', required: true, type: 'DECIMAL (0.01)' },
          { key: 'PERIOD_OF_INSURANCE_START', label: 'PERIOD_OF_INSURANCE_START', required: true, type: 'TIMESTAMP' },
          { key: 'PERIOD_OF_INSURANCE_END', label: 'PERIOD_OF_INSURANCE_END', required: true, type: 'TIMESTAMP' },
          { key: 'WAKTU_PERTANGGUNGAN_BULAN', label: 'WAKTU_PERTANGGUNGAN_BULAN', required: false, type: 'NUMBER' },
          { key: 'UW_YEAR', label: 'UW_YEAR', required: false, type: 'NUMBER' },
          { key: 'DATE_OF_LOSS', label: 'DATE_OF_LOSS (DOL)', required: true, type: 'TIMESTAMP' },
          { key: 'CAUSE_OF_LOSS', label: 'CAUSE_OF_LOSS', required: false, type: 'STRING' },
          { key: 'CURRENCY', label: 'CURRENCY', required: true, type: 'STRING' },
          { key: 'TOTAL_INCURRED_CLAIM', label: 'TOTAL_INCURRED_CLAIM', required: true, type: 'DECIMAL (0.01)' },
          { key: 'PAID_CLAIMS_REINS_SHARE', label: 'PAID_CLAIMS_REINS_SHARE', required: false, type: 'DECIMAL (0.01)' },
          { key: 'PAID_CLAIMS_INDORE_SHARE', label: 'PAID_CLAIMS_INDORE_SHARE', required: false, type: 'DECIMAL (0.01)' },
          { key: 'NOTE', label: 'NOTE / REMARKS', required: false, type: 'STRING' }
        ],
        defaultMappings: { 
          NO: 'Nr.',
          COB: 'DIISI KREDIT',
          CLAIM_REFF_NUMBER: 'LKP',
          POLICY_NUMBER: 'Policy Number',
          REFF_OF_NO_BORDEREAUX: 'SOA',
          NAMA_BANK_TERTANGGUNG: 'The Insured',
          INSURED_NAME: 'Name of Insured',
          NILAI_PERTANGGUNGAN: 'Insured Amount',
          PERIOD_OF_INSURANCE_START: 'Period Start',
          PERIOD_OF_INSURANCE_END: 'Period End',
          WAKTU_PERTANGGUNGAN_BULAN: 'Umur Asuransi',
          UW_YEAR: 'Treaty Name',
          DATE_OF_LOSS: 'DOL',
          CAUSE_OF_LOSS: 'Cause of Loss',
          CURRENCY: 'Curr',
          TOTAL_INCURRED_CLAIM: 'Claim Amount - Gross',
          PAID_CLAIMS_REINS_SHARE: 'Claim Amount - 100% Reinsurer',
          PAID_CLAIMS_INDORE_SHARE: 'Claim Amount - RIU Share',
          NOTE: 'Remarks'
        }
      }
    ]
  },
  { 
    id: 'ETL-TRIPAKARTA', 
    name: 'Bordero_Premi_Q4_Tripakarta.xlsx', 
    cedant: 'PT Asuransi Tripakarta', 
    type: 'Bordero Premi',
    rawHeaders: rawExcelHeadersTripakarta,
    sheets: [
      { 
        name: 'Premi Tripakarta', 
        dbColumns: [
          { key: 'NO', label: 'NO', required: false, type: 'NUMBER' },
          { key: 'COB', label: 'COB', required: true, type: 'STRING' },
          { key: 'POLICY_NUMBER', label: 'POLICY NUMBER', required: true, type: 'STRING' },
          { key: 'INSURED_NAME', label: 'INSURED NAME', required: true, type: 'STRING' },
          { key: 'UW_YEAR', label: 'UW YEAR', required: true, type: 'NUMBER' },
          { key: 'CURRENCY', label: 'CURRENCY', required: true, type: 'STRING' },
          { key: 'TSI_100_PERCENT', label: '100% TSI', required: true, type: 'DECIMAL (0.01)' },
          { key: 'PERIOD_OF_INSURANCE_START', label: 'PERIOD OF INSURANCE (START)', required: true, type: 'TIMESTAMP' },
          { key: 'PERIOD_OF_INSURANCE_END', label: 'PERIOD OF INSURANCE (END)', required: true, type: 'TIMESTAMP' },
          { key: 'PREMIUM_100_PERCENT', label: '100% Premium', required: true, type: 'DECIMAL (0.01)' }
        ],
        defaultMappings: { 
          NO: 'No',
          COB: 'COB',
          POLICY_NUMBER: 'POLICY NUMBER',
          INSURED_NAME: 'INSURED NAME',
          UW_YEAR: 'UW YEAR',
          CURRENCY: 'CURRENCY',
          TSI_100_PERCENT: '100% TSI',
          PERIOD_OF_INSURANCE_START: 'PERIOD OF INSURANCE - START',
          PERIOD_OF_INSURANCE_END: 'PERIOD OF INSURANCE - END',
          PREMIUM_100_PERCENT: '100% Premium'
        }
      }
    ]
  },
  { 
    id: 'ETL-ACA', 
    name: 'Bordero_ACA_Fire_2026.xlsx', 
    cedant: 'PT Asuransi Central Asia (ACA)', 
    type: 'Bordero ACA',
    rawHeaders: rawExcelHeadersACA,
    sheets: [
      { 
        name: 'Bordero ACA', 
        dbColumns: [
          { key: 'POLICY_NUMBER', label: 'POLICY NUMBER', required: true, type: 'STRING' },
          { key: 'INSURED_NAME', label: 'INSURED NAME', required: true, type: 'STRING' },
          { key: 'COB', label: 'COB / Class of Business', required: true, type: 'STRING' },
          { key: 'PERIOD_OF_INSURANCE_START', label: 'PERIOD OF INSURANCE (START)', required: true, type: 'TIMESTAMP' },
          { key: 'PERIOD_OF_INSURANCE_END', label: 'PERIOD OF INSURANCE (END)', required: true, type: 'TIMESTAMP' },
          { key: 'TSI_100_PERCENT', label: '100% TSI', required: true, type: 'DECIMAL (0.01)' },
          { key: 'CURRENCY', label: 'CURRENCY', required: true, type: 'STRING' },
          { key: 'PREMIUM_100_PERCENT', label: '100% Premium', required: true, type: 'DECIMAL (0.01)' }
        ],
        defaultMappings: { 
          POLICY_NUMBER: 'PolicyNo',
          INSURED_NAME: 'Name',
          COB: 'Class of Business',
          PERIOD_OF_INSURANCE_START: 'SDate',
          PERIOD_OF_INSURANCE_END: 'EDate',
          TSI_100_PERCENT: 'TSI 100%',
          CURRENCY: 'Currency',
          PREMIUM_100_PERCENT: 'Premium'
        }
      }
    ]
  },
  { 
    id: 'ETL-BUANA', 
    name: 'Bordero_Fire_Buana_I.xlsx', 
    cedant: 'PT Asuransi Buana Independent', 
    type: 'Bordero Buana',
    rawHeaders: rawExcelHeadersBuana,
    sheets: [
      { 
        name: 'Fire Buana', 
        dbColumns: [
          { key: 'NO', label: 'NO', required: false, type: 'NUMBER' },
          { key: 'COB', label: 'COB', required: true, type: 'STRING' },
          { key: 'POLICY_NUMBER', label: 'POLICY NUMBER', required: true, type: 'STRING' },
          { key: 'INSURED_NAME', label: 'INSURED NAME', required: true, type: 'STRING' },
          { key: 'UW_YEAR', label: 'UW YEAR', required: false, type: 'NUMBER' },
          { key: 'CURRENCY', label: 'CURRENCY', required: true, type: 'STRING' },
          { key: 'TSI_100_PERCENT', label: '100% TSI', required: true, type: 'DECIMAL (0.01)' },
          { key: 'OCCUPATION_CODE', label: 'OCCUPATION CODE', required: false, type: 'STRING' },
          { key: 'LOCATION', label: 'LOCATION', required: false, type: 'STRING' },
          { key: 'ZIP_CODE', label: 'ZIP CODE', required: false, type: 'STRING' },
          { key: 'PERIOD_OF_INSURANCE_START', label: 'PERIOD OF INSURANCE (START)', required: true, type: 'TIMESTAMP' },
          { key: 'PERIOD_OF_INSURANCE_END', label: 'PERIOD OF INSURANCE (END)', required: true, type: 'TIMESTAMP' },
          { key: 'PREMIUM_100_PERCENT', label: '100% Premium', required: true, type: 'DECIMAL (0.01)' },
          { key: 'PREMIUM_GROSS_RATE', label: 'Premium Rate', required: false, type: 'DECIMAL (0.01)' },
          { key: 'PREMIUM_REINSURER_SHARE', label: 'Premium (Reinsurer Share)', required: false, type: 'DECIMAL (0.01)' }
        ],
        defaultMappings: { 
          NO: 'No',
          COB: 'COB',
          POLICY_NUMBER: 'POLICY NUMBER',
          INSURED_NAME: 'INSURED NAME',
          UW_YEAR: 'UW YEAR',
          CURRENCY: 'CURRENCY',
          TSI_100_PERCENT: '100% TSI',
          OCCUPATION_CODE: 'OCCUPATION CODE',
          LOCATION: 'LOCATION',
          ZIP_CODE: 'ZIP CODE',
          PERIOD_OF_INSURANCE_START: 'PERIOD OF INSURANCE - START',
          PERIOD_OF_INSURANCE_END: 'PERIOD OF INSURANCE - END',
          PREMIUM_100_PERCENT: '100% Premium',
          PREMIUM_GROSS_RATE: 'Premium Rate',
          PREMIUM_REINSURER_SHARE: 'Premium (Reinsurer Share)'
        }
      }
    ]
  }
];