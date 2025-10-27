import * as XLSX from 'xlsx';

/**
 * Exporta los datos a un archivo Excel o CSV
 * @param {Array} data - Datos a exportar
 * @param {string} reportType - Tipo de reporte ('monthly' o 'annual')
 * @param {string} format - Formato de exportación ('xlsx' o 'csv')
 * @param {string} serviceType - Tipo de servicio ('acueducto', 'alcantarillado', 'aseo')
 */
export function exportData(data, reportType, format = 'xlsx', serviceType = 'acueducto') {
    // Definir el nombre del archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `reporte_${serviceType}_${reportType}_${timestamp}`;

    // Preparar los datos para la exportación según el tipo de servicio
    let exportData;
    
    if (serviceType === 'aseo') {
        exportData = data.map(row => ({
            'Periodo': row.periodo,
            'Estrato': row.claseUso,
            'Usuarios': row.numeroUsuarios,
            'Tarifa ($)': row.tarifa
        }));
    } else {
        exportData = data.map(row => ({
            'Periodo': row.periodo,
            'Clase de Uso': row.claseUso,
            'Usuarios': row.numeroUsuarios,
            'Medidores/Aforo': row.numeroMedidores,
            'Total Consumo/Vertimiento': row.totalConsumo,
            'Total Facturado': row.totalFacturado,
            'Total Recaudo': row.totalRecaudo
        }));
    }

    if (format === 'xlsx') {
        exportToExcel(exportData, fileName, serviceType);
    } else {
        exportToCSV(exportData, fileName);
    }
}

/**
 * Exporta los datos a un archivo Excel
 * @param {Array} data - Datos a exportar
 * @param {string} fileName - Nombre del archivo
 * @param {string} serviceType - Tipo de servicio
 */
function exportToExcel(data, fileName, serviceType) {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar el ancho de las columnas según el tipo de servicio
    let colWidths;
    
    if (serviceType === 'aseo') {
        colWidths = [
            { wch: 10 },  // Periodo
            { wch: 10 },  // Estrato
            { wch: 10 },  // Usuarios
            { wch: 15 }   // Tarifa
        ];
    } else {
        colWidths = [
            { wch: 10 },  // Periodo
            { wch: 12 },  // Clase de Uso
            { wch: 10 },  // Usuarios
            { wch: 15 },  // Medidores/Aforo
            { wch: 18 },  // Total Consumo/Vertimiento
            { wch: 15 },  // Total Facturado
            { wch: 15 }   // Total Recaudo
        ];
    }
    
    ws['!cols'] = colWidths;

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');

    // Guardar el archivo
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}

/**
 * Exporta los datos a un archivo CSV
 * @param {Array} data - Datos a exportar
 * @param {string} fileName - Nombre del archivo
 */
function exportToCSV(data, fileName) {
    // Convertir los datos a formato CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
        Object.values(row).map(value => 
            typeof value === 'string' ? `"${value}"` : value
        ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Crear el blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName}.csv`;
    link.click();
}