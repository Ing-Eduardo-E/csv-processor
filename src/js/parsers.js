import Papa from 'papaparse';
import { REQUIRED_COLUMNS } from './config.js';

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
                    resolve(results.data);
                }
            },
            error: (error) => reject(error)
        });
    });
}

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