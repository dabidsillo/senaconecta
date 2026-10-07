# Guía de defensa del MVP Tinku

Esta guía te ayuda a defender el MVP ante un jurado mixto: algunas personas pueden mirar el valor educativo y otras pueden preguntar por archivos, pruebas y límites técnicos. Usala junto con [docs/guia-del-proyecto.md](guia-del-proyecto.md), que explica la arquitectura con más detalle.

## Mensaje central

Tinku es una aplicación web local para explorar un catálogo inicial, practicar categorías y grabar clips etiquetados para revisión futura. No reconoce señas, no usa inteligencia artificial, no publica videos y no guarda datos en un servidor.

La frase más importante para decir con honestidad es esta:

> la aplicación intenta reproducir solo entradas con `videoPath` no vacío; la ruta configurada no garantiza que el archivo exista ni que su contenido haya sido revisado. Actualmente todas las rutas están vacías y las entradas placeholder no son señas LSB validadas.

## Guion oral de 3 a 5 minutos

Adaptá este guion a tu forma de hablar. No lo memorices palabra por palabra; mantené la estructura.

1. **Problema.** “Muchas veces un proyecto escolar de lengua de señas quiere mostrar vocabulario, práctica y material de video, pero es fácil exagerar lo que el sistema realmente hace. Este MVP busca mostrar una base honesta y simple.”
2. **Solución.** “La aplicación corre en el navegador. Permite buscar texto en un catálogo inicial, practicar palabras por categoría y, si la persona da permiso, grabar clips etiquetados para descargarlos junto con un JSON de metadata.”
3. **Demostración.** “Voy a buscar texto, mostrar palabras reconocidas y no encontradas, practicar una categoría y explicar la cámara como función opcional. Como todavía no hay videos revisados, la app muestra ‘Video no disponible’ en lugar de inventar una seña.”
4. **Límites.** “No hay backend, cuentas, IA, reconocimiento automático ni validación lingüística. El avance de práctica se pierde al recargar y los clips viven temporalmente en el navegador hasta que se descargan.”
5. **Siguiente paso.** “El siguiente avance real sería revisar contenido con personas competentes en LSB, agregar videos locales revisados en `videos/`, declarar sus rutas en `src/catalog.mjs` y recién después evaluar funciones más avanzadas.”

## Checklist de demo en la interfaz real

Antes de empezar, abrí el proyecto con el servidor local recomendado en [README.md](../README.md):

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Luego abrí `http://localhost:8000`. Evitá `file://` porque puede bloquear módulos JavaScript o cámara.

### 1. Diccionario y búsqueda textual

- [ ] Entrá a **Diccionario**.
- [ ] Buscá `Hola estudiante`.
- [ ] Mostrá que aparecen coincidencias del catálogo.
- [ ] Buscá `Gracias agua misterio`.
- [ ] Señalá que `misterio` aparece como palabra no encontrada.
- [ ] Mostrá el estado “Video no disponible” y explicá que no se simula reproducción.

### 2. Práctica por categorías

- [ ] Entrá a **Lecciones**.
- [ ] Elegí una categoría, por ejemplo `Escuela` o `Saludos`.
- [ ] Respondé una opción incorrecta y explicá que la práctica no avanza.
- [ ] Respondé la opción correcta y mostrale al jurado que avanza.
- [ ] Recargá la página si querés demostrar el límite: el progreso vuelve a empezar porque solo vive en memoria de la pestaña.

### 3. Cámara opcional, solo con permiso

Hacé esta parte solo si el jurado y el entorno permiten usar cámara. Pedí permiso verbal antes de activarla.

- [ ] Entrá a **Cámara**.
- [ ] Explicá que `index.html` dice que la cámara no traduce señas ni reconoce movimientos.
- [ ] Elegí una etiqueta del catálogo o escribí una etiqueta personalizada.
- [ ] Iniciá cámara solo si hay permiso.
- [ ] Grabá un clip corto y detenelo.
- [ ] Mostrá la vista previa, el botón **Descargar video** y el botón **Descargar metadata JSON**.
- [ ] Mostrá que el JSON declara `upload: "none"` y almacenamiento temporal del navegador.

### 4. Si no hay clips validados

- [ ] Decí: “No voy a reproducir un video de seña porque el repositorio no incluye clips revisados.”
- [ ] Mostrá el estado de ausencia de video.
- [ ] Explicá el proceso futuro: grabar, revisar, guardar localmente en `videos/`, editar `src/catalog.mjs` con un `videoPath` real y probar de nuevo.

## Plan B para problemas durante la defensa

| Problema | Qué hacer | Qué decir |
| --- | --- | --- |
| No hay cámara | Saltá la grabación y explicá `src/capture.mjs` con la UI visible. | “La cámara es opcional; la app debe seguir explicándose sin capturar datos.” |
| El navegador bloquea cámara | Confirmá que estás en `localhost`; si sigue fallando, no fuerces permisos. | “El navegador protege cámara por permisos y contexto seguro.” |
| No hay video validado | Mostrá “Video no disponible”. | “Es correcto: no fingimos reproducción de señas sin material revisado.” |
| El video grabado no prepara descarga | Usá el plan sin cámara y citá que las pruebas cubren helpers, no hardware real. | “La compatibilidad real de cámara depende del navegador y del dispositivo.” |
| No abre con `file://` | Usá el servidor Python local. | “Python solo sirve archivos; la app sigue siendo del navegador.” |
| Node no ejecuta pruebas | Revisá que el comando se corra desde la raíz del repo. | “Node se usa para pruebas automáticas, no para servir la aplicación final.” |

## Preguntas probables y respuestas cortas

### Para jurado no técnico

