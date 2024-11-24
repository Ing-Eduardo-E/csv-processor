export function createPaginationControls(totalRows, currentPage, rowsPerPage, onPageChange) {
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const container = document.querySelector('.pagination');
  container.innerHTML = '';

  const controls = {
      prev: createButton('Anterior', currentPage > 1, () => onPageChange(currentPage - 1)),
      info: createPageInfo(currentPage, totalPages),
      next: createButton('Siguiente', currentPage < totalPages, () => onPageChange(currentPage + 1))
  };

  Object.values(controls).forEach(control => container.appendChild(control));
}

function createButton(text, enabled, onClick) {
  const button = document.createElement('button');
  button.innerText = text;
  button.classList.add('pagination-btn');
  button.disabled = !enabled;
  if (enabled) button.onclick = onClick;
  return button;
}

function createPageInfo(currentPage, totalPages) {
  const span = document.createElement('span');
  span.innerText = `Página ${currentPage} de ${totalPages}`;
  span.classList.add('page-info');
  return span;
}