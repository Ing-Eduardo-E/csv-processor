import { exportData } from "./js/export.js";

import { MAX_FILE_SIZE, VALID_MIME_TYPES, ROWS_PER_PAGE } from "./js/config.js";

import { parseCSV, validateCSVStructure } from "./js/parsers.js";

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
};

// Referencias DOM
const elements = {
  fileInput: document.getElementById("csvFile"),
  previewSection: document.querySelector(".preview-section"),
  processingSection: document.querySelector(".processing-section"),
  previewTable: document.getElementById("previewTable"),
  reportTypeSelect: document.getElementById("reportType"),
};

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
 * Maneja la carga del archivo CSV
 * @param {Event} event - Evento del input file
 */
async function handleFileUpload(event) {
  const file = event.target.files[0];

  if (!file) return;

  if (file.size > MAX_FILE_SIZE) {
    alert("El archivo excede el tamaño máximo permitido de 5MB");
    elements.fileInput.value = "";
    return;
  }

  if (!VALID_MIME_TYPES.includes(file.type)) {
    alert("Por favor, seleccione un archivo CSV válido");
    elements.fileInput.value = "";
    return;
  }

  try {
    // Procesar el archivo
    state.parsedData = await parseCSV(file);

    // Validar estructura
    const validation = validateCSVStructure(state.parsedData);
    if (!validation.isValid) {
      throw new Error(
        `Columnas faltantes: ${validation.missingColumns.join(", ")}`
      );
    }

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
 * Inicializa la aplicación
 */
function initApp() {
  // Event listeners
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
