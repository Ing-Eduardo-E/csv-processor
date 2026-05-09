import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SERVICE_CONFIGS } from './config.js';
import { getTransformer } from './transformers/transformerRegistry.js';
import { normalizeColumnName, buildNormalizedLookup, findColumnMatch } from './utils/columnNormalizer.js';

export { normalizeColumnName, buildNormalizedLookup, findColumnMatch };

async function readFileWithEncoding(file) {
    const utf8Text = await file.text();

    if (utf8Text.includes('\uFFFD')) {
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder('windows-1252');
        return decoder.decode(buffer);
    }

    return utf8Text;
}

export function parseCSV(file, serviceType) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileContent = await readFileWithEncoding(file);

            Papa.parse(fileContent, {
                header: true,
                dynamicTyping: false,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length) {
                        reject(results.errors);
                    } else if (!results.data.length) {
                        reject(new Error("El archivo está vacío"));
                    } else {
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

export function parseExcel(file, serviceType) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    defval: ''
                });

                if (!jsonData.length) {
                    reject(new Error("El archivo Excel está vacío"));
                } else {
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

export function validateCSVStructure(data, serviceType) {
    if (!Array.isArray(data) || !data.length) {
        return {
            isValid: false,
            missingColumns: ["No hay datos para validar"],
            matchedColumns: {},
            availableColumns: []
        };
    }

    const config = SERVICE_CONFIGS[serviceType];
    if (!config) {
        return {
            isValid: false,
            missingColumns: ["Tipo de servicio no válido"],
            matchedColumns: {},
            availableColumns: []
        };
    }

    const firstRow = data[0];
    const availableColumns = Object.keys(firstRow);
    const lookup = buildNormalizedLookup(availableColumns);

    const missingColumns = [];
    const matchedColumns = {};

    for (const requiredCol of config.requiredColumns) {
        const match = findColumnMatch(lookup, requiredCol);
        if (match) {
            matchedColumns[requiredCol] = match;
        } else {
            missingColumns.push(requiredCol);
        }
    }

    if (missingColumns.length > 0) {
        console.group('[CSV Validator] Validación fallida');
        console.warn('Servicio:', config.name);
        console.warn('Columnas requeridas:', config.requiredColumns);
        console.warn('Columnas disponibles:', availableColumns);
        console.warn('Columnas disponibles (normalizadas):', availableColumns.map(normalizeColumnName));
        console.warn('Columnas faltantes:', missingColumns);
        console.warn('Columnas emparejadas:', matchedColumns);
        console.groupEnd();
    } else {
        console.info(`[CSV Validator] ✓ Validación exitosa para ${config.name} — ${config.requiredColumns.length} columnas verificadas`);
        if (Object.values(matchedColumns).some((v, i) => v !== config.requiredColumns[i])) {
            console.info('[CSV Validator] Se aplicó normalización de columnas (tildes/espacios/mayúsculas)');
            console.info('[CSV Validator] Mapeo aplicado:', matchedColumns);
        }
    }

    return {
        isValid: missingColumns.length === 0,
        missingColumns,
        matchedColumns,
        availableColumns
    };
}

export function parseRawCSV(file) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileContent = await readFileWithEncoding(file);

            Papa.parse(fileContent, {
                header: true,
                skipEmptyLines: true,
                preview: 1,
                complete: (results) => {
                    if (results.errors.length) {
                        reject(results.errors);
                    } else if (!results.data.length) {
                        reject(new Error("El archivo está vacío"));
                    } else {
                        resolve(results.data);
                    }
                },
                error: (error) => reject(error)
            });
        } catch (error) {
            reject(error);
        }
    });
}

export function parseRawExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    raw: false,
                    defval: ''
                });

                if (!jsonData.length) {
                    reject(new Error("El archivo Excel está vacío"));
                } else {
                    resolve(jsonData);
                }
            } catch (error) {
                reject(new Error(`Error al leer el archivo Excel: ${error.message}`));
            }
        };

        reader.onerror = () => reject(new Error("Error al leer el archivo"));
        reader.readAsArrayBuffer(file);
    });
}

function transformData(data, serviceType) {
    const config = SERVICE_CONFIGS[serviceType];
    if (!config) {
        throw new Error("Configuración de servicio no encontrada");
    }

    const transformer = getTransformer(serviceType);
    const dataColumns = Object.keys(data[0] || {});
    const lookup = buildNormalizedLookup(dataColumns);

    const columnMapping = {};
    for (const [requiredCol, targetCol] of Object.entries(config.columnMapping)) {
        const match = findColumnMatch(lookup, requiredCol);
        if (match) {
            columnMapping[requiredCol] = { realName: match, targetCol };
        }
    }

    return data.map(row => {
        const transformedRow = {};

        for (const { realName, targetCol } of Object.values(columnMapping)) {
            if (row.hasOwnProperty(realName)) {
                transformedRow[targetCol] = transformer.transform(realName, row[realName]);
            }
        }

        return transformedRow;
    });
}
