```markdown
# Procesador de Archivos CSV/Excel - Reporte de Consumos

Esta aplicación web permite procesar archivos CSV o Excel con información de servicios públicos (Acueducto, Alcantarillado y Aseo), generando reportes consolidados mensuales y anuales.

## Características

- Soporte para múltiples tipos de servicio (Acueducto, Alcantarillado, Aseo)
- Carga y validación de archivos CSV o Excel (.xlsx) con mapeo automático de columnas
- Procesamiento de hasta 200,000 registros
- Visualización de datos con paginación
- Reportes mensuales y anuales
- Exportación a Excel o CSV
- Interfaz intuitiva y responsiva

## Tipos de Servicio Soportados

### 1. Acueducto
Procesa archivos del sistema de facturación de acueducto.

**Columnas requeridas:**
- FECHA DE EXPEDICIÓN DE LA FACTURA
- CÓDIGO CLASE DE USO
- ESTADO DE MEDIDOR
- CONSUMO DEL PERÍODO EN METROS CÚBICOS
- VALOR TOTAL FACTURADO
- PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE

### 2. Alcantarillado
Procesa archivos del sistema de facturación de alcantarillado.

**Columnas requeridas:**
- FECHA DE EXPEDICIÓN DE LA FACTURA
- CÓDIGO CLASE DE USO
- USUARIO FACTURADO CON AFORO
- VERTIMIENTO DEL PERIOD EN METROS CUBICOS
- VALOR TOTAL FACTURADO
- PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO

### 3. Aseo
Procesa archivos del sistema de facturación de aseo.

**Columnas requeridas:**
- Fecha de expedición de la factura
- Código de clase o uso
- Tarifa para la actividad d e recolección y transporte - TRT ($ corrientes)

**Nota**: Para el servicio de Aseo solo se requiere el número de usuarios por estrato y la tarifa cobrada.

## Requisitos del Archivo

### Especificaciones Generales
- Formato: CSV (valores separados por comas) o Excel (.xlsx)
- Codificación: UTF-8 (para archivos CSV)
- Tamaño máximo: 25MB
- Límite de filas: 200,000
- El archivo puede contener todas las columnas del sistema original
- La aplicación extrae y procesa automáticamente solo las columnas necesarias

**Límites y Recomendaciones:**
- El límite de 25MB permite procesar archivos con aproximadamente:
  - **CSV**: Hasta 150,000-200,000 registros (dependiendo del número de columnas)
  - **Excel**: Hasta 100,000-150,000 registros (archivos .xlsx son más pesados)
- Para archivos muy grandes (>20MB), se recomienda usar formato CSV en lugar de Excel para mejor rendimiento
- El procesamiento se realiza completamente en el navegador sin enviar datos a ningún servidor
- Navegadores modernos pueden manejar estos tamaños sin problemas en equipos con al menos 4GB de RAM

### Servicio de Acueducto
**Columnas requeridas del sistema:**
- **FECHA DE EXPEDICIÓN DE LA FACTURA**: Fecha de emisión de la factura
- **CÓDIGO CLASE DE USO**: Clasificación del usuario (valor numérico)
- **ESTADO DE MEDIDOR**: Estado del medidor (INSTALADO, NO INSTALADO, etc.)
- **CONSUMO DEL PERÍODO EN METROS CÚBICOS**: Consumo medido en m³
- **VALOR TOTAL FACTURADO**: Total facturado al usuario
- **PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE**: Recaudos del período

### Servicio de Alcantarillado
**Columnas requeridas del sistema:**
- **FECHA DE EXPEDICIÓN DE LA FACTURA**: Fecha de emisión de la factura
- **CÓDIGO CLASE DE USO**: Clasificación del usuario (valor numérico)
- **USUARIO FACTURADO CON AFORO**: Indica si tiene aforo individual (SI/NO)
- **VERTIMIENTO DEL PERIOD EN METROS CUBICOS**: Vertimiento medido en m³
- **VALOR TOTAL FACTURADO**: Total facturado al usuario
- **PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO**: Recaudos del período

## Funcionalidades

### Reportes Mensuales
- Agrupa datos por mes y clase de uso
- Muestra total de usuarios por clase
- Cuenta medidores activos
- Suma consumos, facturación y recaudo

### Reportes Anuales
- Agrupa datos por año y clase de uso
- Calcula promedio de usuarios por clase
- Calcula promedio de medidores activos
- Suma total de consumos, facturación y recaudo

### Exportación
- Formato Excel (.xlsx)
- Formato CSV
- Mantiene el mismo formato de la visualización
- Incluye todos los datos del período seleccionado

## Tecnologías Utilizadas

- Vite
- JavaScript vanilla
- PapaParse (procesamiento CSV)
- XLSX (exportación Excel)
- CSS personalizado

## Instalación y Desarrollo Local

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar servidor de desarrollo:
```bash
npm run dev
```

4. Construir para producción:
```bash
npm run build
```

## Estructura del Proyecto

```
proyecto/
├── src/
│   ├── js/
│   │   ├── config.js
│   │   ├── parsers.js
│   │   ├── dataProcessing.js
│   │   ├── ui.js
│   │   ├── pagination.js
│   │   └── export.js
│   ├── style.css
│   └── main.js
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## Uso

