export function normalizeColumnName(name) {
    return String(name)
        .replace(/\uFFFD/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildNormalizedLookup(columns) {
    const lookup = new Map();
    for (const col of columns) {
        const normalized = normalizeColumnName(col);
        if (normalized && !lookup.has(normalized)) {
            lookup.set(normalized, col);
        }
    }
    return lookup;
}

function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (Math.abs(m - n) > Math.max(m, n) * 0.4) return Infinity;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = Math.min(
                dp[i - 1][j] + 1,
                dp[i][j - 1] + 1,
                dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
        }
    }
    return dp[m][n];
}

export function findColumnMatch(lookup, requiredCol) {
    const normalizedRequired = normalizeColumnName(requiredCol);

    if (lookup.has(normalizedRequired)) {
        return lookup.get(normalizedRequired);
    }

    const requiredLen = normalizedRequired.length;

    let bestMatch = null;
    let bestDistance = Infinity;

    for (const [normalizedAvail, originalAvail] of lookup) {
        const availLen = normalizedAvail.length;
        const lenRatio = Math.min(requiredLen, availLen) / Math.max(requiredLen, availLen);

        if (lenRatio < 0.6) continue;

        if (normalizedRequired.startsWith(normalizedAvail) || normalizedAvail.startsWith(normalizedRequired)) {
            return originalAvail;
        }

        const distance = levenshtein(normalizedRequired, normalizedAvail);
        const maxAllowed = Math.max(Math.ceil(requiredLen * 0.3), 4);

        if (distance <= maxAllowed && distance < bestDistance) {
            bestDistance = distance;
            bestMatch = originalAvail;
        }
    }

    return bestMatch;
}
