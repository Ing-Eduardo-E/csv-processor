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

    it('maneja columna compleja de aseo con "d e"', () => {
        expect(normalizeColumnName('36. Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)'))
            .toBe('36. TARIFA PARA LA ACTIVIDAD D E RECOLECCION Y TRANSPORTE - TRT ($ CORRIENTES)');
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

describe('findColumnMatch', () => {
    it('encuentra coincidencia exacta con tildes', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICIÓN DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTURA');
    });

    it('encuentra coincidencia sin tildes', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICION DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
    });

    it('encuentra coincidencia mezclando tildes en archivo vs config', () => {
        const lookup = buildNormalizedLookup(['FECHA DE EXPEDICIÓN DE LA FACTURA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICION DE LA FACTURA'))
            .toBe('FECHA DE EXPEDICIÓN DE LA FACTURA');
    });

    it('retorna null si no hay coincidencia', () => {
        const lookup = buildNormalizedLookup(['OTRA COLUMNA']);
        expect(findColumnMatch(lookup, 'FECHA DE EXPEDICIÓN')).toBeNull();
    });
});

describe('validateCSVStructure', () => {
    const ALCANTARILLADO_REQUIRED = [
        "FECHA DE EXPEDICIÓN DE LA FACTURA",
        "CÓDIGO CLASE DE USO",
        "USUARIO FACTURADO CON AFORO",
        "VERTIMIENTO DEL PERIOD EN METROS CUBICOS",
        "VALOR TOTAL FACTURADO",
        "PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO"
    ];

    function makeAlcantarilladoRow(overrides = {}) {
        const row = {};
        for (const col of ALCANTARILLADO_REQUIRED) {
            row[col] = 'test';
        }
        return { ...row, ...overrides };
    }

    it('valida correctamente columnas con tildes exactas', () => {
        const data = [makeAlcantarilladoRow()];
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

    it('valida columnas con espacios extra en el CSV', () => {
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

    it('retorna matchedColumns con mapeo correcto', () => {
        const data = [{
            'FECHA DE EXPEDICION DE LA FACTURA': 'test',
            'CODIGO CLASE DE USO': 'test',
            'USUARIO FACTURADO CON AFORO': 'test',
            'VERTIMIENTO DEL PERIOD EN METROS CUBICOS': 'test',
            'VALOR TOTAL FACTURADO': 'test',
            'PAGOS DEL CLIENTE DURANTE EL PERIODO FACTURADO': 'test'
        }];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.matchedColumns['FECHA DE EXPEDICIÓN DE LA FACTURA'])
            .toBe('FECHA DE EXPEDICION DE LA FACTURA');
        expect(result.matchedColumns['CÓDIGO CLASE DE USO'])
            .toBe('CODIGO CLASE DE USO');
    });

    it('retorna availableColumns', () => {
        const data = [makeAlcantarilladoRow()];
        const result = validateCSVStructure(data, 'alcantarillado');
        expect(result.availableColumns.length).toBeGreaterThanOrEqual(6);
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
});
