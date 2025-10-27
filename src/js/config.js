// Configuración global
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
export const VALID_MIME_TYPES = ["text/csv", "application/vnd.ms-excel"];
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
    columnMapping: {},
    requiredColumns: [],
    displayColumns: []
};

// Mapeo de configuraciones por tipo de servicio
export const SERVICE_CONFIGS = {
    [SERVICE_TYPES.ACUEDUCTO]: ACUEDUCTO_CONFIG,
    [SERVICE_TYPES.ALCANTARILLADO]: ALCANTARILLADO_CONFIG,
    [SERVICE_TYPES.ASEO]: ASEO_CONFIG
};

// Columnas internas (usadas por la aplicación) - son las mismas para todos los servicios
export const INTERNAL_COLUMNS = [
    "Fecha",
    "Clase de Uso",
    "Medidor",
    "Consumo",
    "Total Facturado",
    "Total Recaudo"
];

// Todas las columnas del archivo original de acueducto (para referencia)
export const ORIGINAL_COLUMNS = [
    "NUID",
    "NUMERO DE CUENTA CONTRATO",
    "CÓDIGO DANE DEPARTAMENTO",
    "CÓDIGO DANE MUNICIPIO",
    "ZONA IGAC",
    "SECTOR IGAC",
    "MANZANA O VEREDA IGAC",
    "NÚMERO DEL PREDIO IGAC",
    "CONDICION DE PROPIEDAD DEL PREDIO IGAC",
    "DIRECCIÓN DEL PREDIO",
    "NÚMERO DE FACTURA",
    "FECHA DE EXPEDICIÓN DE LA FACTURA",
    "FECHA DE INICIO DEL PERÍODO DE FACTURACIÓN",
    "DIAS FACTURADOS",
    "CÓDIGO CLASE DE USO",
    "UNIDADES MULTIUSUARIO RESIDENCIAL",
    "UNIDADES MULTIUSUARIO NO RESIDENCIAL",
    "HOGAR COMUNITARIO O SUSTITUTO",
    "ESTADO DE MEDIDOR",
    "DETERMINACIÓN DEL CONSUMO",
    "LECTURA ANTERIOR",
    "LECTURA ACTUAL",
    "CONSUMO DEL PERÍODO EN METROS CÚBICOS",
    "CARGO FIJO",
    "CARGO POR CONSUMO BÁSICO",
    "CARGO POR CONSUMO COMPLEMENTARIO",
    "CARGO POR CONS UMO SUNTUARIO",
    "CMT (COSTO MEDIO DE TASA DE USO)",
    "VALOR POR METRO CÚBICO",
    "VALOR FACTURADO POR CONSUMO",
    "VALOR DEL SUBSIDIO",
    "VALOR DE LA CONTRIBUCIÓN",
    "FACTOR DE SUBSIDIO O CONTRIBUCIÓN CARGO FIJO",
    "FACTOR DE SUBSIDIO O CONTRIBUCIÓN CONSUMO",
    "CARGOS POR CONEXIÓN",
    "CARGOS POR RECONEXIÓN",
    "CARGOS POR REINSTALACIÓN",
    "CARGOS POR SUSPENSIÓN",
    "CARGOS POR CORTE",
    "PAGO ANTICIPADO DEL SERVICIO",
    "DÍAS DE MORA",
    "VALOR DE MORA",
    "INTERESES POR MORA",
    "OTROS COBROS",
    "CAUSAL DE REFACTURACIÓN",
    "NUMERO DE FACTURA OBJETO DE REFACTURACION",
    "VALOR TOTAL FACTURADO",
    "PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE"
];

// Estados de medidor válidos (para validación)
export const MEDIDOR_ESTADOS = {
    "INSTALADO": 1,
    "NO INSTALADO": 0,
    "DAÑADO": 1,
    "RETIRADO": 0
};