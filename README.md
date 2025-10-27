```markdown
# Procesador de Archivos CSV - Reporte de Consumos

Esta aplicación web permite procesar archivos CSV con información de consumos, facturas y recaudos, generando reportes consolidados mensuales y anuales.

## Características

- Carga y validación de archivos CSV
- Procesamiento de hasta 200,000 registros
- Visualización de datos con paginación
- Reportes mensuales y anuales
- Exportación a Excel o CSV
- Interfaz intuitiva y responsiva

## Requisitos del Archivo CSV

### Estructura del Archivo
La aplicación procesa automáticamente archivos CSV exportados desde el sistema de facturación de acueducto. No es necesario modificar o eliminar columnas del archivo original.

**Columnas requeridas del sistema:**
- **FECHA DE EXPEDICIÓN DE LA FACTURA**: Fecha de emisión de la factura
- **CÓDIGO CLASE DE USO**: Clasificación del usuario (valor numérico)
- **ESTADO DE MEDIDOR**: Estado del medidor (INSTALADO, NO INSTALADO, etc.)
- **CONSUMO DEL PERÍODO EN METROS CÚBICOS**: Consumo medido en m³
- **VALOR TOTAL FACTURADO**: Total facturado al usuario
- **PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE**: Recaudos del período

### Especificaciones
- Formato: CSV (valores separados por comas)
- Codificación: UTF-8
- Tamaño máximo: 5MB
- Límite de filas: 200,000
- El archivo puede contener todas las columnas del sistema original (49 columnas)
- La aplicación extrae y procesa automáticamente solo las columnas necesarias

### Transformaciones Automáticas
La aplicación realiza las siguientes transformaciones:
- **Fechas**: Normaliza automáticamente diferentes formatos de fecha a dd-MM-yyyy
- **Estado de Medidor**: Convierte estados textuales (INSTALADO, NO INSTALADO, etc.) a valores numéricos (1 o 0)
- **Valores numéricos**: Maneja diferentes formatos de números (con comas, puntos, símbolos de moneda)
- **Clase de Uso**: Convierte a valores numéricos para agrupación

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
2. Exportar el archivo CSV completo desde el sistema de facturación de acueducto
3. Cargar el archivo CSV en la aplicación (no requiere modificaciones previas)
4. Verificar los datos transformados en la vista previa
5. Seleccionar el tipo de reporte (mensual o anual)
6. Usar los controles de paginación para navegar por los datos
7. Hacer clic en "Procesar y Descargar" para exportar el reporte

## Características Técnicas

### Mapeo Automático de Columnas
La aplicación mapea automáticamente las columnas del archivo original a un formato interno optimizado:
- **FECHA DE EXPEDICIÓN DE LA FACTURA** → Fecha normalizada
- **CÓDIGO CLASE DE USO** → Clase de Uso
- **ESTADO DE MEDIDOR** → Medidor (1/0)
- **CONSUMO DEL PERÍODO EN METROS CÚBICOS** → Consumo
- **VALOR TOTAL FACTURADO** → Total Facturado
- **PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPOPRTE** → Total Recaudo

### Validación de Datos
- Verifica que el archivo contenga las columnas requeridas del sistema
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

