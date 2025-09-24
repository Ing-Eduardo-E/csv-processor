import { exportData } from "./js/export.js";

import { MAX_FILE_SIZE, VALID_MIME_TYPES, ROWS_PER_PAGE, SERVICE_TYPES, SERVICE_COLUMNS } from "./js/config.js";

import { parseFile, validateCSVStructure, validateServiceColumns, mapServiceColumns } from "./js/parsers.js";

import {
  processAndGroupData,
  getMonthYear,
  getYear,
} from "./js/dataProcessing.js";

import { displayFilteredData } from "./js/ui.js";

import { createPaginationControls } from "./js/pagination.js";

// Estado global de la aplicación
let state = {
  selectedService: null,
  rawData: null,
  parsedData: null,
  processedData: null,
  availableColumns: [],
  currentPage: 1,
  currentReportType: "monthly",
  columnMapping: {}
};

// Referencias DOM
const elements = {
  serviceOptions: document.querySelectorAll('input[name="serviceType"]'),
  fileUploadSection: document.querySelector(".file-upload"),
  columnMappingSection: document.querySelector(".column-mapping"),
  fileInput: document.getElementById("csvFile"),
  previewSection: document.querySelector(".preview-section"),
  processingSection: document.querySelector(".processing-section"),
  previewTable: document.getElementById("previewTable"),
  reportTypeSelect: document.getElementById("reportType"),
  columnMappingContainer: document.getElementById("columnMappingContainer"),
  confirmMappingBtn: document.getElementById("confirmMappingBtn"),
  requiredColumnsList: document.getElementById("requiredColumnsList")
};

/**
 * Maneja la selección del tipo de servicio
 */
function handleServiceSelection() {
  const selectedService = document.querySelector('input[name="serviceType"]:checked');
  if (!selectedService) return;
  
  state.selectedService = selectedService.value;
  
  // Mostrar los requisitos del servicio seleccionado
  updateRequiredColumnsList(state.selectedService);
  
  // Mostrar la sección de carga de archivo
  elements.fileUploadSection.classList.remove("hidden");
  
  // Ocultar secciones posteriores
  elements.columnMappingSection.classList.add("hidden");
  elements.previewSection.classList.add("hidden");
  elements.processingSection.classList.add("hidden");
  
  // Resetear estado
  state.rawData = null;
  state.parsedData = null;
  state.availableColumns = [];
  state.columnMapping = {};
  elements.fileInput.value = "";
}

/**
 * Actualiza la lista de columnas requeridas según el servicio
 * @param {string} serviceType - Tipo de servicio seleccionado
 */
function updateRequiredColumnsList(serviceType) {
  const serviceConfig = SERVICE_COLUMNS[serviceType];
  if (!serviceConfig) return;
  
  const listContainer = elements.requiredColumnsList;
  listContainer.innerHTML = `
    <h5>Para el servicio de ${serviceConfig.name}, se requieren las siguientes columnas:</h5>
    <ul class="required-columns-list">
      ${serviceConfig.requiredColumns.map(col => `<li>${col}</li>`).join('')}
    </ul>
  `;
}

/**
 * Genera la interfaz de mapeo de columnas
 */
function generateColumnMapping() {
  if (!state.selectedService || !state.availableColumns.length) return;
  
  const serviceConfig = SERVICE_COLUMNS[state.selectedService];
  const requiredColumns = serviceConfig.requiredColumns;
  
  const mappingHTML = requiredColumns.map(requiredCol => {
    const targetCol = serviceConfig.mappedColumns[requiredCol];
    return `
      <div class="mapping-row">
        <div class="mapping-label">${requiredCol}</div>
        <select class="mapping-select" data-target="${targetCol}" data-required="${requiredCol}">
          <option value="">-- Seleccionar columna --</option>
          ${state.availableColumns.map(col => 
            `<option value="${col}" ${col === requiredCol ? 'selected' : ''}>${col}</option>`
          ).join('')}
        </select>
      </div>
    `;
  }).join('');
  
  elements.columnMappingContainer.innerHTML = mappingHTML;
  
  // Agregar event listeners a los selects
  const selects = elements.columnMappingContainer.querySelectorAll('.mapping-select');
  selects.forEach(select => {
    select.addEventListener('change', updateColumnMapping);
  });
}

/**
 * Actualiza el mapeo de columnas cuando el usuario cambia las selecciones
 */
function updateColumnMapping() {
  const selects = elements.columnMappingContainer.querySelectorAll('.mapping-select');
  const newMapping = {};
  
  selects.forEach(select => {
    const requiredCol = select.dataset.required;
    const targetCol = select.dataset.target;
    const selectedCol = select.value;
    
    if (selectedCol) {
      newMapping[requiredCol] = targetCol;
    }
  });
  
  state.columnMapping = newMapping;
}

/**
 * Confirma el mapeo de columnas y procesa los datos
 */
