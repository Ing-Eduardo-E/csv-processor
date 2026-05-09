function formatDate(dateStr) {
    if (!dateStr) return '';

    dateStr = dateStr.trim();

    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${day}-${month}-${year}`;
    }

    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/.test(dateStr)) {
        const parts = dateStr.split(/[-/]/);
        const year = parts[0];
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        return `${day}-${month}-${year}`;
    }

    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        }
    } catch (e) {
        return dateStr;
    }

    return dateStr;
}

function convertMedidorState(estado) {
    if (!estado && estado !== 0) return 0;

    const numValue = Number(estado);
    if (!isNaN(numValue)) {
        return numValue === 1 ? 1 : 0;
    }

    const estadoUpper = String(estado).toUpperCase().trim();
    if (estadoUpper === 'INSTALADO' || (estadoUpper.includes('INSTALADO') && !estadoUpper.includes('NO'))) {
        return 1;
    }
    return 0;
}

function convertAforoState(aforo) {
    if (!aforo) return 0;
    const aforoUpper = String(aforo).toUpperCase().trim();
    if (aforoUpper === 'SI' || aforoUpper === 'SÍ' || aforoUpper === 'S' || aforoUpper === '1') {
        return 1;
    }
    return 0;
}

function convertVertidoState(valor) {
    if (!valor) return 0;
    const num = parseNumber(valor);
    return num > 0 ? 1 : 0;
}

function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    let str = String(value).trim();
    str = str.replace(/[$\s]/g, '');

    if (str.includes(',') && str.includes('.')) {
        str = str.replace(/,/g, '');
    }
    else if (str.includes('.') && str.includes(',')) {
        str = str.replace(/\./g, '').replace(',', '.');
    }
    else if (str.includes(',') && !str.includes('.')) {
        const parts = str.split(',');
        if (parts.length === 2 && parts[1].length <= 2) {
            str = str.replace(',', '.');
        } else {
            str = str.replace(/,/g, '');
        }
    }

    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
}

export const sharedTransformers = {
    formatDate,
    convertMedidorState,
    convertAforoState,
    convertVertidoState,
    parseNumber
};
