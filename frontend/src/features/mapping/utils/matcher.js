// frontend/src/features/mapping/utils/matcher.js

function cleanString(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function sanitizeDbFieldName(rawName) {
  let clean = cleanString(rawName);
  if (/^[0-9]/.test(clean)) {
    clean = `col_${clean}`;
  }
  return clean || "custom_field";
}

export function suggestSqlType(colName) {
  const clean = cleanString(colName);
  const moneyKeywords = [
    "amount", "claim", "premi", "premium", "tsi", "suminsured", "share",
    "comm", "netto", "incurred", "loss", "paid", "exposure", "rate", "fee", "nilai"
  ];
  if (moneyKeywords.some((kw) => clean.includes(kw)) && !["desc", "note", "type", "name", "nama", "cause", "event", "occupation"].some((tx) => clean.includes(tx))) {
    return "NUMERIC(20, 2)";
  }
  if (["no", "id", "year", "tahun", "tenor", "bulan", "age", "usia", "seq"].some((kw) => clean === kw || clean.endsWith(`_${kw}`))) {
    return "BIGINT";
  }
  return "TEXT";
}

export function computeSimilarity(sourceCol, targetItem) {
  const sClean = cleanString(sourceCol);
  const tKey = cleanString(targetItem.dbField);
  const tLabel = cleanString(targetItem.iprLabel);

  if (!sClean) return 0;

  // 1. Exact Match DB Key atau Label
  if (sClean === tKey || sClean === tLabel) return 1.0;

  // 2. Exact Match dengan Alias
  for (const alias of targetItem.aliases || []) {
    const aClean = cleanString(alias);
    if (sClean === aClean) return 0.98;
  }

  // 3. Prefix & Context Match (Cegah konflik Breakdown SI vs Spreading of Risk)
  if (sClean.includes("breakdown") && tKey.startsWith("si_")) {
    if (sClean.includes("other") && tKey === "si_others") return 0.95;
    if (sClean.includes("mb") && tKey === "si_md_building") return 0.95;
  }

  if (sClean.includes("spreading") && tKey.startsWith("risk_")) {
    if (sClean.includes("other") && tKey === "risk_others") return 0.95;
    if (sClean.includes("or") && tKey === "risk_or") return 0.95;
    if (sClean.includes("qs") && tKey === "risk_qs") return 0.95;
    if (sClean.includes("surplus") && tKey === "risk_surplus") return 0.95;
  }

  // 4. General Substring Match
  for (const alias of targetItem.aliases || []) {
    const aClean = cleanString(alias);
    if (aClean.length >= 3) {
      if (sClean.includes(aClean)) return 0.85;
    }
  }

  return 0;
}

export function autoMatchColumns(sourceColumns = [], targetSchema = []) {
  const matched = {};
  const usedSourceCols = new Set();

  targetSchema.forEach((targetItem) => {
    let bestMatch = null;
    let highestScore = 0;

    sourceColumns.forEach((sourceCol) => {
      const score = computeSimilarity(sourceCol, targetItem);
      if (score > highestScore && score >= 0.75) {
        highestScore = score;
        bestMatch = sourceCol;
      }
    });

    if (bestMatch && !usedSourceCols.has(bestMatch)) {
      matched[targetItem.dbField] = bestMatch;
      usedSourceCols.add(bestMatch);
    }
  });

  return matched;
}