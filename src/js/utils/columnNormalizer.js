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
        if (!lookup.has(normalized)) {
            lookup.set(normalized, col);
        }
    }
    return lookup;
}

function levenshtein(a, b) {
    const m = a.length;
    const n = b.length;
    if (Math.abs(m - n) > Math.max(m, n) * 0.3) return Infinity;
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
    const minPrefixLen = Math.ceil(requiredLen * 0.7);

    for (const [normalizedAvail, originalAvail] of lookup) {
        if (normalizedAvail.length < minPrefixLen) continue;

        if (normalizedRequired.startsWith(normalizedAvail)) {
            return originalAvail;
        }
        if (normalizedAvail.startsWith(normalizedRequired)) {
            return originalAvail;
        }

        const availPrefix = normalizedAvail.substring(0, minPrefixLen);
        const reqPrefix = normalizedRequired.substring(0, minPrefixLen);
        if (availPrefix === reqPrefix) {
            const distance = levenshtein(normalizedRequired, normalizedAvail);
            if (distance <= Math.max(requiredLen * 0.25, 3)) {
                return originalAvail;
            }
        }
    }

    return null;
}
