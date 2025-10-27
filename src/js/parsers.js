import Papa from 'papaparse';
import { SERVICE_CONFIGS } from './config.js';

/**
 * Parsea y transforma el archivo CSV según el tipo de servicio
 * @param {File} file - Archivo CSV a procesar
 * @param {string} serviceType - Tipo de servicio ('acueducto', 'alcantarillado', 'aseo')
 * @returns {Promise<Array>} - Datos transformados
 */
export function parseCSV(file, serviceType) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: false, // Mantener como strings para procesamiento manual
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length) {
                    reject(results.errors);
                } else if (!results.data.length) {
                    reject(new Error("El archivo está vacío"));
                } else {
                    // Transformar los datos del formato original al formato interno
                    const transformedData = transformData(results.data, serviceType);
                    resolve(transformedData);
                }
            },
            error: (error) => reject(error)
        });
    });
}

/**
 * Valida que el CSV tenga las columnas requeridas según el tipo de servicio
 * @param {Array} data - Datos sin procesar
 * @param {string} serviceType - Tipo de servicio
 * @returns {Object} - Resultado de la validación
 */
export function validateCSVStructure(data, serviceType) {
    if (!Array.isArray(data) || !data.length) {
        return {
            isValid: false,
            missingColumns: ["No hay datos para validar"]
        };
    }

    const config = SERVICE_CONFIGS[serviceType];
    if (!config) {
        return {
            isValid: false,
            missingColumns: ["Tipo de servicio no válido"]
        };
    }

    const firstRow = data[0];
    const availableColumns = Object.keys(firstRow);
    
    const missingColumns = config.requiredColumns.filter(
        col => !availableColumns.includes(col)
    );

    return {
        isValid: missingColumns.length === 0,
        missingColumns
    };
}

/**
 * Transforma los datos del formato original al formato interno
 * @param {Array} data - Datos originales
 * @param {string} serviceType - Tipo de servicio
 * @returns {Array} - Datos transformados
 */
function transformData(data, serviceType) {
    const config = SERVICE_CONFIGS[serviceType];
    if (!config) {
        throw new Error("Configuración de servicio no encontrada");
    }

    return data.map(row => {
        const transformedRow = {};
        
        // Mapear cada columna del archivo original a las columnas internas
        for (const [sourceCol, targetCol] of Object.entries(config.columnMapping)) {
            if (row.hasOwnProperty(sourceCol)) {
                transformedRow[targetCol] = transformValue(sourceCol, row[sourceCol], serviceType);
            }
        }
        
        return transformedRow;
    });
}

/**
 * Transforma un valor según la columna y tipo de servicio
 * @param {string} columnName - Nombre de la columna original
 * @param {*} value - Valor a transformar
 * @param {string} serviceType - Tipo de servicio
 * @returns {*} - Valor transformado
 */
function transformValue(columnName, value, serviceType) {
    // Si el valor está vacío, retornar según el tipo esperado
    if (value === null || value === undefined || value === '') {
        if (columnName === "FECHA DE EXPEDICIÓN DE LA FACTURA" || columnName === "Fecha de expedición de la factura") {
            return '';
        }
        return 0;
    }
    
    switch (columnName) {
        case "FECHA DE EXPEDICIÓN DE LA FACTURA":
        case "Fecha de expedición de la factura":
            // Convertir fecha del formato que venga a dd-MM-yyyy
            return formatDate(value);
            
        case "CÓDIGO CLASE DE USO":
        case "Código de clase o uso":
            // Convertir a número
            return Number(value) || 0;
            
        case "ESTADO DE MEDIDOR":
            // Convertir estado de medidor a 1 (tiene) o 0 (no tiene) - ACUEDUCTO
            return convertMedidorState(value);
            
        case "USUARIO FACTURADO CON AFORO":
            // Convertir aforo a 1 (SI) o 0 (NO) - ALCANTARILLADO
            return convertAforoState(value);
            
        case "CONSUMO DEL PERÍODO EN METROS CÚBICOS":
        case "VERTIMIENTO DEL PERIOD EN METROS CUBICOS":
        case "VALOR TOTAL FACTURADO":
        case "PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE":
        case "PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO":
        case "Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)":
            // Convertir a número, manejando diferentes formatos
            return parseNumber(value);
            
        default:
            return value;
    }
}

