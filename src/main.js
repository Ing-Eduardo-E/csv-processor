import { exportData } from "./js/export.js";

import { MAX_FILE_SIZE, VALID_MIME_TYPES, ROWS_PER_PAGE, SERVICE_CONFIGS, SERVICE_TYPES } from "./js/config.js";

import { parseCSV, parseExcel, validateCSVStructure } from "./js/parsers.js";

import {
  processAndGroupData,
  getMonthYear,
  getYear,
} from "./js/dataProcessing.js";

import { displayFilteredData } from "./js/ui.js";

import { createPaginationControls } from "./js/pagination.js";

// Estado global de la aplicación
let state = {
  parsedData: null,
  processedData: null,
  currentPage: 1,
  currentReportType: "monthly",
  currentServiceType: SERVICE_TYPES.ACUEDUCTO, // Tipo de servicio por defecto
};

// Referencias DOM
const elements = {
  fileInput: document.getElementById("csvFile"),
  serviceTypeSelect: document.getElementById("serviceType"),
  previewSection: document.querySelector(".preview-section"),
  processingSection: document.querySelector(".processing-section"),
  previewTable: document.getElementById("previewTable"),
  reportTypeSelect: document.getElementById("reportType"),
  formatTableBody: document.getElementById("formatTableBody"),
  serviceFileNote: document.getElementById("serviceFileNote"),
};

/**
 * Actualiza la guía de formato según el tipo de servicio seleccionado
 * @param {string} serviceType - Tipo de servicio
 */
