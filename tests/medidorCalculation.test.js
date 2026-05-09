import { describe, it, expect } from 'vitest';
import { filterDataByReportType } from '../src/js/dataProcessing.js';
import { sharedTransformers } from '../src/js/transformers/shared.js';

const { convertMedidorState } = sharedTransformers;

describe('convertMedidorState', () => {
    it('retorna 1 cuando el valor es 1 (medidor instalado y funcionando)', () => {
        expect(convertMedidorState(1)).toBe(1);
        expect(convertMedidorState('1')).toBe(1);
    });

    it('retorna 0 cuando el valor es 2', () => {
        expect(convertMedidorState(2)).toBe(0);
        expect(convertMedidorState('2')).toBe(0);
    });

    it('retorna 0 cuando el valor es 3', () => {
        expect(convertMedidorState(3)).toBe(0);
        expect(convertMedidorState('3')).toBe(0);
    });

    it('retorna 1 para "INSTALADO" (texto, compatibilidad)', () => {
        expect(convertMedidorState('INSTALADO')).toBe(1);
    });

    it('retorna 0 para "NO INSTALADO" (texto, compatibilidad)', () => {
        expect(convertMedidorState('NO INSTALADO')).toBe(0);
    });

    it('retorna 0 para vacío o null', () => {
        expect(convertMedidorState('')).toBe(0);
        expect(convertMedidorState(null)).toBe(0);
        expect(convertMedidorState(undefined)).toBe(0);
    });
});

describe('Cálculo de medidores por estrato en reporte de acueducto', () => {
    function makeAcueductoRow(claseUso, medidor, fecha = '01-01-2024') {
        return {
            'Fecha': fecha,
            'Clase de Uso': String(claseUso),
            'Medidor': medidor,
            'Consumo': 10,
            'Total Facturado': 5000,
            'Total Recaudo': 4500
        };
    }

    it('suma correctamente medidores con valor 1 por estrato', () => {
        const data = [
            makeAcueductoRow(1, 1),
            makeAcueductoRow(1, 1),
            makeAcueductoRow(1, 2),
            makeAcueductoRow(1, 3),
            makeAcueductoRow(2, 1),
            makeAcueductoRow(2, 2),
            makeAcueductoRow(2, 3),
            makeAcueductoRow(2, 3),
        ];

        const result = filterDataByReportType(data, 'monthly', 'acueducto');

        const estrato1 = result.find(r => r.claseUso === '1');
        const estrato2 = result.find(r => r.claseUso === '2');

        expect(estrato1.numeroMedidores).toBe(2);
        expect(estrato1.numeroUsuarios).toBe(4);

        expect(estrato2.numeroMedidores).toBe(1);
        expect(estrato2.numeroUsuarios).toBe(4);
    });

    it('retorna 0 medidores cuando ningún usuario tiene estado 1', () => {
        const data = [
            makeAcueductoRow(1, 2),
            makeAcueductoRow(1, 3),
            makeAcueductoRow(1, 3),
        ];

        const result = filterDataByReportType(data, 'monthly', 'acueducto');
        const estrato1 = result.find(r => r.claseUso === '1');

        expect(estrato1.numeroMedidores).toBe(0);
        expect(estrato1.numeroUsuarios).toBe(3);
    });

    it('todos tienen medidor (valor 1)', () => {
        const data = [
            makeAcueductoRow(3, 1),
            makeAcueductoRow(3, 1),
            makeAcueductoRow(3, 1),
        ];

        const result = filterDataByReportType(data, 'monthly', 'acueducto');
        const estrato3 = result.find(r => r.claseUso === '3');

        expect(estrato3.numeroMedidores).toBe(3);
        expect(estrato3.numeroUsuarios).toBe(3);
    });

    it('reporte anual promedia medidores por mes', () => {
        const data = [
            makeAcueductoRow(1, 1, '01-01-2024'),
            makeAcueductoRow(1, 1, '01-01-2024'),
            makeAcueductoRow(1, 2, '01-01-2024'),
            makeAcueductoRow(1, 1, '01-02-2024'),
            makeAcueductoRow(1, 3, '01-02-2024'),
        ];

        const result = filterDataByReportType(data, 'annual', 'acueducto');
        const estrato1 = result.find(r => r.claseUso === '1');

        expect(estrato1.numeroMedidores).toBe(2);
        expect(estrato1.numeroUsuarios).toBe(3);
    });

    it('medidores con valor string "1" también se cuentan', () => {
        const data = [
            { 'Fecha': '01-01-2024', 'Clase de Uso': '1', 'Medidor': '1', 'Consumo': 10, 'Total Facturado': 5000, 'Total Recaudo': 4500 },
            { 'Fecha': '01-01-2024', 'Clase de Uso': '1', 'Medidor': '2', 'Consumo': 10, 'Total Facturado': 5000, 'Total Recaudo': 4500 },
        ];

        const result = filterDataByReportType(data, 'monthly', 'acueducto');
        const estrato1 = result.find(r => r.claseUso === '1');

        expect(estrato1.numeroMedidores).toBe(1);
        expect(estrato1.numeroUsuarios).toBe(2);
    });
});
