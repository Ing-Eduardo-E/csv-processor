import { describe, it, expect } from 'vitest';
import { normalizeColumnName, buildNormalizedLookup, findColumnMatch } from '../src/js/utils/columnNormalizer.js';
import { validateCSVStructure } from '../src/js/parsers.js';

describe('normalizeColumnName', () => {
    it('elimina tildes y convierte a mayúsculas', () => {
        expect(normalizeColumnName('FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('normaliza CÓDIGO sin tilde', () => {
        expect(normalizeColumnName('CÓDIGO CLASE DE USO'))
            .toBe('CODIGO CLASE DE USO');
    });

    it('normaliza PERÍODO sin tilde', () => {
        expect(normalizeColumnName('PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO'))
            .toBe('PAGOS DEL CLIENTE DURANTE EL PERIODO FACTURADO');
    });

    it('normaliza CÚBICOS sin tilde', () => {
        expect(normalizeColumnName('CONSUMO DEL PERÍODO EN METROS CÚBICOS'))
            .toBe('CONSUMO DEL PERIODO EN METROS CUBICOS');
    });

    it('colapsa espacios múltiples a uno solo', () => {
        expect(normalizeColumnName('FECHA  DE   EXPEDICIÓN   DE LA  FACTURA'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('elimina espacios al inicio y final (trim)', () => {
        expect(normalizeColumnName('  FECHA DE EXPEDICIÓN DE LA FACTURA  '))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('convierte minúsculas a mayúsculas', () => {
        expect(normalizeColumnName('fecha de expedición de la factura'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('convierte mixed case a mayúsculas', () => {
        expect(normalizeColumnName('Fecha De Expedición De La Factura'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('maneja columnas con números y puntos (aseo)', () => {
        expect(normalizeColumnName('9. Fecha de expedición de la factura'))
            .toBe('9. FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('elimina carácter de reemplazo U+FFFD', () => {
        expect(normalizeColumnName('FACTURACI\uFFFDO'))
            .toBe('FACTURACIO');
    });

    it('elimina múltiples U+FFFD', () => {
        expect(normalizeColumnName('D\uFFFDIRECCI\uFFFDO'))
            .toBe('DIRECCIO');
    });

    it('ya normalizada permanece igual', () => {
        expect(normalizeColumnName('VALOR TOTAL FACTURADO'))
            .toBe('VALOR TOTAL FACTURADO');
    });
});

describe('buildNormalizedLookup', () => {
    it('crea mapa con claves normalizadas y valores originales', () => {
        const columns = ['FECHA DE EXPEDICIÓN', 'CÓDIGO'];
        const lookup = buildNormalizedLookup(columns);

        expect(lookup.get('FECHA DE EXPEDICION')).toBe('FECHA DE EXPEDICIÓN');
        expect(lookup.get('CODIGO')).toBe('CÓDIGO');
    });

    it('preserva valor original con tildes', () => {
        const columns = ['FECHA DE EXPEDICIÓN DE LA FACTURA'];
        const lookup = buildNormalizedLookup(columns);

        expect(lookup.get('FECHA DE EXPEDICION DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTURA');
    });
});

describe('findColumnMatch - coincidencia exacta', () => {
    it('encuentra coincidencia exacta con tildes', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICIÓN DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTURA');
    });

    it('encuentra coincidencia sin tildes en archivo', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICION DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('encuentra coincidencia mezclando tildes', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICIÓN DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICION DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTURA');
    });

    it('retorna null si no hay coincidencia', () => {
        const lookup = buildNormalizedLookup(['OTRA COLUMNA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN')).toBeNull();
    });
});

describe('findColumnMatch - fuzzy matching por truncamiento', () => {
    it('encuentra columna truncada al final: FACTUR vs FACTURA', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICIÓN DE LA FACTUR']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTUR');
    });

    it('encuentra columna truncada: CODIGO CLASE DE US vs CODIGO CLASE DE USO', () => {
        const lookup = buildNormalizedLookup(['CÓDIGO CLASE DE US']);
        expect(findColumnMatch(lookup, 'CÓDIGO CLASE DE USO'))
            .toBe('CÓDIGO CLASE DE US');
    });

    it('encuentra columna truncada larga: PERIODO FACTURAD vs PERIODO FACTURADO', () => {
        const lookup = buildNormalizedLookup(['PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURAD']);
        expect(findColumnMatch(lookup, 'PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO'))
            .toBe('PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURAD');
    });

    it('no hace match con columna totalmente diferente', () => {
        const lookup = buildNormalizedLookup(['NUID']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA')).toBeNull();
    });

    it('encuentra columna con carácter corrupto U+FFFD', () => {
        const lookup = buildNormalizedLookup(['FECHA DE INICIO DEL PERÍODO DE FACTURACI\uFFFDO']);
        expect(findColumnMatch(lookup, 'FECHA DE INICIO DEL PERÍODO DE FACTURACIÓN'))
            .toBe('FECHA DE INICIO DEL PERÍODO DE FACTURACI\uFFFDO');
    });

    it('encuentra columna truncada con U+FFFD al final', () => {
        const lookup = buildNormalizedLookup(['DIRECCIÓN DEL PREDI\uFFFD']);
        expect(findColumnMatch(lookup, 'DIRECCIÓN DEL PREDIO'))
            .toBe('DIRECCIÓN DEL PREDI\uFFFD');
    });
});

describe('validateCSVStructure - casos de producción', () => {
    it('valida CSV real de alcantarillado con columnas truncadas por encoding', () => {
        const data = [{
            'NUID': '1',
            'NUMERO DE CUENTA CONTRATO': '1',
            'CÓDIGO DANE DEPARTAMENT': '1',
            'CÓDIGO DANE MUNICIPI': '1',
            'ZONA IGAC': '1',
            'SECTOR IGAC': '1',
            'MANZANA O VEREDA IGAC': '1',
            'NÚMERO DEL PREDIO IGA': '1',
            'CONDICION DE PROPIEDAD DEL PREDIO IGAC': '1',
            'DIRECCIÓN DEL PREDI': '1',
            'NÚMERO DE FACTUR': '1',
            'FECHA DE EXPEDICIÓN DE LA FACTUR': '01-01-2024',
            'FECHA DE INICIO DEL PERÍODO DE FACTURACI\uFFFD': '01-01-2024',
            'DIAS FACTURADOS': '30',
            'CÓDIGO CLASE DE US': '1',
            'UNIDADES MULTIUSUARIO RESIDENCIAL': '1',
            'UNIDADES MULTIUSUARIO NO RESIDENCIAL': '1',
            'HOGAR COMUNITARIO O SUSTITUTO': '1',
            'USUARIO FACTURADO CON AFORO': '0',
            'USUARIO CUENTA CON CARACTERIZACIÓ': '1',
            'CARGO FIJO': '1000',
            'CARGO POR VERTIMIENTO BASICO': '2000',
            'CARGO POR VERTIMIENTO COMPLEMENTARIO': '3000',
            'CARGO POR VERTIMIENTOSUNTUARIO': '4000',
            'CMT (COSTO MEDIO DE TASA RETRIBUTIVA)': '5000',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS': '10',
            'VALOR FACTURADO POR VERTIDO': '6000',
            'VALOR DEL SUBSIDIO': '0',
            'VALOR DE LA CONTRIBUCIÓ': '0',
            'FACTOR DE SUBSIDIO O CONTRIBUCIÓN CARGO FIJ': '1',
            'FACTOR DE SUBSIDIO O CONTRIBUCIÓN VERTIMIENT': '1',
            'CARGOS POR CONEXIÓ': '0',
            'PAGO ANTICIPADO DEL SERVICIO': '0',
            'DÍAS DE MOR': '0',
            'VALOR DE MORA': '0',
            'INTERESES POR MORA': '0',
            'OTROS COBROS': '0',
            'CAUSAL DE REFACTURACIÓ': '',
            'NUMERO DE LA FACTURA OBJETO DE REFACTURACIÓ': '',
            'VALOR TOTAL FACTURADO': '10000',
            'PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURAD': '10000'
        }];

        const result = validateCSVStructure(data, 'alcantarillado');

        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);

        expect(result.matchedColumns['FECHA DE EXPEDICIÓN DE LA FACTURA'])
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTUR');
        expect(result.matchedColumns['CÓDIGO CLASE DE USO'])
            .toBe('CÓDIGO CLASE DE US');
        expect(result.matchedColumns['PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO'])
            .toBe('PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURAD');
    });

    it('valida correctamente columnas con tildes exactas', () => {
        const data = [{
            'FECHA DE EXPEDICIÓN DE LA FACTURA': 'test',
            'CÓDIGO CLASE DE USO': 'test',
            'USUARIO FACTURADO CON AFORO': 'test',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS': 'test',
            'VALOR TOTAL FACTURADO': 'test',
            'PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('valida columnas SIN tildes en el CSV', () => {
        const data = [{
            'FECHA DE EXPEDICION DE LA FACTURA': 'test',
            'CODIGO CLASE DE USO': 'test',
            'USUARIO FACTURADO CON AFORO': 'test',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS': 'test',
            'VALOR TOTAL FACTURADO': 'test',
            'PAGOS DEL CLIENTE DURANTE EL PERIODO FACTURADO': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('valida columnas en minúsculas en el CSV', () => {
        const data = [{
            'fecha de expedicion de la factura': 'test',
            'codigo clase de uso': 'test',
            'usuario facturado con aforo': 'test',
            'vertimiento del period en metros cubicos': 'test',
            'valor total facturado': 'test',
            'pagos del cliente durante el periodo facturado': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('valida columnas con espacios extra', () => {
        const data = [{
            'FECHA  DE   EXPEDICIÓN  DE  LA  FACTURA': 'test',
            'CÓDIGO  CLASE  DE  USO': 'test',
            'USUARIO  FACTURADO  CON  AFORO': 'test',
            'VERTIMIENTO  DEL  PERIOD  EN  METROS  CUBICOS': 'test',
            'VALOR  TOTAL  FACTURADO': 'test',
            'PAGOS  DEL  CLIENTE  DURANTE  EL  PERÍODO  FACTURADO': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('detecta columnas faltantes reales', () => {
        const data = [{
            'FECHA DE EXPEDICIÓN DE LA FACTURA': 'test',
            'CÓDIGO CLASE DE USO': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(false);
        expect(result.missingColumns.length).toBeGreaterThan(0);
    });

    it('retorna error para data vacía', () => {
        const result = validateCSVStructure([], 'alcantarillado');
        expect(result.isValid).toBe(false);
        expect(result.missingColumns).toContain('No hay datos para validar');
    });

    it('retorna error para servicio inválido', () => {
        const result = validateCSVStructure([{ col: 'val' }], 'invalid');
        expect(result.isValid).toBe(false);
        expect(result.missingColumns).toContain('Tipo de servicio no válido');
    });

    it('valida acueducto con columnas sin tildes', () => {
        const data = [{
            'FECHA DE EXPEDICION DE LA FACTURA': 'test',
            'CODIGO CLASE DE USO': 'test',
            'ESTADO DE MEDIDOR': 'test',
            'CONSUMO DEL PERIODO EN METROS CUBICOS': 'test',
            'VALOR TOTAL FACTURADO': 'test',
            'PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE': 'test'
        }];
        const result = validateCSVStructure(data, 'acueducto');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('valida aseo con columnas numeradas', () => {
        const data = [{
            '9. Fecha de expedicion de la factura': 'test',
            '18. Codigo de clase o uso': 'test',
            '36. Tarifa para la actividad d e recoleccion y transporte - TRT ($ corrientes)': 'test'
        }];
        const result = validateCSVStructure(data, 'aseo');
        expect(result.isValid).toBe(true);
        expect(result.missingColumns).toHaveLength(0);
    });

    it('no confunde columnas con prefijo similar', () => {
        const data = [{
            'VALOR FACTURADO POR VERTIDO': 'test',
            'VALOR TOTAL FACTURADO': 'test',
            'VALOR DE MORA': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.isValid).toBe(false);
        expect(result.matchedColumns['VALOR TOTAL FACTURADO']).toBe('VALOR TOTAL FACTURADO');
    });
});