function updateFormatGuide(serviceType) {
  const config = SERVICE_CONFIGS[serviceType];
  if (!config) return;

  // Actualizar nota del servicio
  if (elements.serviceFileNote) {
    elements.serviceFileNote.textContent = `Archivo completo del sistema de ${config.name} (todas las columnas)`;
  }

  // Actualizar tabla de columnas
  if (elements.formatTableBody) {
    elements.formatTableBody.innerHTML = '';
    
    config.displayColumns.forEach(col => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${col.original}</td>
        <td>${col.description}</td>
      `;
      elements.formatTableBody.appendChild(row);
    });
  }
}

/**
 * Maneja el cambio de tipo de servicio
 * @param {Event} event - Evento del selector
 */
function handleServiceTypeChange(event) {
  state.currentServiceType = event.target.value;
  
  // Actualizar la guía de formato
  updateFormatGuide(state.currentServiceType);
  
  // Limpiar datos anteriores si había archivo cargado
  if (state.parsedData) {
    state.parsedData = null;
    elements.fileInput.value = "";
    elements.previewSection.classList.add("hidden");
    elements.processingSection.classList.add("hidden");
  }
}

/**
 * Maneja el proceso de exportación de datos
 * @param {string} format - Formato de exportación ('xlsx' o 'csv')
 */
function handleExport(format = "xlsx") {
  if (!state.parsedData) {
    alert("No hay datos para exportar");
    return;
  }

  try {
    const filteredData = filterDataByReportType(
      state.parsedData,
      state.currentReportType
    );
    exportData(filteredData, state.currentReportType, format, state.currentServiceType);
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al exportar los datos");
  }
}

/**
 * Filtra y agrupa datos del servicio de Aseo
 * @param {Array} data - Datos sin procesar
 * @param {string} reportType - Tipo de reporte ('monthly' o 'annual')
 */
function filterAseoData(data, reportType) {
  const groups = {};
  const tarifasPorEstrato = {}; // Para guardar tarifas únicas por estrato

  data.forEach((row) => {
    const timeKey =
      reportType === "monthly"
        ? getMonthYear(row["Fecha"])
        : getYear(row["Fecha"]);

    const key = `${timeKey}_${row["Clase de Uso"]}`;
    
    if (!groups[key]) {
      groups[key] = {
        periodo: timeKey,
        claseUso: row["Clase de Uso"],
        numeroUsuarios: 0,
        tarifa: 0
      };
      tarifasPorEstrato[key] = [];
    }

    // Incrementar contador de usuarios
    groups[key].numeroUsuarios++;
    
    // Guardar tarifa si existe
    const tarifa = Number(row["Tarifa"]) || 0;
    if (tarifa > 0) {
      tarifasPorEstrato[key].push(tarifa);
    }
  });

  return Object.values(groups)
    .map((group) => {
      const key = `${group.periodo}_${group.claseUso}`;
      
      // Calcular tarifa promedio o más frecuente
      if (tarifasPorEstrato[key] && tarifasPorEstrato[key].length > 0) {
        // Usar la tarifa más frecuente (moda)
        const tarifaPromedio = tarifasPorEstrato[key].reduce((sum, t) => sum + t, 0) / tarifasPorEstrato[key].length;
        group.tarifa = Math.round(tarifaPromedio * 100) / 100;
      }

      return {
        periodo: group.periodo,
        claseUso: group.claseUso,
        numeroUsuarios: group.numeroUsuarios,
        tarifa: group.tarifa
      };
    })
    .sort((a, b) => {
      const periodoComparison = a.periodo.localeCompare(b.periodo);
      return periodoComparison !== 0
        ? periodoComparison
        : Number(a.claseUso) - Number(b.claseUso);
    });
}

/**
 * Filtra y agrupa los datos según el tipo de reporte seleccionado
 * @param {Array} data - Datos sin procesar
 * @param {string} reportType - Tipo de reporte ('monthly' o 'annual')
 */
function filterDataByReportType(data, reportType) {
  // Si es servicio de Aseo, usar procesamiento simplificado
  if (state.currentServiceType === SERVICE_TYPES.ASEO) {
    return filterAseoData(data, reportType);
  }

  const groups = {};
  const monthlyTracking = {};

  data.forEach((row) => {
    const timeKey =
      reportType === "monthly"
        ? getMonthYear(row["Fecha"])
        : getYear(row["Fecha"]);

    const key = `${timeKey}_${row["Clase de Uso"]}`;
    const medidor = Number(row["Medidor"]);

    if (reportType === "annual") {
      // Inicializar el tracking mensual si no existe
      if (!monthlyTracking[key]) {
        monthlyTracking[key] = {
          usuariosPorMes: {},
          medidoresPorMes: {},
        };
      }

      const month = getMonthFromDate(row["Fecha"]);

      // Inicializar contadores mensuales si no existen
      if (!monthlyTracking[key].usuariosPorMes[month]) {
        monthlyTracking[key].usuariosPorMes[month] = 0;
        monthlyTracking[key].medidoresPorMes[month] = 0;
      }

      // Actualizar contadores mensuales
      monthlyTracking[key].usuariosPorMes[month]++;
      // Si tiene medidor (valor 1), incrementar el contador
      if (medidor === 1) {
        monthlyTracking[key].medidoresPorMes[month]++;
      }
    }

    if (!groups[key]) {
      groups[key] = {
        periodo: timeKey,
        claseUso: row["Clase de Uso"],
        numeroUsuarios: 0,
        numeroMedidores: 0, // Cambiado a contador simple
        totalConsumo: 0,
        totalFacturado: 0,
        totalRecaudo: 0,
      };
    }

    // Incrementar contadores
    groups[key].numeroUsuarios++;
    // Si tiene medidor (valor 1), incrementar el contador
    if (medidor === 1) {
      groups[key].numeroMedidores++;
    }

    // Sumar valores numéricos
    groups[key].totalConsumo += Number(row["Consumo"]) || 0;
    groups[key].totalFacturado += Number(row["Total Facturado"]) || 0;
    groups[key].totalRecaudo += Number(row["Total Recaudo"]) || 0;
  });

  return Object.values(groups)
    .map((group) => {
      const key = `${group.periodo}_${group.claseUso}`;
      let numeroUsuarios = group.numeroUsuarios;
      let numeroMedidores = group.numeroMedidores;

      if (reportType === "annual" && monthlyTracking[key]) {
        // Calcular promedios para reporte anual
        const mesesConRegistros = Object.keys(
          monthlyTracking[key].usuariosPorMes
        ).length;

        // Promedio de usuarios
        const totalUsuarios = Object.values(
          monthlyTracking[key].usuariosPorMes
        ).reduce((sum, count) => sum + count, 0);

        // Promedio de medidores
        const totalMedidores = Object.values(
          monthlyTracking[key].medidoresPorMes
        ).reduce((sum, count) => sum + count, 0);

        numeroUsuarios = Math.round(totalUsuarios / mesesConRegistros);
        numeroMedidores = Math.round(totalMedidores / mesesConRegistros);
      }

      return {
        periodo: group.periodo,
        claseUso: group.claseUso,
        numeroUsuarios: numeroUsuarios,
        numeroMedidores: numeroMedidores,
        totalConsumo: Math.round(group.totalConsumo * 100) / 100,
        totalFacturado: Math.round(group.totalFacturado * 100) / 100,
        totalRecaudo: Math.round(group.totalRecaudo * 100) / 100,
      };
    })
    .sort((a, b) => {
      const periodoComparison = a.periodo.localeCompare(b.periodo);
      return periodoComparison !== 0
        ? periodoComparison
        : Number(a.claseUso) - Number(b.claseUso);
    });
}

/**
 * Obtiene el mes de una fecha en formato dd-MM-yyyy
 * @param {string} dateStr - Fecha en formato dd-MM-yyyy
 * @returns {string} - Mes (MM)
 */
function getMonthFromDate(dateStr) {
  return dateStr.split("-")[1];
}

/**
 * Actualiza la visualización con los datos filtrados
 * @param {string} reportType - Tipo de reporte seleccionado
 */
function updateReportView(reportType) {
  if (!state.parsedData) {
    console.error("No hay datos para mostrar");
    return;
  }

  try {
    const filteredData = filterDataByReportType(state.parsedData, reportType);
    const totalRows = displayFilteredData(
      filteredData,
      state.currentPage,
      ROWS_PER_PAGE,
      elements.previewTable,
      state.currentServiceType
    );

    createPaginationControls(
      totalRows,
      state.currentPage,
      ROWS_PER_PAGE,
      (newPage) => {
        state.currentPage = newPage;
        updateReportView(state.currentReportType);
      }
    );
  } catch (error) {
    console.error("Error al actualizar la vista:", error);
    alert("Error al generar el reporte.");
  }
}

/**
 * Maneja la carga del archivo CSV
 * @param {Event} event - Evento del input file
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    alert("El archivo excede el tamaño máximo permitido de 25MB");
    elements.fileInput.value = "";
    return;
  }

  if (!VALID_MIME_TYPES.includes(file.type)) {
    alert("Por favor, seleccione un archivo CSV o Excel válido");
    elements.fileInput.value = "";
    return;
  }

  try {
    // Detectar tipo de archivo por extensión
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    // Primero leer el archivo para validar estructura
    const rawData = isExcel ? await parseRawExcel(file) : await parseRawCSV(file);
    
    // Validar que tenga las columnas originales requeridas según el servicio
    const validation = validateCSVStructure(rawData, state.currentServiceType);
    if (!validation.isValid) {
      throw new Error(
        `El archivo no contiene las columnas requeridas para ${SERVICE_CONFIGS[state.currentServiceType].name}.\n\nColumnas faltantes:\n${validation.missingColumns.join('\n')}`
      );
    }

    // Ahora parsear y transformar los datos según el tipo de servicio y formato
    state.parsedData = isExcel 
      ? await parseExcel(file, state.currentServiceType)
      : await parseCSV(file, state.currentServiceType);

    // Resetear estado y mostrar datos
    state.currentPage = 1;
    state.currentReportType = "monthly";

    // Actualizar vista
    updateReportView(state.currentReportType);

    // Mostrar secciones
    elements.previewSection.classList.remove("hidden");
    elements.processingSection.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Error al procesar el archivo.");
    elements.fileInput.value = "";
  }
}

/**
 * Lee el archivo con la codificación correcta
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
 * Lee el CSV sin transformar para validación
 * @param {File} file - Archivo a leer
 * @returns {Promise<Array>} - Datos sin transformar
 */
async function parseRawCSV(file) {
  const fileContent = await readFileWithEncoding(file);
  
  return new Promise((resolve, reject) => {
    // Importar Papa dinámicamente para evitar duplicación
    import('papaparse').then(Papa => {
      Papa.default.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        preview: 1, // Solo leer primera línea para validación
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
  });
}

/**
 * Lee el Excel sin transformar para validación
 * @param {File} file - Archivo a leer
 * @returns {Promise<Array>} - Datos sin transformar
 */
function parseRawExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        // Importar XLSX dinámicamente
        import('xlsx').then(XLSX => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Leer la primera hoja
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convertir solo la primera fila para validación
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: '',
            range: 0 // Solo primera fila de datos
          });
          
          if (!jsonData.length) {
            reject(new Error("El archivo Excel está vacío"));
          } else {
            resolve(jsonData);
          }
        }).catch(error => {
          reject(new Error(`Error al importar librería XLSX: ${error.message}`));
        });
      } catch (error) {
        reject(new Error(`Error al leer el archivo Excel: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Inicializa la aplicación
 */
function initApp() {
  // Actualizar guía de formato con servicio por defecto
  updateFormatGuide(state.currentServiceType);

  // Event listeners
  elements.serviceTypeSelect.addEventListener("change", handleServiceTypeChange);
  elements.fileInput.addEventListener("change", handleFileUpload);
  elements.reportTypeSelect.addEventListener("change", (e) => {
    state.currentReportType = e.target.value;
    state.currentPage = 1; // Reset a primera página
    updateReportView(state.currentReportType);
  });

  // Nuevo event listener para el botón de proceso
  const processBtn = document.getElementById("processBtn");
  processBtn.addEventListener("click", () => {
    handleExport("xlsx"); // Puedes cambiarlo a 'csv' si prefieres ese formato
  });
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initApp);
