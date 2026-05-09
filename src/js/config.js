// Configuración global
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB en bytes
export const VALID_MIME_TYPES = [
    "text/csv", 
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" // .xlsx
];
export const ROWS_PER_PAGE = 10;

// Tipos de servicio disponibles
export const SERVICE_TYPES = {
    ACUEDUCTO: 'acueducto',
    ALCANTARILLADO: 'alcantarillado',
    ASEO: 'aseo'
};

// ============================================
// CONFIGURACIÓN PARA ACUEDUCTO
// ============================================
export const ACUEDUCTO_CONFIG = {
    name: 'Acueducto',
    columnMapping: {
        "FECHA DE EXPEDICIÓN DE LA FACTURA": "Fecha",
        "CÓDIGO CLASE DE USO": "Clase de Uso",
        "ESTADO DE MEDIDOR": "Medidor",
        "CONSUMO DEL PERÍODO EN METROS CÚBICOS": "Consumo",
        "VALOR TOTAL FACTURADO": "Total Facturado",
        "PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE": "Total Recaudo"
    },
    requiredColumns: [
        "FECHA DE EXPEDICIÓN DE LA FACTURA",
        "CÓDIGO CLASE DE USO",
        "ESTADO DE MEDIDOR",
        "CONSUMO DEL PERÍODO EN METROS CÚBICOS",
        "VALOR TOTAL FACTURADO",
        "PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE"
    ],
    displayColumns: [
        { original: "FECHA DE EXPEDICIÓN DE LA FACTURA", description: "Fecha de facturación" },
        { original: "CÓDIGO CLASE DE USO", description: "Clasificación del usuario" },
        { original: "ESTADO DE MEDIDOR", description: "INSTALADO, NO INSTALADO, etc." },
        { original: "CONSUMO DEL PERÍODO EN METROS CÚBICOS", description: "Consumo medido en m³" },
        { original: "VALOR TOTAL FACTURADO", description: "Total facturado al usuario" },
        { original: "PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE", description: "Recaudos del período" }
    ]
};

// ============================================
// CONFIGURACIÓN PARA ALCANTARILLADO
// ============================================
export const ALCANTARILLADO_CONFIG = {
    name: 'Alcantarillado',
    columnMapping: {
        "FECHA DE EXPEDICIÓN DE LA FACTURA": "Fecha",
        "CÓDIGO CLASE DE USO": "Clase de Uso",
        "USUARIO FACTURADO CON AFORO": "Medidor",
        "VERTIMIENTO DEL PERIOD EN METROS CUBICOS": "Consumo",
        "VALOR TOTAL FACTURADO": "Total Facturado",
        "PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO": "Total Recaudo"
    },
    requiredColumns: [
        "FECHA DE EXPEDICIÓN DE LA FACTURA",
        "CÓDIGO CLASE DE USO",
        "USUARIO FACTURADO CON AFORO",
        "VERTIMIENTO DEL PERIOD EN METROS CUBICOS",
        "VALOR TOTAL FACTURADO",
        "PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO"
    ],
    displayColumns: [
        { original: "FECHA DE EXPEDICIÓN DE LA FACTURA", description: "Fecha de facturación" },
        { original: "CÓDIGO CLASE DE USO", description: "Clasificación del usuario" },
        { original: "USUARIO FACTURADO CON AFORO", description: "SI o NO (aforo individual)" },
        { original: "VERTIMIENTO DEL PERIOD EN METROS CUBICOS", description: "Vertimiento en m³" },
        { original: "VALOR TOTAL FACTURADO", description: "Total facturado al usuario" },
        { original: "PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO", description: "Recaudos del período" }
    ]
};

// ============================================
// CONFIGURACIÓN PARA ASEO (Placeholder)
// ============================================
export const ASEO_CONFIG = {
    name: 'Aseo',
    columnMapping: {
        "9. Fecha de expedición de la factura": "Fecha",
        "18. Código de clase o uso": "Clase de Uso",
        "36. Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)": "Tarifa"
    },
    requiredColumns: [
        "9. Fecha de expedición de la factura",
        "18. Código de clase o uso",
        "36. Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)"
    ],
    displayColumns: [
        { original: "9. Fecha de expedición de la factura", description: "Fecha de facturación" },
        { original: "18. Código de clase o uso", description: "Estrato o clase del usuario" },
        { original: "36. Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)", description: "Tarifa de recolección y transporte" }
    ],
    // Aseo usa una estructura diferente (no tiene consumo ni recaudo)
    isSimplified: true
};

// Mapeo de configuraciones por tipo de servicio
export const SERVICE_CONFIGS = {
    [SERVICE_TYPES.ACUEDUCTO]: ACUEDUCTO_CONFIG,
    [SERVICE_TYPES.ALCANTARILLADO]: ALCANTARILLADO_CONFIG,
    [SERVICE_TYPES.ASEO]: ASEO_CONFIG
};

const MEDIDOR_ESTADOS = {
    "INSTALADO": 1,
    "NO INSTALADO": 0,
    "DAÑADO": 1,
    "RETIRADO": 0
};