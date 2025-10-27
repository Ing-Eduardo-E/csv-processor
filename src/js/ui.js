export function displayFilteredData(filteredData, currentPage, rowsPerPage, tableElement, serviceType = 'acueducto') {
  const tbody = tableElement.querySelector('tbody');
  tbody.innerHTML = '';

  updateTableHeaders(tableElement, serviceType);
  
  const paginatedData = getPaginatedData(filteredData, currentPage, rowsPerPage);
  renderTableRows(paginatedData, tbody, serviceType);

  return filteredData.length; // Retorna el total de filas para la paginación
}

function updateTableHeaders(tableElement, serviceType) {
  const headerRow = tableElement.querySelector('thead tr');
  
  if (serviceType === 'aseo') {
    headerRow.innerHTML = `
        <th>Periodo</th>
        <th>Estrato</th>
        <th>Usuarios</th>
        <th>Tarifa ($)</th>
    `;
  } else {
    headerRow.innerHTML = `
        <th>Periodo</th>
        <th>Clase de Uso</th>
        <th>Usuarios</th>
        <th>Medidores/Aforo</th>
        <th>Total Consumo/Vertimiento</th>
        <th>Total Facturado</th>
        <th>Total Recaudo</th>
    `;
  }
}

function getPaginatedData(data, currentPage, rowsPerPage) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
}

function renderTableRows(data, tbody, serviceType) {
  data.forEach(row => {
      const tr = document.createElement('tr');
      
      if (serviceType === 'aseo') {
        tr.innerHTML = `
            <td>${row.periodo}</td>
            <td>${row.claseUso}</td>
            <td>${row.numeroUsuarios}</td>
            <td>$${row.tarifa.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
        `;
      } else {
        tr.innerHTML = `
            <td>${row.periodo}</td>
            <td>${row.claseUso}</td>
            <td>${row.numeroUsuarios}</td>
            <td>${row.numeroMedidores}</td>
            <td>${row.totalConsumo.toFixed(2)}</td>
            <td>${row.totalFacturado.toFixed(2)}</td>
            <td>${row.totalRecaudo.toFixed(2)}</td>
        `;
      }
      
      tbody.appendChild(tr);
  });
}