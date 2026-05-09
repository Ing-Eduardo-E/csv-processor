# Changelog — Refactorización Arquitectónica

## [refactor] — Fase 7: Hardening Final

### Fase 0: Auditoría y Preparación
- Creada rama `refactor/architecture-cleanup` desde `master`
- Verificado build limpio con `vite build` (baseline: 467.13 KB, 15 módulos, 2 warnings)
- Generado snapshot del grafo pre-refactor (`graphify-snapshot-fase0.html`)
- Métricas baseline: main.js=487 LOC (God Module), parsers.js=317 LOC (CC~15)

### Fase 1-3+5: Desmembramiento del God Module + Limpieza de Imports
- **main.js**: 487 LOC → 148 LOC (-70%)
  - Extraídas `filterDataByReportType`, `filterAseoData`, `getMonthFromDate` → `dataProcessing.js`
  - Extraídos `parseRawCSV`, `parseRawExcel` → `parsers.js`
  - main.js ahora es solo: init, event listeners, state, orquestación
- **dataProcessing.js**: 54 LOC → 140 LOC (activado como módulo de procesamiento)
- **parsers.js**: absorbidas funciones de parseo raw, exports pasaron de 3 a 5
- **Imports dinámicos eliminados**: main.js ya no usa `import()` para papaparse/xlsx
- **Vite warnings**: 2 → 0
- **Bundle size**: 467.13 KB → 460.78 KB (-6.35 KB)

### Fase 4: Strategy Pattern — Reducción de Complejidad
- Creada carpeta `src/js/transformers/` con 5 archivos:
  - `shared.js` (74 LOC): funciones de transformación reutilizables
  - `acueductoTransformer.js` (28 LOC): transformador Acueducto
  - `alcantarilladoTransformer.js` (28 LOC): transformador Alcantarillado
  - `aseoTransformer.js` (22 LOC): transformador Aseo
  - `transformerRegistry.js` (15 LOC): dispatcher por serviceType
- Eliminado `switch` de 15 ramas en `parsers.js` → reemplazado por dispatcher de Strategy Pattern
- **Complejidad ciclomática en parsers.js**: ~15 → ~6 (-60%)
- **parsers.js LOC**: 317 → 136 (-57%)

### Fase 6: Integración y Verificación
- Verificada alineación completa entre `SERVICE_CONFIGS` y transformers
- Verificado flujo: config → parser → transformer → processor → ui
- Verificado 0 imports dinámicos, 0 warnings de Vite
- Generado diff arquitectónico final vs Fase 0

### Fase 7: Hardening Final
- Eliminados dead exports de `config.js`: `INTERNAL_COLUMNS`, `ORIGINAL_COLUMNS` (50+ LOC muertos)
- `MEDIDOR_ESTADOS` convertido a constante privada (no exportada)
- Eliminado `console.warn` residual en `shared.js`
- Verificada consistencia de naming (camelCase funciones, PascalCase constantes)
- Verificada ausencia de dependencias cruzadas entre transformers
- Verificado SRP en cada módulo

## Impacto Arquitectónico Final

| Métrica | Antes | Después | Δ |
|---|---|---|---|
| main.js | 487 LOC (God Module) | 148 LOC (Orchestrator) | -70% |
| parsers.js | 317 LOC (CC~15) | 136 LOC (CC~6) | -57% |
| dataProcessing.js | 54 LOC (subutilizado) | 140 LOC (activo) | +159% |
| config.js | 178 LOC | 115 LOC | -35% |
| Imports dinámicos | 2 | 0 | -100% |
| Vite warnings | 2 | 0 | -100% |
| Bundle size | 467.13 KB | 461.26 KB | -5.87 KB |
| Módulos | 8 JS | 12 JS + 1 transformers/ | +5 archivos |
| Extensibilidad | Modificar switch | Crear 1 archivo + 1 línea | Strategy Pattern |
