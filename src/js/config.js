// Configuración global
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
export const VALID_MIME_TYPES = [
    "text/csv", 
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];
export const ROWS_PER_PAGE = 10;

// Tipos de servicios disponibles
export const SERVICE_TYPES = {
    ACUEDUCTO: 'acueducto',
    ALCANTARILLADO: 'alcantarillado', 
    ASEO: 'aseo'
};

// Configuración de columnas por tipo de servicio
export const SERVICE_COLUMNS = {
    [SERVICE_TYPES.ACUEDUCTO]: {
        name: 'Acueducto',
        requiredColumns: [
            'FECHA DE EXPEDICIÓN DE LA FACTURA',
            'CÓDIGO CLASE DE USO',
            'ESTADO DE MEDIDOR',
            'CONSUMO DEL PERÍODO EN METROS CÚBICOS',
            'VALOR TOTAL FACTURADO',
            'PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE'
        ],
        mappedColumns: {
            'FECHA DE EXPEDICIÓN DE LA FACTURA': 'Fecha',
            'CÓDIGO CLASE DE USO': 'Clase de Uso',
            'ESTADO DE MEDIDOR': 'Medidor',
            'CONSUMO DEL PERÍODO EN METROS CÚBICOS': 'Consumo',
            'VALOR TOTAL FACTURADO': 'Total Facturado',
            'PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE': 'Total Recaudo'
        }
    },
    [SERVICE_TYPES.ALCANTARILLADO]: {
        name: 'Alcantarillado',
        requiredColumns: [
            'FECHA DE EXPEDICIÓN DE LA FACTURA',
            'CÓDIGO CLASE DE USO',
            'USUARIO FACTURADO CON AFORO',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS',
            'VALOR TOTAL FACTURADO',
            'PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO'
        ],
        mappedColumns: {
            'FECHA DE EXPEDICIÓN DE LA FACTURA': 'Fecha',
            'CÓDIGO CLASE DE USO': 'Clase de Uso',
            'USUARIO FACTURADO CON AFORO': 'Medidor',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS': 'Consumo',
            'VALOR TOTAL FACTURADO': 'Total Facturado',
            'PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO': 'Total Recaudo'
        }
    },
    [SERVICE_TYPES.ASEO]: {
        name: 'Aseo',
        requiredColumns: [
            'Fecha de expedición de la factura',
            'Código de clase o uso'
        ],
        mappedColumns: {
            'Fecha de expedición de la factura': 'Fecha',
            'Código de clase o uso': 'Clase de Uso',
            // Para aseo solo necesitamos fecha y clase de uso
            '_default_medidor': 'Medidor',
            '_default_consumo': 'Consumo',
            '_default_total_facturado': 'Total Facturado',
            '_default_total_recaudo': 'Total Recaudo'
        }
    }
};

// Columnas requeridas en el CSV (mantener para compatibilidad)
export const REQUIRED_COLUMNS = [
    "Fecha",
    "Clase de Uso",
    "Medidor",
    "Consumo",
    "Total Facturado",
    "Total Recaudo"
];