El archivo se llama `README.md` y no debe ir en la carpeta `dist`, debe estar en la raíz del proyecto. Aquí te propongo el contenido:

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
El archivo CSV debe contener las siguientes columnas en este orden:
- **Fecha**: formato dd-MM-yyyy (ejemplo: 01-01-2024)
- **Clase de Uso**: valor numérico
- **Medidor**: valor numérico (1 si tiene medidor, 0 si no tiene)
- **Consumo**: valor numérico (metros cúbicos)
- **Total Facturado**: valor numérico
- **Total Recaudo**: valor numérico

### Especificaciones
- Formato: CSV (valores separados por comas)
- Codificación: UTF-8
- Tamaño máximo: 5MB
- Límite de filas: 200,000
- Valores numéricos: usar punto como separador decimal

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
2. Cargar un archivo CSV con el formato especificado
3. Verificar los datos en la vista previa
4. Seleccionar el tipo de reporte (mensual o anual)
5. Usar los controles de paginación para navegar por los datos
6. Hacer clic en "Procesar y Descargar" para exportar el reporte

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

