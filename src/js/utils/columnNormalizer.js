export function normalizeColumnName(name) {
    return String(name)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toUpperCase()
        .replace(/\s+/g, ' ')
        .trim();
}

export function buildNormalizedLookup(columns) {
    const lookup = new Map();
    for (const col of columns) {
        lookup.set(normalizeColumnName(col), col);
    }
    return lookup;
}

export function findColumnMatch(lookup, requiredCol) {
    const normalizedRequired = normalizeColumnName(requiredCol);
    if (lookup.has(normalizedRequired)) {
        return lookup.get(normalizedRequired);
    }
    return null;
}
