```markdown
# Procesador de Servicios Públicos

Esta aplicación web permite procesar archivos Excel (XLSX) o CSV con información de servicios públicos (Acueducto, Alcantarillado, Aseo), generando reportes consolidados mensuales y anuales con mapeo inteligente de columnas.

## 🚀 Características Principales

- **Soporte Multi-Servicio**: Acueducto, Alcantarillado y Aseo
- **Carga Flexible**: Archivos Excel XLSX o CSV
- **Mapeo Inteligente**: Selección automática o manual de columnas
- **Procesamiento Masivo**: Hasta 200,000 registros
- **Reportes Dinámicos**: Visualización mensual y anual con paginación
- **Exportación**: Descarga en formato Excel o CSV
- **Interfaz Intuitiva**: Flujo paso a paso guiado

## 📋 Tipos de Servicio Soportados

### 🚰 Acueducto (Servicio de Agua Potable)
**Columnas requeridas:**
- FECHA DE EXPEDICIÓN DE LA FACTURA
- CÓDIGO CLASE DE USO
- ESTADO DE MEDIDOR
- CONSUMO DEL PERÍODO EN METROS CÚBICOS
- VALOR TOTAL FACTURADO
- PAGOS DEL USUARIO RECIBIDOS DURANTE EL MES DE REPORTE

### 🚿 Alcantarillado 
**Columnas requeridas:**
- FECHA DE EXPEDICIÓN DE LA FACTURA
- CÓDIGO CLASE DE USO
- USUARIO FACTURADO CON AFORO
- VERTIMIENTO DEL PERÍODO EN METROS CÚBICOS
- VALOR TOTAL FACTURADO
- PAGOS DEL CLIENTE DURANTE EL PERÍODO FACTURADO

### 🗑️ Aseo (Recolección de Basuras)
**Columnas requeridas:**
- Fecha de expedición de la factura
- Código de clase o uso

## 📁 Requisitos del Archivo

### Formatos Soportados
- **Excel**: .xlsx (recomendado)
- **CSV**: valores separados por comas

### Especificaciones Técnicas
- Tamaño máximo: 5MB
- Límite de registros: 200,000 filas
- Primera fila: nombres de columnas (headers)
- Fechas: formato dd-MM-yyyy o dd/MM/yyyy
- Números: punto como separador decimal
- Codificación: UTF-8 (para CSV)

## 🔄 Flujo de Trabajo

### 1. Selección de Servicio
Elija el tipo de servicio público que desea procesar:
- **Acueducto**: Para datos de consumo de agua
- **Alcantarillado**: Para datos de vertimientos
- **Aseo**: Para datos de usuarios por estrato

### 2. Carga de Archivo
- Seleccione su archivo Excel (.xlsx) o CSV
- El sistema detectará automáticamente las columnas disponibles
- Revise los requisitos específicos para el servicio seleccionado

### 3. Mapeo de Columnas
- Si las columnas no coinciden exactamente, aparecerá la interfaz de mapeo
- Seleccione qué columna de su archivo corresponde a cada campo requerido
- Confirme el mapeo para continuar

### 4. Procesamiento y Visualización
- Los datos se procesan automáticamente
- Visualice la vista previa con paginación
- Seleccione tipo de reporte (mensual o anual)

### 5. Exportación
- Descargue los resultados en formato Excel o CSV
- El archivo incluye datos consolidados por período y clase de uso

## 📊 Funcionalidades de Reportes

### Reportes Mensuales
- Agrupa datos por mes y clase de uso
- Cuenta usuarios únicos por período
- Suma consumos, facturación y recaudos
- Cuenta medidores activos

### Reportes Anuales
- Agrupa datos por año y clase de uso
- Calcula promedios mensuales de usuarios
- Totaliza consumos anuales
- Promedios de medidores activos

### Campos del Reporte
- **Período**: MM-YYYY (mensual) o YYYY (anual)
- **Clase de Uso**: Código del tipo de usuario
- **Usuarios**: Cantidad de usuarios registrados
- **Medidores**: Cantidad de medidores activos
- **Total Consumo**: Suma de consumos en m³
- **Total Facturado**: Suma de importes facturados
- **Total Recaudo**: Suma de pagos recibidos

## 💻 Tecnologías Utilizadas

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Build Tool**: Vite
- **Librerías**:
  - SheetJS (XLSX): Lectura de archivos Excel
  - Papa Parse: Procesamiento de archivos CSV
  - Responsive Design: Interfaz adaptativa

## 🚀 Instalación y Desarrollo

### Prerrequisitos
- Node.js 16+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Ing-Eduardo-E/csv-processor.git

# Instalar dependencias
cd csv-processor
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 📂 Estructura del Proyecto

```
csv-processor/
├── src/
│   ├── js/
│   │   ├── config.js          # Configuración de servicios y validaciones
│   │   ├── parsers.js         # Parsers para XLSX y CSV
│   │   ├── dataProcessing.js  # Lógica de procesamiento de datos
│   │   ├── ui.js              # Componentes de interfaz
│   │   ├── pagination.js      # Control de paginación
│   │   └── export.js          # Exportación de datos
│   ├── style.css              # Estilos principales
│   └── main.js                # Punto de entrada principal
├── index.html                 # Página principal
├── package.json               # Dependencias y scripts
└── README.md                  # Documentación
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, contacte al equipo de desarrollo o abra un issue en el repositorio.

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

