import acueductoTransformer from './acueductoTransformer.js';
import alcantarilladoTransformer from './alcantarilladoTransformer.js';
import aseoTransformer from './aseoTransformer.js';

const registry = {
    acueducto: acueductoTransformer,
    alcantarillado: alcantarilladoTransformer,
    aseo: aseoTransformer
};

export function getTransformer(serviceType) {
    const transformer = registry[serviceType];
    if (!transformer) {
        throw new Error(`Transformador no encontrado para servicio: ${serviceType}`);
    }
    return transformer;
}
