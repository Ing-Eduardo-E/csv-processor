import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SERVICE_CONFIGS } from './config.js';

/**
 * Detecta y lee el archivo con la codificación correcta
 * @param {File} file - Archivo a leer
 * @returns {Promise<string>} - Contenido del archivo como texto
 */
async function readFileWithEncoding(file) {
    // Primero intentar leer como UTF-8
    const utf8Text = await file.text();
    
    // Si contiene caracteres de reemplazo (indica encoding incorrecto), intentar Latin-1
    if (utf8Text.includes('\uFFFD') || utf8Text.includes('�')) {
        // Leer como ArrayBuffer y decodificar como Latin-1 (Windows-1252)
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('windows-1252');
        return decoder.decode(buffer);
    }
    
    return utf8Text;
}

/**
 * Parsea y transforma el archivo CSV según el tipo de servicio
 * @param {File} file - Archivo CSV a procesar
 * @param {string} serviceType - Tipo de servicio ('acueducto', 'alcantarillado', 'aseo')
 * @returns {Promise<Array>} - Datos transformados
 */
export function parseCSV(file, serviceType) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileContent = await readFileWithEncoding(file);
            
            Papa.parse(fileContent, {
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
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Parsea y transforma el archivo Excel según el tipo de servicio
 * @param {File} file - Archivo Excel a procesar
 * @param {string} serviceType - Tipo de servicio ('acueducto', 'alcantarillado', 'aseo')
 * @returns {Promise<Array>} - Datos transformados
 */
export function parseExcel(file, serviceType) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Leer la primera hoja
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                
                // Convertir a JSON (array de objetos)
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false, // Convertir todo a strings
                    defval: '' // Valor por defecto para celdas vacías
                });
                
                if (!jsonData.length) {
                    reject(new Error("El archivo Excel está vacío"));
                } else {
                    // Transformar los datos del formato original al formato interno
                    const transformedData = transformData(jsonData, serviceType);
                    resolve(transformedData);
                }
            } catch (error) {
                reject(new Error(`Error al leer el archivo Excel: ${error.message}`));
            }
        };
        
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Normaliza un string para comparación flexible (sin tildes, minúsculas, espacios normalizados)
 * @param {string} str - String a normalizar
 * @returns {string} - String normalizado
 */
function normalizeString(str) {
    return str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Quitar tildes
        .toLowerCase()
        .replace(/\s+/g, ' ') // Normalizar espacios múltiples
        .trim();
}

/**
 * Busca una columna en las columnas disponibles usando coincidencia flexible
 * @param {string} requiredCol - Columna requerida
 * @param {Array} availableColumns - Columnas disponibles
 * @returns {string|null} - Nombre exacto de la columna encontrada o null
 */
function findMatchingColumn(requiredCol, availableColumns) {
    const normalizedRequired = normalizeString(requiredCol);
    
    // Primero intentar coincidencia exacta
    if (availableColumns.includes(requiredCol)) {
        return requiredCol;
    }
    
    // Luego buscar coincidencia normalizada
    for (const col of availableColumns) {
        if (normalizeString(col) === normalizedRequired) {
            return col;
        }
    }
    
    return null;
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
        col => !findMatchingColumn(col, availableColumns)
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

    // Obtener columnas disponibles del primer registro
    const availableColumns = data.length > 0 ? Object.keys(data[0]) : [];
    
    // Crear mapeo de columnas config -> columnas reales del archivo
    const columnMap = {};
    for (const sourceCol of Object.keys(config.columnMapping)) {
        const matchedCol = findMatchingColumn(sourceCol, availableColumns);
        if (matchedCol) {
            columnMap[sourceCol] = matchedCol;
        }
    }
    
    return data.map(row => {
        const transformedRow = {};
        
        // Mapear cada columna del archivo original a las columnas internas
        for (const [sourceCol, targetCol] of Object.entries(config.columnMapping)) {
            const actualCol = columnMap[sourceCol];
            if (actualCol && row.hasOwnProperty(actualCol)) {
                transformedRow[targetCol] = transformValue(sourceCol, row[actualCol], serviceType);
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
    const normalizedCol = normalizeString(columnName);
    
    // Si el valor está vacío, retornar según el tipo esperado
    if (value === null || value === undefined || value === '') {
        if (normalizedCol.includes('fecha de expedicion')) {
            return '';
        }
        return 0;
    }
    
    // Usar comparación normalizada para los casos
    if (normalizedCol.includes('fecha de expedicion')) {
        return formatDate(value);
    }
    
    if (normalizedCol === 'codigo clase de uso' || normalizedCol.includes('codigo de clase o uso')) {
        return Number(value) || 0;
    }
    
    if (normalizedCol === 'estado de medidor') {
        return convertMedidorState(value);
    }
    
    if (normalizedCol === 'usuario facturado con aforo') {
        return convertAforoState(value);
    }
    
    if (normalizedCol.includes('consumo del periodo') || 
        normalizedCol.includes('vertimiento del period') ||
        normalizedCol === 'valor total facturado' ||
        normalizedCol.includes('pagos del usuario') ||
        normalizedCol.includes('pagos del cliente') ||
        normalizedCol.includes('tarifa para la actividad')) {
        return parseNumber(value);
    }
    
    return value;
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
 * @param {string|number} estado - Estado del medidor (puede ser texto o número)
 * @returns {number} - 1 si el valor es 1 o "INSTALADO", 0 en cualquier otro caso
 */
function convertMedidorState(estado) {
    if (estado === null || estado === undefined || estado === '') return 0;
    
    // Si es un número o string numérico, verificar si es 1
    const numValue = Number(estado);
    if (!isNaN(numValue)) {
        return numValue === 1 ? 1 : 0;
    }
    
    // Si es texto, verificar si dice "INSTALADO"
    const estadoUpper = String(estado).toUpperCase().trim();
    if (estadoUpper === 'INSTALADO' || (estadoUpper.includes('INSTALADO') && !estadoUpper.includes('NO'))) {
        return 1;
    }
    
    // Cualquier otro estado es 0
    return 0;
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