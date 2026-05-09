# CSV Processor

Procesador de archivos CSV y Excel para servicios públicos (Acueducto, Alcantarillado, Aseo). Parsea, transforma, agrupa y exporta datos por tipo de servicio y periodo.

## Stack

- **Runtime**: Vanilla JS (ES Modules)
- **Build**: Vite 5.4
- **Dependencias**: `papaparse` (CSV), `xlsx` (Excel)
- **Deploy**: Netlify

## Arquitectura

```
src/
├── main.js                          # Entry point — state + event listeners
├── style.css                        # Estilos globales
└── js/
    ├── config.js                    # Configuración centralizada
    ├── parsers.js                   # Parseo + validación (gateway de datos)
    ├── dataProcessing.js            # Agrupación y filtrado por reporte
    ├── export.js                    # Exportación XLSX/CSV
    ├── ui.js                        # Renderizado de tabla HTML
    ├── pagination.js                # Controles de paginación
    └── transformers/
        ├── transformerRegistry.js   # Strategy Pattern dispatcher
        ├── shared.js                # Funciones de transformación reutilizables
        ├── acueductoTransformer.js  # Transformador servicio Acueducto
        ├── alcantarilladoTransformer.js  # Transformador servicio Alcantarillado
        └── aseoTransformer.js       # Transformador servicio Aseo
```

## Pipeline de Datos

```
Archivo (CSV/Excel)
    ↓
parsers.js — parsea archivo crudo
    ↓
parsers.js — valida estructura (columnas requeridas)
    ↓
parsers.js → transformerRegistry → {servicio}Transformer — transforma columnas
    ↓
dataProcessing.js — agrupa por periodo (mensual/anual) y clase de uso
    ↓
ui.js — renderiza tabla HTML con paginación
    ↓
export.js — exporta resultado a XLSX o CSV
```

## Roles de Módulos

| Módulo | Responsabilidad | Imports |
|---|---|---|
| `main.js` | Inicialización, estado global, event listeners | config, parsers, dataProcessing, ui, pagination, export |
| `config.js` | Constantes, mapeos de columnas, tipos de servicio | — |
| `parsers.js` | Parseo CSV/Excel, validación de estructura | papaparse, xlsx, config, transformerRegistry |
| `dataProcessing.js` | Agrupación por periodo, filtrado por servicio | config |
| `transformers/` | Strategy Pattern para transformación de columnas | shared.js |
| `export.js` | Exportación a XLSX y CSV | xlsx |
| `ui.js` | Renderizado de tabla HTML | — |
| `pagination.js` | Controles de paginación | — |

## Cómo Agregar un Nuevo Servicio

1. **Crear transformer**: `src/js/transformers/nuevoServicioTransformer.js`

```js
import { sharedTransformers as st } from './shared.js';

const DATE_COLUMNS = new Set(["columna_fecha_original"]);
const NUMBER_COLUMNS = new Set(["columna_numero_original"]);

const nuevoServicioTransformer = {
    transform(columnName, value) {
        if (value === null || value === undefined || value === '') {
            return DATE_COLUMNS.has(columnName) ? '' : 0;
        }
        if (DATE_COLUMNS.has(columnName)) return st.formatDate(value);
        if (NUMBER_COLUMNS.has(columnName)) return Number(value) || 0;
        return value;
    }
};

export default nuevoServicioTransformer;
```

2. **Registrar en transformerRegistry.js**:

```js
import nuevoServicioTransformer from './nuevoServicioTransformer.js';

const registry = {
    // ...existentes
    'nuevo_servicio': nuevoServicioTransformer
};
```

3. **Agregar configuración en config.js**:

```js
export const NUEVO_SERVICIO_CONFIG = {
    name: 'Nuevo Servicio',
    columnMapping: { "columna_original": "columna_interna" },
    requiredColumns: [...],
    displayColumns: [...]
};
```

4. **Agregar tipo en SERVICE_TYPES y SERVICE_CONFIGS**.

5. **Opcional**: Agregar lógica de agrupación específica en `dataProcessing.js`.

## Comandos

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
```

## Estructura de Archivos Esperada

### Acueducto / Alcantarillado
- CSV o XLSX con columnas específicas del servicio
- Columnas mínimas: Fecha, Clase de Uso, Medidor/Aforo, Consumo/Vertimiento, Facturado, Recaudo

### Aseo
- CSV o XLSX con columnas numeradas
- Columnas mínimas: Fecha, Clase de Uso, Tarifa TRT
