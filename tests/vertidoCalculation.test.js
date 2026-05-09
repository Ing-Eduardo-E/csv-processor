import { describe, it, expect } from 'vitest';
import { sharedTransformers } from '../src/js/transformers/shared.js';
import { filterDataByReportType } from '../src/js/dataProcessing.js';

const { convertVertidoState } = sharedTransformers;

describe('convertVertidoState', () => {
    it('retorna 1 cuando el valor es mayor a 0', () => {
        expect(convertVertidoState(5000)).toBe(1);
        expect(convertVertidoState('5000')).toBe(1);
        expect(convertVertidoState('5.000')).toBe(1);
        expect(convertVertidoState(0.01)).toBe(1);
    });

    it('retorna 0 cuando el valor es 0', () => {
        expect(convertVertidoState(0)).toBe(0);
        expect(convertVertidoState('0')).toBe(0);
    });

    it('retorna 0 para vacío, null o undefined', () => {
        expect(convertVertidoState('')).toBe(0);
        expect(convertVertidoState(null)).toBe(0);
        expect(convertVertidoState(undefined)).toBe(0);
    });

    it('retorna 0 para texto no numérico', () => {
        expect(convertVertidoState('N/A')).toBe(0);
    });
});

describe('Cálculo de medidores por vertido en alcantarillado', () => {
    function makeAlcantarilladoRow(claseUso, vertido, fecha = '01-01-2024') {
        return {
            'Fecha': fecha,
            'Clase de Uso': String(claseUso),
            'Medidor': vertido > 0 ? 1 : 0,
            'Consumo': 10,
            'Total Facturado': 5000,
            'Total Recaudo': 4500
        };
    }

    it('suma como medidor usuarios con VALOR FACTURADO POR VERTIDO > 0', () => {
        const data = [
            makeAlcantarilladoRow(1, 5000),
            makeAlcantarilladoRow(1, 3000),
            makeAlcantarilladoRow(1, 0),
            makeAlcantarilladoRow(1, 0),
            makeAlcantarilladoRow(2, 8000),
            makeAlcantarilladoRow(2, 0),
            makeAlcantarilladoRow(2, 0),
            makeAlcantarilladoRow(2, 0),
        ];

        const result = filterDataByReportType(data, 'monthly', 'alcantarillado');

        const estrato1 = result.find(r => r.claseUso === '1');
        const estrato2 = result.find(r => r.claseUso === '2');

        expect(estrato1.numeroMedidores).toBe(2);
        expect(estrato1.numeroUsuarios).toBe(4);

        expect(estrato2.numeroMedidores).toBe(1);
        expect(estrato2.numeroUsuarios).toBe(4);
    });

    it('retorna 0 medidores cuando todos tienen vertido en 0', () => {
        const data = [
            makeAlcantarilladoRow(1, 0),
            makeAlcantarilladoRow(1, 0),
            makeAlcantarilladoRow(1, 0),
        ];

        const result = filterDataByReportType(data, 'monthly', 'alcantarillado');
        const estrato1 = result.find(r => r.claseUso === '1');

        expect(estrato1.numeroMedidores).toBe(0);
        expect(estrato1.numeroUsuarios).toBe(3);
    });

    it('todos tienen micromedidor (vertido > 0)', () => {
        const data = [
            makeAlcantarilladoRow(3, 12000),
            makeAlcantarilladoRow(3, 8500),
            makeAlcantarilladoRow(3, 3200),
        ];

        const result = filterDataByReportType(data, 'monthly', 'alcantarillado');
        const estrato3 = result.find(r => r.claseUso === '3');

        expect(estrato3.numeroMedidores).toBe(3);
        expect(estrato3.numeroUsuarios).toBe(3);
    });

    it('reporte anual promedia medidores por mes', () => {
        const data = [
            makeAlcantarilladoRow(1, 5000, '01-01-2024'),
            makeAlcantarilladoRow(1, 3000, '01-01-2024'),
            makeAlcantarilladoRow(1, 0, '01-01-2024'),
            makeAlcantarilladoRow(1, 4000, '01-02-2024'),
            makeAlcantarilladoRow(1, 0, '01-02-2024'),
        ];

        const result = filterDataByReportType(data, 'annual', 'alcantarillado');
        const estrato1 = result.find(r => r.claseUso === '1');

        expect(estrato1.numeroMedidores).toBe(2);
        expect(estrato1.numeroUsuarios).toBe(3);
    });

    it('mezcla de estratos con diferentes niveles de micromedición', () => {
        const data = [
            makeAlcantarilladoRow(1, 0),
            makeAlcantarilladoRow(1, 5000),
            makeAlcantarilladoRow(2, 8000),
            makeAlcantarilladoRow(2, 8000),
            makeAlcantarilladoRow(2, 8000),
            makeAlcantarilladoRow(3, 0),
            makeAlcantarilladoRow(3, 0),
        ];

        const result = filterDataByReportType(data, 'monthly', 'alcantarillado');

        const estrato1 = result.find(r => r.claseUso === '1');
        const estrato2 = result.find(r => r.claseUso === '2');
        const estrato3 = result.find(r => r.claseUso === '3');

        expect(estrato1.numeroMedidores).toBe(1);
        expect(estrato2.numeroMedidores).toBe(3);
        expect(estrato3.numeroMedidores).toBe(0);
    });
});
