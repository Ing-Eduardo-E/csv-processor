import { SERVICE_TYPES } from './config.js';

export function getMonthYear(dateStr) {
  const [, month, year] = dateStr.split('-');
  return `${month}-${year}`;
}

export function getYear(dateStr) {
  return dateStr.split('-')[2];
}

export function getMonthFromDate(dateStr) {
  return dateStr.split("-")[1];
}

export function filterDataByReportType(data, reportType, serviceType) {
  if (serviceType === SERVICE_TYPES.ASEO) {
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
      if (!monthlyTracking[key]) {
        monthlyTracking[key] = {
          usuariosPorMes: {},
          medidoresPorMes: {},
        };
      }

      const month = getMonthFromDate(row["Fecha"]);

      if (!monthlyTracking[key].usuariosPorMes[month]) {
        monthlyTracking[key].usuariosPorMes[month] = 0;
        monthlyTracking[key].medidoresPorMes[month] = 0;
      }

      monthlyTracking[key].usuariosPorMes[month]++;
      if (medidor === 1) {
        monthlyTracking[key].medidoresPorMes[month]++;
      }
    }

    if (!groups[key]) {
      groups[key] = {
        periodo: timeKey,
        claseUso: row["Clase de Uso"],
        numeroUsuarios: 0,
        numeroMedidores: 0,
        totalConsumo: 0,
        totalFacturado: 0,
        totalRecaudo: 0,
      };
    }

    groups[key].numeroUsuarios++;
    if (medidor === 1) {
      groups[key].numeroMedidores++;
    }

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
        const mesesConRegistros = Object.keys(
          monthlyTracking[key].usuariosPorMes
        ).length;

        const totalUsuarios = Object.values(
          monthlyTracking[key].usuariosPorMes
        ).reduce((sum, count) => sum + count, 0);

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

function filterAseoData(data, reportType) {
  const groups = {};
  const tarifasPorEstrato = {};

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

    groups[key].numeroUsuarios++;

    const tarifa = Number(row["Tarifa"]) || 0;
    if (tarifa > 0) {
      tarifasPorEstrato[key].push(tarifa);
    }
  });

  return Object.values(groups)
    .map((group) => {
      const key = `${group.periodo}_${group.claseUso}`;

      if (tarifasPorEstrato[key] && tarifasPorEstrato[key].length > 0) {
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