1. Abrir la aplicación en el navegador
2. Seleccionar el tipo de servicio (Acueducto, Alcantarillado o Aseo)
3. Exportar el archivo completo desde el sistema de facturación correspondiente (formato CSV o Excel)
4. Cargar el archivo en la aplicación (no requiere modificaciones previas)
5. Verificar los datos transformados en la vista previa
6. Seleccionar el tipo de reporte (mensual o anual)
7. Usar los controles de paginación para navegar por los datos
8. Hacer clic en "Procesar y Descargar" para exportar el reporte

## Características Técnicas

### Mapeo Automático de Columnas por Servicio

#### Acueducto
- **FECHA DE EXPEDICIÓN DE LA FACTURA** → Fecha normalizada
- **CÓDIGO CLASE DE USO** → Clase de Uso
- **ESTADO DE MEDIDOR** → Medidor (1/0)
- **CONSUMO DEL PERÍODO EN METROS CÚBICOS** → Consumo
- **VALOR TOTAL FACTURADO** → Total Facturado
- **PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE** → Total Recaudo

#### Alcantarillado
- **FECHA DE EXPEDICIÓN DE LA FACTURA** → Fecha normalizada
- **CÓDIGO CLASE DE USO** → Clase de Uso
- **USUARIO FACTURADO CON AFORO** → Medidor (1 = SI, 0 = NO)
- **VERTIMIENTO DEL PERIOD EN METROS CUBICOS** → Consumo
- **VALOR TOTAL FACTURADO** → Total Facturado
- **PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO** → Total Recaudo

### Transformaciones Automáticas
- **Fechas**: Normaliza automáticamente diferentes formatos de fecha a dd-MM-yyyy
- **Estados**: Convierte valores textuales a numéricos (INSTALADO/SI → 1, NO INSTALADO/NO → 0)
- **Valores numéricos**: Maneja diferentes formatos de números (comas, puntos, símbolos de moneda)
- **Clase de Uso**: Convierte a valores numéricos para agrupación

### Validación de Datos
- Verifica que el archivo contenga las columnas requeridas según el tipo de servicio
- Valida formato y estructura antes de procesamiento
- Proporciona mensajes de error detallados en caso de problemas

## Limitaciones

- Tamaño máximo de archivo: 5MB
- Formato específico de CSV requerido
- Procesamiento en el navegador (sin almacenamiento persistente)

## Contribuir

Si deseas contribuir al proyecto:
1. Haz un Fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles

## Autor

Ing. Eduardo E. Enríquez

## Agradecimientos

- Empresas de Servicios Públicos AAA

