export const mockSheetData = {
  'Premi QS': {
    columns: ['policy_no', 'insured_name', 'cob', 'fire_tsi', 'fire_gross_premium', 'fire_commission'],
    data: [
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', cob: 'FIRE', fire_tsi: 'Rp 5.000.000.000', fire_gross_premium: 'Rp 25.000.000', fire_commission: 'Rp 3.750.000' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (TSI & Premi Mandatori)', policy_no: 'FIR-2026-002', insured_name: 'CV Abadi Makmur', cob: 'FIRE', fire_tsi: '', fire_gross_premium: '', fire_commission: 'Rp 900.000' },
      { _validationStatus: 'invalid', _errorReason: 'Duplikat (Nomor Polis FIR-2026-001 Sudah Ada)', policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', cob: 'FIRE', fire_tsi: 'Rp 5.000.000.000', fire_gross_premium: 'Rp 25.000.000', fire_commission: 'Rp 3.750.000' },
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-004', insured_name: 'PT Nusantara Megah', cob: 'FIRE', fire_tsi: 'Rp 12.000.000.000', fire_gross_premium: 'Rp 60.000.000', fire_commission: 'Rp 9.000.000' },
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-005', insured_name: 'PT Bina Karya Utama', cob: 'FIRE', fire_tsi: 'Rp 3.500.000.000', fire_gross_premium: 'Rp 17.500.000', fire_commission: 'Rp 2.625.000' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (Nama Tertanggung)', policy_no: 'FIR-2026-006', insured_name: '', cob: 'FIRE', fire_tsi: 'Rp 8.000.000.000', fire_gross_premium: 'Rp 40.000.000', fire_commission: 'Rp 6.000.000' },
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-007', insured_name: 'PT Mitra Sejahtera', cob: 'FIRE', fire_tsi: 'Rp 2.000.000.000', fire_gross_premium: 'Rp 10.000.000', fire_commission: 'Rp 1.500.000' },
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-008', insured_name: 'CV Mulia Bersama', cob: 'FIRE', fire_tsi: 'Rp 1.500.000.000', fire_gross_premium: 'Rp 7.500.000', fire_commission: 'Rp 1.125.000' },
      { _validationStatus: 'invalid', _errorReason: 'Duplikat (Nomor Polis FIR-2026-005 Sudah Ada)', policy_no: 'FIR-2026-005', insured_name: 'PT Bina Karya Utama', cob: 'FIRE', fire_tsi: 'Rp 3.500.000.000', fire_gross_premium: 'Rp 17.500.000', fire_commission: 'Rp 2.625.000' },
      { _validationStatus: 'valid', _errorReason: null, policy_no: 'FIR-2026-010', insured_name: 'PT Sinar Alam Lestari', cob: 'FIRE', fire_tsi: 'Rp 15.000.000.000', fire_gross_premium: 'Rp 75.000.000', fire_commission: 'Rp 11.250.000' }
    ]
  },
  'Claim QS': {
    columns: ['claim_no', 'policy_no', 'insured_name', 'claim_amount', 'loss_date'],
    data: [
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-881', policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', claim_amount: 'Rp 150.000.000', loss_date: '2026-05-12' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (Tanggal Kejadian)', claim_no: 'CLM-2026-882', policy_no: 'FIR-2026-004', insured_name: 'PT Nusantara Megah', claim_amount: 'Rp 300.000.000', loss_date: '' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-883', policy_no: 'FIR-2026-005', insured_name: 'PT Bina Karya Utama', claim_amount: 'Rp 85.000.000', loss_date: '2026-06-01' },
      { _validationStatus: 'invalid', _errorReason: 'Duplikat (Nomor Klaim CLM-2026-881)', claim_no: 'CLM-2026-881', policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', claim_amount: 'Rp 150.000.000', loss_date: '2026-05-12' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-885', policy_no: 'FIR-2026-007', insured_name: 'PT Mitra Sejahtera', claim_amount: 'Rp 45.000.000', loss_date: '2026-06-18' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-886', policy_no: 'FIR-2026-008', insured_name: 'CV Mulia Bersama', claim_amount: 'Rp 20.000.000', loss_date: '2026-07-02' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (Nilai Klaim)', claim_no: 'CLM-2026-887', policy_no: 'FIR-2026-010', insured_name: 'PT Sinar Alam Lestari', claim_amount: '', loss_date: '2026-07-10' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-888', policy_no: 'FIR-2026-001', insured_name: 'PT Sentosa Raya', claim_amount: 'Rp 200.000.000', loss_date: '2026-07-15' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-889', policy_no: 'FIR-2026-005', insured_name: 'PT Bina Karya Utama', claim_amount: 'Rp 50.000.000', loss_date: '2026-07-20' },
      { _validationStatus: 'valid', _errorReason: null, claim_no: 'CLM-2026-890', policy_no: 'FIR-2026-004', insured_name: 'PT Nusantara Megah', claim_amount: 'Rp 500.000.000', loss_date: '2026-07-28' }
    ]
  },
  'Subro': {
    columns: ['subro_no', 'claim_no', 'recovered_amount', 'recovery_date'],
    data: [
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-001', claim_no: 'CLM-2026-881', recovered_amount: 'Rp 45.000.000', recovery_date: '2026-06-20' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-002', claim_no: 'CLM-2026-883', recovered_amount: 'Rp 25.000.000', recovery_date: '2026-06-25' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (Tanggal Subrogasi)', subro_no: 'SUB-2026-003', claim_no: 'CLM-2026-885', recovered_amount: 'Rp 10.000.000', recovery_date: '' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-004', claim_no: 'CLM-2026-886', recovered_amount: 'Rp 5.000.000', recovery_date: '2026-07-12' },
      { _validationStatus: 'invalid', _errorReason: 'Duplikat (Nomor Subrogasi SUB-2026-001)', subro_no: 'SUB-2026-001', claim_no: 'CLM-2026-881', recovered_amount: 'Rp 45.000.000', recovery_date: '2026-06-20' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-006', claim_no: 'CLM-2026-888', recovered_amount: 'Rp 60.000.000', recovery_date: '2026-07-22' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-007', claim_no: 'CLM-2026-889', recovered_amount: 'Rp 15.000.000', recovery_date: '2026-07-25' },
      { _validationStatus: 'invalid', _errorReason: 'Kolom Kosong (Nominal Subrogasi)', subro_no: 'SUB-2026-008', claim_no: 'CLM-2026-890', recovered_amount: '', recovery_date: '2026-08-01' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-009', claim_no: 'CLM-2026-881', recovered_amount: 'Rp 30.000.000', recovery_date: '2026-08-02' },
      { _validationStatus: 'valid', _errorReason: null, subro_no: 'SUB-2026-010', claim_no: 'CLM-2026-883', recovered_amount: 'Rp 12.500.000', recovery_date: '2026-08-05' }
    ]
  }
};