// Configuración global
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
export const VALID_MIME_TYPES = ["text/csv", "application/vnd.ms-excel"];
export const ROWS_PER_PAGE = 10;

// Columnas requeridas en el CSV
export const REQUIRED_COLUMNS = [
    "Fecha",
    "Clase de Uso",
    "Medidor",
    "Consumo",
    "Total Facturado",
    "Total Recaudo"
];