**¿La aplicación enseña LSB de forma validada?**

No todavía. Muestra una estructura escolar y etiquetas de ejemplo; las entradas actuales son placeholder, no señas LSB validadas.

**¿Reconoce una seña desde la cámara?**

No. La cámara solo graba un clip etiquetado para descargarlo y revisarlo después.

**¿Los videos se suben a internet?**

No. La aplicación no tiene backend ni subida automática; la persona debe descargar explícitamente el video y el JSON.

**¿Se guarda el progreso del estudiante?**

No. La práctica vive en la pestaña actual y se reinicia al recargar.

**¿Por qué eso es útil si todavía no tiene videos?**

Porque demuestra la estructura responsable: catálogo, búsqueda, práctica, captura y límites claros antes de afirmar contenido lingüístico.

### Para jurado técnico

**¿Dónde está el catálogo?**

En [src/catalog.mjs](../src/catalog.mjs). Ahí están `STARTER_CATALOG`, `videoPath: null` y `validationStatus: 'placeholder'`.

**¿Cómo se evita inventar videos?**

`getPlayableSequence` en [src/catalog.mjs](../src/catalog.mjs) solo acepta entradas con `videoPath` no vacío. Eso evita ofrecer reproducción cuando no se configuró una ruta; no verifica si el archivo existe ni si la seña fue revisada. La revisión humana del contenido es un paso aparte antes de declarar un video como LSB válido. [src/app.js](../src/app.js) muestra estados pendientes cuando no hay ruta de video.

**¿Cómo se arman las lecciones?**

[src/lessons.mjs](../src/lessons.mjs) agrupa entradas del mismo catálogo por categoría y crea práctica en memoria con `createPracticeSession`.

**¿Qué controla la captura?**

[src/capture.mjs](../src/capture.mjs) valida soporte, resuelve etiquetas, crea nombres seguros, metadata JSON y limpieza de tracks. [src/app.js](../src/app.js) conecta eso con los botones reales.

**¿Qué prueban los tests?**

[tests/catalog.test.mjs](../tests/catalog.test.mjs), [tests/lessons.test.mjs](../tests/lessons.test.mjs) y [tests/capture.test.mjs](../tests/capture.test.mjs) cubren funciones puras: búsqueda, progreso, metadata, MIME, límites y limpieza. No reemplazan una prueba manual de cámara.

**¿Python es el backend?**

No. `python3 -m http.server` solo sirve archivos estáticos en local para que el navegador cargue módulos y permisos. La lógica de la app corre en el navegador.

**¿Node ejecuta la app?**

No. Node ejecuta `node --test` para pruebas automáticas de módulos JavaScript.

## Matriz de afirmaciones y evidencia

| Afirmación segura | Evidencia del repo | Cómo defenderla |
| --- | --- | --- |
| Hay búsqueda textual por catálogo. | [src/catalog.mjs](../src/catalog.mjs), [tests/catalog.test.mjs](../tests/catalog.test.mjs) | Buscar texto con palabras conocidas y desconocidas. |
| Las entradas actuales no tienen videos revisados. | `videoPath: null` y `validationStatus: 'placeholder'` en [src/catalog.mjs](../src/catalog.mjs) | Mostrar “Video no disponible”. |
| La práctica por categorías usa el mismo catálogo. | [src/lessons.mjs](../src/lessons.mjs), [tests/lessons.test.mjs](../tests/lessons.test.mjs) | Elegir una lección y responder mal/correcto. |
| El progreso no persiste al recargar. | [src/app.js](../src/app.js) mantiene `practiceSession` en memoria; README lo documenta. | Recargar la página y mostrar reinicio. |
| La cámara no reconoce señas. | Texto en [index.html](../index.html) y metadata en [src/capture.mjs](../src/capture.mjs) | Decir que solo graba y etiqueta. |
| La app no sube archivos. | Metadata `upload: 'none'` en [src/capture.mjs](../src/capture.mjs) | Mostrar el JSON descargable si hay demo de cámara. |
| Los videos privados no van al repo por defecto. | [README.md](../README.md) documenta `/videos/` ignorado por Git. | Explicar revisión local antes de publicar cualquier material. |
| Las pruebas automáticas existen. | [tests/](../tests/) | Ejecutar `node --test`. |

## Límites que conviene decir antes de que los pregunten

- No afirmes mejora de aprendizaje porque no hay medición con estudiantes.
- No afirmes compatibilidad con todos los navegadores; cámara y grabación dependen del navegador y dispositivo.
- No digas que hay IA, reconocimiento automático o traducción de señas.
- No presentes las etiquetas placeholder como señas oficiales o validadas.
- No prometas publicación de videos; el flujo actual es local y manual.
- No menciones credenciales, avales o autoridad externa si no están en el repositorio.

## Consentimiento y manejo de datos locales

Si mostrás la cámara, tratala como dato sensible aunque sea una prueba escolar.

- Pedí permiso antes de activar cámara.
- Avisá que el clip queda temporalmente en memoria del navegador.
- Descargá video y JSON solo si la persona acepta.
- No proyectes archivos descargados con datos personales sin consentimiento.
- Al terminar, cerrá la pestaña o limpiá la grabación si no se va a conservar.
- Si se conserva un clip para trabajo futuro, debe revisarse antes de usarlo como material LSB válido.

## Cierre recomendado

“Mi defensa no es que el proyecto ya resuelve toda la enseñanza de LSB. Mi defensa es que el MVP construye una base clara y verificable: catálogo, búsqueda, práctica, captura opcional y límites honestos. El siguiente paso responsable es validar contenido con personas competentes y recién después asociar videos locales revisados o investigar reconocimiento automático.”
