import { sharedTransformers as st } from './shared.js';
import { normalizeColumnName } from '../utils/columnNormalizer.js';

const DATE_COLUMNS = new Set([
    normalizeColumnName("9. Fecha de expedición de la factura")
]);

const NUMBER_COLUMNS = new Set([
    normalizeColumnName("18. Código de clase o uso")
]);

const NUMERIC_VALUE_COLUMNS = new Set([
    normalizeColumnName("36. Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)")
]);

const aseoTransformer = {
    transform(columnName, value) {
        if (value === null || value === undefined || value === '') {
            return DATE_COLUMNS.has(normalizeColumnName(columnName)) ? '' : 0;
        }

        const normalizedCol = normalizeColumnName(columnName);

        if (DATE_COLUMNS.has(normalizedCol)) return st.formatDate(value);
        if (NUMBER_COLUMNS.has(normalizedCol)) return Number(value) || 0;
        if (NUMERIC_VALUE_COLUMNS.has(normalizedCol)) return st.parseNumber(value);

        return value;
    }
};

export default aseoTransformer;
