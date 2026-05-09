import { sharedTransformers as st } from './shared.js';
import { normalizeColumnName } from '../utils/columnNormalizer.js';

const DATE_COLUMNS = new Set([
    normalizeColumnName("FECHA DE EXPEDICIÓN DE LA FACTURA")
]);

const NUMBER_COLUMNS = new Set([
    normalizeColumnName("CÓDIGO CLASE DE USO")
]);

const AFORO_COLUMNS = new Set([
    normalizeColumnName("USUARIO FACTURADO CON AFORO")
]);

const NUMERIC_VALUE_COLUMNS = new Set([
    normalizeColumnName("VERTIMIENTO DEL PERIOD EN METROS CUBICOS"),
    normalizeColumnName("VALOR TOTAL FACTURADO"),
    normalizeColumnName("PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO")
]);

const alcantarilladoTransformer = {
    transform(columnName, value) {
        if (value === null || value === undefined || value === '') {
            return DATE_COLUMNS.has(normalizeColumnName(columnName)) ? '' : 0;
        }

        const normalizedCol = normalizeColumnName(columnName);

        if (DATE_COLUMNS.has(normalizedCol)) return st.formatDate(value);
        if (AFORO_COLUMNS.has(normalizedCol)) return st.convertAforoState(value);
        if (NUMBER_COLUMNS.has(normalizedCol)) return Number(value) || 0;
        if (NUMERIC_VALUE_COLUMNS.has(normalizedCol)) return st.parseNumber(value);

        return value;
    }
};

export default alcantarilladoTransformer;