function confirmColumnMapping() {
  if (!state.rawData || !state.selectedService) {
    alert("Error: No hay datos para procesar");
    return;
  }
  
  // Validar que todas las columnas requeridas estén mapeadas
  const serviceConfig = SERVICE_COLUMNS[state.selectedService];
  const requiredColumns = serviceConfig.requiredColumns;
  
  const selects = elements.columnMappingContainer.querySelectorAll('.mapping-select');
  const missingMappings = [];
  
  selects.forEach(select => {
    if (!select.value) {
      missingMappings.push(select.dataset.required);
    }
  });
  
  if (missingMappings.length > 0) {
    alert(`Por favor, seleccione columnas para: ${missingMappings.join(', ')}`);
    return;
  }
  
  try {
    // Crear mapeo personalizado basado en las selecciones del usuario
    const customMapping = {};
    selects.forEach(select => {
      const requiredCol = select.dataset.required;
      const targetCol = select.dataset.target;
      const selectedCol = select.value;
      customMapping[selectedCol] = targetCol;
    });
    
    // Agregar valores por defecto para servicio de aseo
    if (state.selectedService === SERVICE_TYPES.ASEO) {
      customMapping['_default_medidor'] = 'Medidor';
      customMapping['_default_consumo'] = 'Consumo'; 
      customMapping['_default_total_facturado'] = 'Total Facturado';
      customMapping['_default_total_recaudo'] = 'Total Recaudo';
    }
    
    // Mapear los datos
    state.parsedData = mapServiceColumns(state.rawData, state.selectedService, customMapping);
    
    // Continuar con el flujo normal
    state.currentPage = 1;
    state.currentReportType = "monthly";
    
    // Actualizar vista
    updateReportView(state.currentReportType);
    
    // Mostrar secciones
    elements.columnMappingSection.classList.add("hidden");
    elements.previewSection.classList.remove("hidden");
    elements.processingSection.classList.remove("hidden");
    
  } catch (error) {
    console.error("Error al procesar los datos:", error);
    alert("Error al procesar los datos. Por favor, verifique el mapeo de columnas.");
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
    exportData(filteredData, state.currentReportType, format);
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al exportar los datos");
  }
}

/**
 * Filtra y agrupa los datos según el tipo de reporte seleccionado
 * @param {Array} data - Datos sin procesar
 * @param {string} reportType - Tipo de reporte ('monthly' o 'annual')
 */
function filterDataByReportType(data, reportType) {
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
      elements.previewTable
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
 * Maneja la carga del archivo
 * @param {Event} event - Evento del input file
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (!state.selectedService) {
    alert("Por favor, seleccione primero un tipo de servicio");
    elements.fileInput.value = "";
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    alert("El archivo excede el tamaño máximo permitido de 5MB");
    elements.fileInput.value = "";
    return;
  }

  if (!VALID_MIME_TYPES.includes(file.type)) {
    alert("Por favor, seleccione un archivo Excel (.xlsx) o CSV válido");
    elements.fileInput.value = "";
    return;
  }

  try {
    // Parsear el archivo
    const result = await parseFile(file);
    state.rawData = result.data;
    state.availableColumns = result.availableColumns;

    console.log("Archivo parseado:", {
      totalRows: state.rawData.length,
      availableColumns: state.availableColumns
    });

    // Si es un CSV con las columnas correctas, procesarlo directamente
    if (result.fileType === 'csv') {
      const validation = validateCSVStructure(state.rawData);
      if (validation.isValid) {
        // CSV con formato correcto, procesarlo directamente
        state.parsedData = state.rawData;
        
        state.currentPage = 1;
        state.currentReportType = "monthly";
        
        updateReportView(state.currentReportType);
        
        elements.previewSection.classList.remove("hidden");
        elements.processingSection.classList.remove("hidden");
        return;
      }
    }

    // Para archivos XLSX o CSV que requieren mapeo
    const serviceValidation = validateServiceColumns(state.availableColumns, state.selectedService);
    
    if (serviceValidation.isValid) {
      // Todas las columnas requeridas están disponibles con los nombres exactos
      state.parsedData = mapServiceColumns(state.rawData, state.selectedService);
      
      state.currentPage = 1;
      state.currentReportType = "monthly";
      
      updateReportView(state.currentReportType);
      
      elements.previewSection.classList.remove("hidden");
      elements.processingSection.classList.remove("hidden");
    } else {
      // Mostrar interfaz de mapeo de columnas
      generateColumnMapping();
      elements.columnMappingSection.classList.remove("hidden");
    }

  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Error al procesar el archivo.");
    elements.fileInput.value = "";
  }
}

/**
 * Inicializa la aplicación
 */
function initApp() {
  // Event listeners para selección de servicio
  elements.serviceOptions.forEach(option => {
    option.addEventListener('change', handleServiceSelection);
  });
  
  // Event listeners existentes
  elements.fileInput.addEventListener("change", handleFileUpload);
  elements.confirmMappingBtn.addEventListener("click", confirmColumnMapping);
  
  if (elements.reportTypeSelect) {
    elements.reportTypeSelect.addEventListener("change", (e) => {
      state.currentReportType = e.target.value;
      state.currentPage = 1; // Reset a primera página
      updateReportView(state.currentReportType);
    });
  }

  // Event listener para el botón de proceso
  const processBtn = document.getElementById("processBtn");
  if (processBtn) {
    processBtn.addEventListener("click", () => {
      handleExport("xlsx");
    });
  }
}

// Iniciar la aplicación cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", initApp);
