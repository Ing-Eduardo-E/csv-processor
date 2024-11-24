export function displayFilteredData(filteredData, currentPage, rowsPerPage, tableElement) {
  const tbody = tableElement.querySelector('tbody');
  tbody.innerHTML = '';

  updateTableHeaders(tableElement);
  
  const paginatedData = getPaginatedData(filteredData, currentPage, rowsPerPage);
  renderTableRows(paginatedData, tbody);

  return filteredData.length; // Retorna el total de filas para la paginación
}

function updateTableHeaders(tableElement) {
  const headerRow = tableElement.querySelector('thead tr');
  headerRow.innerHTML = `
      <th>Periodo</th>
      <th>Clase de Uso</th>
      <th>Usuarios</th>
      <th>Medidores</th>
      <th>Total Consumo</th>
      <th>Total Facturado</th>
      <th>Total Recaudo</th>
  `;
}

function getPaginatedData(data, currentPage, rowsPerPage) {
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  return data.slice(start, end);
}

function renderTableRows(data, tbody) {
  data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${row.periodo}</td>
          <td>${row.claseUso}</td>
          <td>${row.numeroUsuarios}</td>
          <td>${row.numeroMedidores}</td>
          <td>${row.totalConsumo.toFixed(2)}</td>
          <td>${row.totalFacturado.toFixed(2)}</td>
          <td>${row.totalRecaudo.toFixed(2)}</td>
      `;
      tbody.appendChild(tr);
  });
}