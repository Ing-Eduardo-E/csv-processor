import { exportData } from "./js/export.js";
import { MAX_FILE_SIZE, VALID_MIME_TYPES, ROWS_PER_PAGE, SERVICE_CONFIGS, SERVICE_TYPES } from "./js/config.js";
import { parseCSV, parseExcel, validateCSVStructure, parseRawCSV, parseRawExcel } from "./js/parsers.js";
import { filterDataByReportType } from "./js/dataProcessing.js";
import { displayFilteredData } from "./js/ui.js";
import { createPaginationControls } from "./js/pagination.js";

let state = {
  parsedData: null,
  processedData: null,
  currentPage: 1,
  currentReportType: "monthly",
  currentServiceType: SERVICE_TYPES.ACUEDUCTO,
};

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

function updateFormatGuide(serviceType) {
  const config = SERVICE_CONFIGS[serviceType];
  if (!config) return;

  if (elements.serviceFileNote) {
    elements.serviceFileNote.textContent = `Archivo completo del sistema de ${config.name} (todas las columnas)`;
  }

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

function handleServiceTypeChange(event) {
  state.currentServiceType = event.target.value;
  updateFormatGuide(state.currentServiceType);

  if (state.parsedData) {
    state.parsedData = null;
    elements.fileInput.value = "";
    elements.previewSection.classList.add("hidden");
    elements.processingSection.classList.add("hidden");
  }
}

function handleExport(format = "xlsx") {
  if (!state.parsedData) {
    alert("No hay datos para exportar");
    return;
  }

  try {
    const filteredData = filterDataByReportType(
      state.parsedData,
      state.currentReportType,
      state.currentServiceType
    );
    exportData(filteredData, state.currentReportType, format, state.currentServiceType);
  } catch (error) {
    console.error("Error al exportar:", error);
    alert("Error al exportar los datos");
  }
}

function updateReportView(reportType) {
  if (!state.parsedData) {
    console.error("No hay datos para mostrar");
    return;
  }

  try {
    const filteredData = filterDataByReportType(state.parsedData, reportType, state.currentServiceType);
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
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    const rawData = isExcel ? await parseRawExcel(file) : await parseRawCSV(file);

    const validation = validateCSVStructure(rawData, state.currentServiceType);
    if (!validation.isValid) {
      const config = SERVICE_CONFIGS[state.currentServiceType];
      const missingList = validation.missingColumns.map(
        col => `  • ${col}`
      ).join('\n');

      let suggestion = '';
      if (validation.availableColumns.length > 0) {
        const partialMatches = validation.missingColumns.map(missing => {
          const missingNorm = missing.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
          const candidates = validation.availableColumns.filter(avail => {
            const availNorm = avail.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
            return availNorm.includes(missingNorm.substring(0, 10)) || missingNorm.includes(availNorm.substring(0, 10));
          });
          if (candidates.length > 0) {
            return `  "${missing}" → ¿Quiso decir: "${candidates.join('", "')}"?`;
          }
          return null;
        }).filter(Boolean);

        if (partialMatches.length > 0) {
          suggestion = '\n\nPosibles coincidencias:\n' + partialMatches.join('\n');
        }
      }

      throw new Error(
        `El archivo no contiene las columnas requeridas para ${config.name}.\n\nColumnas faltantes:\n${missingList}${suggestion}\n\nColumnas encontradas en el archivo: ${validation.availableColumns.length}`
      );
    }

    state.parsedData = isExcel
      ? await parseExcel(file, state.currentServiceType)
      : await parseCSV(file, state.currentServiceType);

    state.currentPage = 1;
    state.currentReportType = "monthly";

    updateReportView(state.currentReportType);

    elements.previewSection.classList.remove("hidden");
    elements.processingSection.classList.remove("hidden");
  } catch (error) {
    console.error("Error:", error);
    alert(error.message || "Error al procesar el archivo.");
    elements.fileInput.value = "";
  }
}

function initApp() {
  updateFormatGuide(state.currentServiceType);

  elements.serviceTypeSelect.addEventListener("change", handleServiceTypeChange);
  elements.fileInput.addEventListener("change", handleFileUpload);
  elements.reportTypeSelect.addEventListener("change", (e) => {
    state.currentReportType = e.target.value;
    state.currentPage = 1;
    updateReportView(state.currentReportType);
  });

  const processBtn = document.getElementById("processBtn");
  processBtn.addEventListener("click", () => {
    handleExport("xlsx");
  });
}

document.addEventListener("DOMContentLoaded", initApp);
