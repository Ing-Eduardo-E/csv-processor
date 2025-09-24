import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { REQUIRED_COLUMNS, SERVICE_COLUMNS } from './config.js';

/**
 * Detecta si el archivo es CSV o XLSX
 * @param {File} file - Archivo a verificar
 * @returns {string} - Tipo de archivo ('csv' o 'xlsx')
 */
export function detectFileType(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const mimeType = file.type;
    
    if (extension === 'xlsx' || mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        return 'xlsx';
    }
    return 'csv';
}

/**
 * Parser unificado para CSV y XLSX
 * @param {File} file - Archivo a parsear
 * @returns {Promise<Object>} - Resultado con datos y columnas disponibles
 */
export function parseFile(file) {
    const fileType = detectFileType(file);
    
    if (fileType === 'xlsx') {
        return parseXLSX(file);
    } else {
        return parseCSV(file);
    }
}

/**
 * Parsea archivo CSV (función original)
 * @param {File} file - Archivo CSV
 * @returns {Promise<Object>} - Datos parseados
 */
export function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length) {
                    reject(results.errors);
                } else if (!results.data.length) {
                    reject(new Error("El archivo está vacío"));
                } else {
                    resolve({
                        data: results.data,
                        availableColumns: Object.keys(results.data[0] || {}),
                        fileType: 'csv'
                    });
                }
            },
            error: (error) => reject(error)
        });
    });
}

/**
 * Parsea archivo XLSX
 * @param {File} file - Archivo XLSX
 * @returns {Promise<Object>} - Datos parseados
 */
export function parseXLSX(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // Usar la primera hoja
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // Convertir a JSON
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                if (jsonData.length === 0) {
                    reject(new Error("El archivo está vacío"));
                    return;
                }
                
                // La primera fila contiene los headers
                const headers = jsonData[0];
                const rows = jsonData.slice(1);
                
                // Convertir a formato de objetos
                const parsedData = rows
                    .filter(row => row.some(cell => cell !== undefined && cell !== null && cell !== ''))
                    .map(row => {
                        const obj = {};
                        headers.forEach((header, index) => {
                            obj[header] = row[index] || '';
                        });
                        return obj;
                    });
                
                if (parsedData.length === 0) {
                    reject(new Error("No hay datos válidos en el archivo"));
                    return;
                }
                
                resolve({
                    data: parsedData,
                    availableColumns: headers.filter(h => h !== undefined && h !== null && h !== ''),
                    fileType: 'xlsx'
                });
                
            } catch (error) {
                reject(new Error(`Error al procesar el archivo XLSX: ${error.message}`));
            }
        };
        
        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Valida la estructura del CSV (función original para compatibilidad)
 * @param {Array} data - Datos a validar
 * @returns {Object} - Resultado de validación
 */
export function validateCSVStructure(data) {
    if (!Array.isArray(data) || !data.length) {
        return {
            isValid: false,
            missingColumns: ["No hay datos para validar"]
        };
    }

    const firstRow = data[0];
    const missingColumns = REQUIRED_COLUMNS.filter(
        col => !Object.keys(firstRow).includes(col)
    );

    return {
        isValid: missingColumns.length === 0,
        missingColumns
    };
}

/**
 * Valida que las columnas requeridas estén disponibles para un servicio
 * @param {Array} availableColumns - Columnas disponibles en el archivo
 * @param {string} serviceType - Tipo de servicio
 * @returns {Object} - Resultado de validación
 */
export function validateServiceColumns(availableColumns, serviceType) {
    const serviceConfig = SERVICE_COLUMNS[serviceType];
    
    if (!serviceConfig) {
        return {
            isValid: false,
            missingColumns: ["Tipo de servicio no válido"]
        };
    }
    
    const requiredColumns = serviceConfig.requiredColumns;
    const missingColumns = requiredColumns.filter(
        col => !availableColumns.includes(col)
    );
    
    return {
        isValid: missingColumns.length === 0,
        missingColumns,
        availableRequiredColumns: requiredColumns.filter(col => availableColumns.includes(col))
    };
}

/**
 * Mapea las columnas del archivo original a las columnas estándar del sistema
 * @param {Array} data - Datos originales
 * @param {string} serviceType - Tipo de servicio
 * @param {Object} columnMapping - Mapeo personalizado de columnas (opcional)
 * @returns {Array} - Datos con columnas mapeadas
 */
export function mapServiceColumns(data, serviceType, columnMapping = null) {
    const serviceConfig = SERVICE_COLUMNS[serviceType];
    const mapping = columnMapping || serviceConfig.mappedColumns;
    
    return data.map(row => {
        const mappedRow = {};
        
        // Mapear columnas existentes
        Object.entries(mapping).forEach(([originalCol, targetCol]) => {
            if (originalCol.startsWith('_default_')) {
                // Valores por defecto para columnas faltantes
                if (originalCol === '_default_medidor') {
                    mappedRow[targetCol] = serviceType === 'aseo' ? 0 : 1; // Aseo no tiene medidores
                } else if (originalCol === '_default_consumo') {
                    mappedRow[targetCol] = serviceType === 'aseo' ? 0 : 0; // Aseo no tiene consumo
                } else if (originalCol === '_default_total_facturado') {
                    mappedRow[targetCol] = 0; // Valor por defecto
                } else if (originalCol === '_default_total_recaudo') {
                    mappedRow[targetCol] = 0; // Valor por defecto
                }
            } else {
                mappedRow[targetCol] = row[originalCol] || '';
            }
        });
        
        return mappedRow;
    });
}