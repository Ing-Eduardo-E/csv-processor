import { sharedTransformers as st } from './shared.js';
import { normalizeColumnName } from '../utils/columnNormalizer.js';

const DATE_COLUMNS = new Set([
    normalizeColumnName("FECHA DE EXPEDICIÓN DE LA FACTURA")
]);

const NUMBER_COLUMNS = new Set([
    normalizeColumnName("CÓDIGO CLASE DE USO")
]);

const MEDIDOR_COLUMNS = new Set([
    normalizeColumnName("ESTADO DE MEDIDOR")
]);

const NUMERIC_VALUE_COLUMNS = new Set([
    normalizeColumnName("CONSUMO DEL PERÍODO EN METROS CÚBICOS"),
    normalizeColumnName("VALOR TOTAL FACTURADO"),
    normalizeColumnName("PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE")
]);

const acueductoTransformer = {
    transform(columnName, value) {
        if (value === null || value === undefined || value === '') {
            return DATE_COLUMNS.has(normalizeColumnName(columnName)) ? '' : 0;
        }

        const normalizedCol = normalizeColumnName(columnName);

        if (DATE_COLUMNS.has(normalizedCol)) return st.formatDate(value);
        if (MEDIDOR_COLUMNS.has(normalizedCol)) return st.convertMedidorState(value);
        if (NUMBER_COLUMNS.has(normalizedCol)) return Number(value) || 0;
        if (NUMERIC_VALUE_COLUMNS.has(normalizedCol)) return st.parseNumber(value);

        return value;
    }
};

export default acueductoTransformer;
