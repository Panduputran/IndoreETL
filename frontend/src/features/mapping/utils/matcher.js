// frontend/src/features/mapping/utils/matcher.js

/**
 * Normalisasi string standar: lowercase, ganti simbol/tanda baca jadi underscore,
 * hilangkan underscore berulang dan di ujung string.
 */
export function cleanString(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Normalisasi string kompak tanpa spasi atau underscore sama sekali (misal: 'policyno' / 'totalincurredclaim')
 */
export function compactString(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Sanitasi nama kolom agar valid sebagai identifier SQL PostgreSQL
 */
export function sanitizeDbFieldName(rawName) {
  let clean = cleanString(rawName);
  if (/^[0-9]/.test(clean)) {
    clean = `col_${clean}`;
  }
  return clean || 'custom_field';
}

/**
 * Prediksi tipe data SQL berdasarkan pola nama kolom
 */
export function suggestSqlType(colName) {
  const clean = cleanString(colName);
  const moneyKeywords = [
    'amount', 'claim', 'premi', 'premium', 'tsi', 'suminsured', 'sum_insured',
    'share', 'comm', 'netto', 'incurred', 'loss', 'paid', 'exposure', 'rate',
    'fee', 'nilai', 'plafond', 'plafon', 'biaya', 'saldo'
  ];
  const textKeywords = [
    'desc', 'note', 'type', 'name', 'nama', 'cause', 'event', 'occupation',
    'alamat', 'lokasi', 'location', 'policy', 'polis', 'keterangan', 'bank'
  ];

  if (moneyKeywords.some((kw) => clean.includes(kw)) && !textKeywords.some((tx) => clean.includes(tx))) {
    return 'NUMERIC(20, 2)';
  }
  if (['no', 'id', 'year', 'tahun', 'tenor', 'bulan', 'age', 'usia', 'seq', 'uw_year'].some((kw) => clean === kw || clean.endsWith(`_${kw}`))) {
    return 'BIGINT';
  }
  return 'TEXT';
}

/**
 * Hitung skor kesamaan antara Kolom Sumber Excel dengan Item Target Skema IPR
 */
export function computeSimilarity(sourceCol, targetItem) {
  if (!sourceCol || !targetItem) return 0;

  const sClean = cleanString(sourceCol);
  const sCompact = compactString(sourceCol);
  const tKey = cleanString(targetItem.dbField);
  const tKeyCompact = compactString(targetItem.dbField);
  const tLabel = cleanString(targetItem.iprLabel);
  const tLabelCompact = compactString(targetItem.iprLabel);

  if (!sClean) return 0;

  // 1. EXACT MATCH MUTLAK (Skor 1.0)
  if (sClean === tKey || sClean === tLabel || sCompact === tKeyCompact || sCompact === tLabelCompact) {
    return 1.0;
  }

  // 2. EXACT MATCH DENGAN ALIAS RESMI (Skor 0.98)
  for (const alias of targetItem.aliases || []) {
    const aClean = cleanString(alias);
    const aCompact = compactString(alias);
    if (sClean === aClean || sCompact === aCompact) {
      return 0.98;
    }
  }

  // 3. CONTEXT & PREFIX RULES (Spesifik Breakdown SI vs Spreading Risk)
  if (sClean.includes('breakdown') && tKey.startsWith('si_')) {
    if (sClean.includes('other') && tKey === 'si_others') return 0.96;
    if ((sClean.includes('mb') || sClean.includes('building') || sClean.includes('bangunan')) && tKey === 'si_md_building') return 0.96;
    if ((sClean.includes('machinery') || sClean.includes('mesin')) && tKey === 'si_machinery') return 0.96;
    if ((sClean.includes('stock') || sClean.includes('stok')) && tKey === 'si_stock') return 0.96;
    if (sClean.includes('tpl') && tKey === 'si_tpl') return 0.96;
    if (sClean.includes('bi') && tKey === 'si_bi') return 0.96;
  }

  if ((sClean.includes('spreading') || sClean.includes('sebaran')) && (tKey.startsWith('risk_') || tKey.startsWith('claim_'))) {
    if (sClean.includes('or') && (tKey === 'risk_or' || tKey === 'claim_or')) return 0.96;
    if (sClean.includes('qs') && (tKey === 'risk_qs' || tKey === 'claim_qs')) return 0.96;
    if (sClean.includes('surplus') && (tKey === 'risk_surplus' || tKey === 'claim_surplus')) return 0.96;
    if (sClean.includes('other') && (tKey === 'risk_others' || tKey === 'claim_others')) return 0.96;
  }

  // 4. TOKEN SET OVERLAP (Token Jaccard / Containment Matching)
  const sTokens = new Set(sClean.split('_').filter(t => t.length >= 2));
  const tTokens = new Set(tKey.split('_').concat(tLabel.split('_')).filter(t => t.length >= 2));

  let commonTokens = 0;
  for (const st of sTokens) {
    if (tTokens.has(st)) commonTokens++;
  }

  if (sTokens.size > 0 && commonTokens === sTokens.size && sTokens.size === tTokens.size) {
    return 0.95;
  }

  if (sTokens.size > 0 && commonTokens === sTokens.size) {
    return 0.90;
  }

  // 5. SUBSTRING MATCH PADA ALIAS
  for (const alias of targetItem.aliases || []) {
    const aClean = cleanString(alias);
    if (aClean.length >= 4) {
      if (sClean.includes(aClean) || aClean.includes(sClean)) {
        return 0.85;
      }
    }
  }

  // 6. PARTIAL TOKEN MATCHING (Minimal 2 token cocok)
  if (commonTokens >= 2) {
    return 0.78;
  }

  return 0;
}

/**
 * Algoritma Auto-Matching Global (Maximum Weight Bipartite Matching)
 * Memastikan pasangan dengan skor tertinggi dipasangkan lebih dulu,
 * mencegah exact match terserobot oleh match substring kolom lain.
 */
export function autoMatchColumns(sourceColumns = [], targetSchema = []) {
  const matched = {};
  const usedSourceCols = new Set();
  const usedTargetKeys = new Set();

  // 1. Kumpulkan seluruh kemungkinan pasangan (targetItem, sourceCol, score)
  const candidatePairs = [];

  targetSchema.forEach((targetItem) => {
    sourceColumns.forEach((sourceCol) => {
      const score = computeSimilarity(sourceCol, targetItem);
      if (score >= 0.70) {
        candidatePairs.push({
          targetKey: targetItem.dbField,
          sourceCol: sourceCol,
          score: score,
        });
      }
    });
  });

  // 2. Urutkan seluruh kandidat dari skor tertinggi ke terendah
  candidatePairs.sort((a, b) => b.score - a.score);

  // 3. Pasangkan secara greedy berbobot tinggi (Global Best-First)
  for (const pair of candidatePairs) {
    if (!usedTargetKeys.has(pair.targetKey) && !usedSourceCols.has(pair.sourceCol)) {
      matched[pair.targetKey] = pair.sourceCol;
      usedTargetKeys.add(pair.targetKey);
      usedSourceCols.add(pair.sourceCol);
    }
  }

  return matched;
}