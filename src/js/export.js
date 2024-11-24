import * as XLSX from 'xlsx';

/**
 * Exporta los datos a un archivo Excel o CSV
 * @param {Array} data - Datos a exportar
 * @param {string} reportType - Tipo de reporte ('monthly' o 'annual')
 * @param {string} format - Formato de exportación ('xlsx' o 'csv')
 */
export function exportData(data, reportType, format = 'xlsx') {
    // Definir el nombre del archivo
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `reporte_${reportType}_${timestamp}`;

    // Preparar los datos para la exportación
    const exportData = data.map(row => ({
        'Periodo': row.periodo,
        'Clase de Uso': row.claseUso,
        'Usuarios': row.numeroUsuarios,
        'Medidores': row.numeroMedidores,
        'Total Consumo': row.totalConsumo,
        'Total Facturado': row.totalFacturado,
        'Total Recaudo': row.totalRecaudo
    }));

    if (format === 'xlsx') {
        exportToExcel(exportData, fileName);
    } else {
        exportToCSV(exportData, fileName);
    }
}

/**
 * Exporta los datos a un archivo Excel
 * @param {Array} data - Datos a exportar
 * @param {string} fileName - Nombre del archivo
 */
function exportToExcel(data, fileName) {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();
    
    // Convertir los datos a una hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar el ancho de las columnas
    const colWidths = [
        { wch: 10 },  // Periodo
        { wch: 12 },  // Clase de Uso
        { wch: 10 },  // Usuarios
        { wch: 10 },  // Medidores
        { wch: 15 },  // Total Consumo
        { wch: 15 },  // Total Facturado
        { wch: 15 }   // Total Recaudo
    ];
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