// src/features/mapping/utils/matcher.js

function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

export function computeSimilarityScore(sourceCol, targetItem) {
  const normSource = normalizeText(sourceCol);
  if (!normSource) return 0;

  // 1. Exact match dengan dbField atau label
  if (normSource === normalizeText(targetItem.dbField) || normSource === normalizeText(targetItem.iprLabel)) {
    return 1.0;
  }

  // 2. Exact match dengan salah satu alias
  for (const alias of targetItem.aliases) {
    const normAlias = normalizeText(alias);
    if (normSource === normAlias) return 0.95;
  }

  // 3. Substring match
  for (const alias of targetItem.aliases) {
    const normAlias = normalizeText(alias);
    if (normAlias.length > 2) {
      if (normSource.includes(normAlias)) return 0.85;
      if (normAlias.includes(normSource)) return 0.75;
    }
  }

  return 0;
}

export function autoMatchColumns(sourceColumns = [], targetSchema = []) {
  const matched = {};
  const usedSources = new Set();

  targetSchema.forEach((targetItem) => {
    let bestMatchCol = null;
    let highestScore = 0;

    sourceColumns.forEach((sourceCol) => {
      const score = computeSimilarityScore(sourceCol, targetItem);
      if (score > highestScore && score >= 0.70) {
        highestScore = score;
        bestMatchCol = sourceCol;
      }
    });

    if (bestMatchCol && !usedSources.has(bestMatchCol)) {
      matched[targetItem.dbField] = bestMatchCol;
      usedSources.add(bestMatchCol);
    }
  });

  return matched;
}