/**
 * Formatea una fecha al formato dd-MM-yyyy
 * @param {string} dateStr - Fecha en cualquier formato
 * @returns {string} - Fecha en formato dd-MM-yyyy
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    
    // Limpiar espacios
    dateStr = dateStr.trim();
    
    // Si ya está en formato dd-MM-yyyy o dd/MM/yyyy
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}-${month}-${year}`;
    }
    
    // Si está en formato yyyy-MM-dd o yyyy/MM/dd
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}-${month}-${year}`;
    }
    
    // Intentar parsear como fecha
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
    } catch (e) {
        console.warn(`No se pudo parsear la fecha: ${dateStr}`);
    }
    
    return dateStr;
}

/**
 * Convierte el estado del medidor a valor numérico
 * @param {string} estado - Estado del medidor
 * @returns {number} - 1 si tiene medidor, 0 si no
 */
function convertMedidorState(estado) {
    if (!estado) return 0;
    
    const estadoUpper = String(estado).toUpperCase().trim();
    
    // Estados válidos para acueducto
    const MEDIDOR_ESTADOS = {
        "INSTALADO": 1,
        "NO INSTALADO": 0,
        "DAÑADO": 1,
        "RETIRADO": 0
    };
    
    // Buscar en el mapeo de estados
    if (MEDIDOR_ESTADOS.hasOwnProperty(estadoUpper)) {
        return MEDIDOR_ESTADOS[estadoUpper];
    }
    
    // Si contiene palabras clave
    if (estadoUpper.includes('INSTALADO') && !estadoUpper.includes('NO')) {
        return 1;
    }
    if (estadoUpper.includes('NO INSTALADO') || estadoUpper.includes('RETIRADO')) {
        return 0;
    }
    
    // Por defecto, asumir que tiene medidor si hay algún valor
    return 1;
}

/**
 * Convierte el estado de aforo a valor numérico
 * @param {string} aforo - Estado de aforo (SI/NO)
 * @returns {number} - 1 si tiene aforo, 0 si no
 */
function convertAforoState(aforo) {
    if (!aforo) return 0;
    
    const aforoUpper = String(aforo).toUpperCase().trim();
    
    // Convertir SI/NO a 1/0
    if (aforoUpper === 'SI' || aforoUpper === 'SÍ' || aforoUpper === 'S' || aforoUpper === '1') {
        return 1;
    }
    if (aforoUpper === 'NO' || aforoUpper === 'N' || aforoUpper === '0') {
        return 0;
    }
    
    // Por defecto, asumir que no tiene aforo
    return 0;
}

/**
 * Parsea un número desde diferentes formatos
 * @param {*} value - Valor a parsear
 * @returns {number} - Número parseado
 */
function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    // Convertir a string y limpiar
    let str = String(value).trim();
    
    // Remover símbolos de moneda y espacios
    str = str.replace(/[$\s]/g, '');
    
    // Manejar formato con comas como separador de miles y punto como decimal
    // Ejemplo: 1,234.56 -> 1234.56
    if (str.includes(',') && str.includes('.')) {
        str = str.replace(/,/g, '');
    }
    // Manejar formato con punto como separador de miles y coma como decimal
    // Ejemplo: 1.234,56 -> 1234.56
    else if (str.includes('.') && str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    }
    // Solo comas (asumir separador de miles)
    // Ejemplo: 1,234 -> 1234
    else if (str.includes(',') && !str.includes('.')) {
        // Verificar si es separador decimal o de miles
        const parts = str.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
            // Es separador decimal
            str = str.replace(',', '.');
        } else {
            // Es separador de miles
            str = str.replace(/,/g, '');
        }
    }
    
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}