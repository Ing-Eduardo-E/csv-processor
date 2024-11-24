// Funciones de utilidad para fechas
export function getMonthYear(dateStr) {
  const [, month, year] = dateStr.split('-');
  return `${month}-${year}`;
}

export function getYear(dateStr) {
  return dateStr.split('-')[2];
}

// Procesamiento de datos
export function processAndGroupData(data) {
  const groups = {};

  data.forEach(row => {
      const timeKey = getMonthYear(row['Fecha']);
      const key = `${timeKey}_${row['Clase de Uso']}`;

      if (!groups[key]) {
          groups[key] = {
              periodo: timeKey,
              claseUso: row['Clase de Uso'],
              numeroUsuarios: 0,
              medidores: new Set(),
              totalConsumo: 0,
              totalFacturado: 0,
              totalRecaudo: 0
          };
      }

      groups[key].numeroUsuarios += 1;
      groups[key].medidores.add(row['Medidor']);
      groups[key].totalConsumo += Number(row['Consumo']) || 0;
      groups[key].totalFacturado += Number(row['Total Facturado']) || 0;
      groups[key].totalRecaudo += Number(row['Total Recaudo']) || 0;
  });

  return transformGroupsToArray(groups);
}

function transformGroupsToArray(groups) {
  return Object.values(groups).map(group => ({
      periodo: group.periodo,
      claseUso: group.claseUso,
      numeroUsuarios: group.numeroUsuarios,
      numeroMedidores: group.medidores.size,
      totalConsumo: Math.round(group.totalConsumo * 100) / 100,
      totalFacturado: Math.round(group.totalFacturado * 100) / 100,
      totalRecaudo: Math.round(group.totalRecaudo * 100) / 100
  })).sort((a, b) => {
      const periodoComparison = a.periodo.localeCompare(b.periodo);
      return periodoComparison !== 0 ? periodoComparison : Number(a.claseUso) - Number(b.claseUso);
  });
}