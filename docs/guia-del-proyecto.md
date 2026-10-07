# Guía del proyecto Tinku

Esta guía explica cómo está construido el MVP de Tinku, qué problema intenta resolver y qué decisiones técnicas tomó el proyecto. Está escrita para una estudiante o un estudiante que recién empieza con HTML, CSS y JavaScript.

> Idea central: esta aplicación funciona en el navegador, sin servidor propio, sin cuentas y sin traducción automática de señas. Muestra un catálogo inicial, organiza lecciones y permite grabar clips etiquetados para revisión futura.

## Ruta rápida para entender el proyecto

1. Leé primero [README.md](../README.md) para saber cómo ejecutar la aplicación.
2. Abrí [index.html](../index.html) para ver la estructura de la página.
3. Revisá [src/catalog.mjs](../src/catalog.mjs) para entender de dónde salen las palabras.
4. Revisá [src/lessons.mjs](../src/lessons.mjs) para ver cómo se arman las prácticas.
5. Revisá [src/capture.mjs](../src/capture.mjs) para entender la grabación y la metadata.
6. Revisá [src/app.js](../src/app.js) para ver cómo se conecta todo con botones, formularios y videos.
7. Mirá [tests/](../tests/) para confirmar qué reglas están protegidas por pruebas automáticas.

## Qué problema intenta resolver

Tinku busca ser una base escolar simple para explorar vocabulario de Lengua de Señas Boliviana en un entorno web. El proyecto sirve para explicar tres ideas:

- un diccionario textual que busca palabras en un catálogo;
- lecciones iniciales por categoría;
- captura de videos etiquetados para análisis o entrenamiento futuro.

El MVP no afirma que las entradas sean señas válidas. El catálogo actual usa etiquetas de ejemplo y estados `placeholder`. Por eso la interfaz muestra estados como “Video no disponible” cuando no hay una grabación revisada.

## Qué no hace este MVP

Este punto es importante para defender el proyecto con honestidad técnica:

- No traduce señas automáticamente.
- No reconoce movimientos con inteligencia artificial.
- No valida que una etiqueta sea una seña correcta.
- No tiene backend, login ni base de datos.
- No sube videos a internet.
- No conserva progreso después de recargar la página.
- No agrega videos privados al repositorio.

La cámara solo graba clips que la persona usuaria etiqueta y descarga manualmente. Esa etiqueta es contexto para revisión futura, no una prueba de reconocimiento.

## Stack real del proyecto

| Parte | Tecnología | Para qué sirve |
| --- | --- | --- |
| Página | HTML en [index.html](../index.html) | Define secciones, formularios, botones y contenedores. |
| Estilos | CSS en [styles.css](../styles.css) | Da diseño mobile-first, tarjetas, paneles y adaptación a pantallas grandes. |
| Lógica del navegador | JavaScript modules en [src/](../src/) | Busca vocabulario, arma lecciones, maneja cámara y actualiza el DOM. |
| Pruebas | Node test runner en [tests/](../tests/) | Verifica funciones puras sin abrir el navegador. |
| Servidor local de desarrollo | `python3 -m http.server` | Sirve archivos estáticos desde la computadora. |

El servidor de Python no es parte de la aplicación final. Solo permite abrir el proyecto como sitio local para que el navegador acepte módulos JavaScript y APIs como cámara en `localhost`.

Node tampoco ejecuta la aplicación en producción. Node se usa para correr pruebas con `node --test` sobre funciones JavaScript reutilizables.

## Cómo ejecutar de forma segura

Desde la raíz del repositorio:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Luego abrí:

```text
http://localhost:8000
```

¿Por qué se recomienda así?

- `localhost` permite que el navegador habilite APIs como cámara.
- `--bind 127.0.0.1` evita publicar el servidor local en toda la red.
- Evitar `file://` reduce problemas con módulos JavaScript y permisos.

## Mapa de archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| [index.html](../index.html) | Esqueleto de la interfaz: navegación fija al desplazarse, diccionario, lecciones y cámara. El catálogo compartido vive en JavaScript; no tiene una tarjeta propia. |
| [styles.css](../styles.css) | Diseño visual mobile-first y adaptación responsiva. |
| [src/catalog.mjs](../src/catalog.mjs) | Catálogo inicial, normalización de texto, búsqueda y secuencia de videos. |
| [src/lessons.mjs](../src/lessons.mjs) | Lecciones por categoría y estado de práctica en memoria. |
| [src/capture.mjs](../src/capture.mjs) | Soporte de cámara, etiquetas, MIME, nombres seguros, metadata y limpieza. |
| [src/app.js](../src/app.js) | Controlador del DOM: escucha eventos y renderiza resultados. |
| [tests/](../tests/) | Pruebas de catálogo, lecciones y captura. |
| [.gitignore](../.gitignore) | Evita versionar estado local de Pi y videos privados en `/videos/`. |

## index.html: estructura de la experiencia

[index.html](../index.html) define una página completa en español. No contiene la lógica de búsqueda ni de cámara; contiene los elementos que JavaScript va a leer y modificar.

Tiene cuatro zonas principales:

1. encabezado y navegación;
2. diccionario;
3. lecciones por categoría;
4. captura con cámara.

Un fragmento ilustrativo del formulario de búsqueda se ve así:

```html
<form id="lookup-form" class="lookup-form" autocomplete="off">
  <label for="lookup-input">Texto para buscar</label>
  <input id="lookup-input" name="lookup" type="text">
</form>
```

Este ejemplo está simplificado para estudiar la conexión entre HTML y JavaScript; no pretende copiar cada atributo ni todo el bloque exacto de [index.html](../index.html). La clave para entender HTML es que los atributos `id` funcionan como puntos de conexión. Por ejemplo, [src/app.js](../src/app.js) busca `#lookup-form`, `#lookup-input` y `#summary` para reaccionar cuando la persona escribe una búsqueda.

La página también declara mensajes explícitos sobre límites del MVP: la cámara no traduce señas, no inventa movimientos y no hace reconocimiento automático.

## styles.css: diseño mobile-first

[styles.css](../styles.css) aplica un diseño pensado primero para celular. Eso se nota porque las reglas base usan una columna y botones grandes. Después, con una media query, se agregan columnas para pantallas más grandes:

```css
@media (min-width: 720px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

Esta decisión es útil para una aplicación escolar porque muchas personas prueban primero desde un teléfono. También mejora accesibilidad básica: botones altos, foco visible, contraste de paneles y formularios simples.

Algunas clases importantes:

- `.panel`: caja general para secciones.
- `.card-grid`: grilla de resultados.
- `.video-placeholder`: estado visible cuando no hay video.
- `.capture-panel`: zona de cámara y descargas.
- `.metadata-preview`: vista del JSON generado.

## src/catalog.mjs: catálogo y búsqueda textual

[src/catalog.mjs](../src/catalog.mjs) contiene el catálogo compartido y funciones puras. Una función pura es una función que puede probarse sin navegador porque recibe datos y devuelve datos.

El catálogo arranca con:

```js
export const CATALOG_VERSION = 'starter-placeholder-v1';
```

Cada entrada tiene datos como `id`, `label`, `displayLabel`, `category`, `description`, `videoPath` y `validationStatus`.

La decisión importante es que las entradas actuales usan:

```js
videoPath: null,
validationStatus: 'placeholder'
```

Eso evita afirmar que ya hay videos validados. Cuando `videoPath` es `null`, la interfaz debe mostrar “Video no disponible”.

Funciones clave:

- `normalizeText(value)`: quita acentos, baja a minúsculas y recorta espacios.
- `tokenizeText(value)`: separa el texto en palabras.
- `createLexicon(catalog)`: arma un mapa para encontrar entradas por término.
- `lookupText(input, catalog)`: devuelve palabras reconocidas y desconocidas.
- `getPlayableSequence(recognizedItems)`: filtra solo resultados con `videoPath` real.

Flujo simple de búsqueda:

```text
texto escrito → normalizeText → tokenizeText → lookupText → resultados reconocidos/desconocidos
```

Si la persona escribe “Hola estudiante y agua”, el sistema reconoce las palabras que están en el catálogo y conserva el orden de aparición.

## src/lessons.mjs: lecciones por categoría

[src/lessons.mjs](../src/lessons.mjs) usa el mismo catálogo que el diccionario. Esta es una buena decisión: evita duplicar vocabulario y reduce contradicciones entre secciones.

La función principal es:

```js
buildBeginnerLessons(catalog = STARTER_CATALOG)
```

Esa función agrupa entradas por categoría y crea lecciones solo cuando una categoría tiene al menos dos entradas. Así una práctica tiene progresión mínima y no queda como una tarjeta aislada.

El estado de práctica se crea con:

```js
createPracticeSession(lesson)
```

Ese estado vive solo en memoria JavaScript. Si la página se recarga, el avance se pierde. Esto es intencional: el proyecto no usa almacenamiento persistente del navegador ni cuentas.

Funciones clave:

- `buildBeginnerLessons`: crea lecciones desde categorías.
- `createPracticeSession`: inicia el avance de una lección.
- `getPracticePrompt`: prepara la pregunta actual.
- `answerPracticeStep`: evalúa una respuesta y devuelve el siguiente estado.

## src/capture.mjs: cámara, etiqueta y metadata

[src/capture.mjs](../src/capture.mjs) contiene la lógica testable de captura. No abre la cámara por sí solo; prepara reglas para que [src/app.js](../src/app.js) las use con el navegador.

Funciones clave:

- `getCaptureSupport(environment)`: revisa si existen `getUserMedia` y `MediaRecorder`.
- `chooseSupportedMimeType(mediaRecorder, options)`: elige un formato de video compatible.
- `resolveCaptureLabel`: decide si usar etiqueta del catálogo o etiqueta personalizada.
- `freezeResolvedLabel`: congela la etiqueta al comenzar la grabación.
- `createSafeFileStem`: genera nombres de archivo seguros.
- `buildCaptureMetadata`: crea el JSON que acompaña al video.
- `stopStreamTracks`: apaga tracks de cámara.
- `createMetadataBlob`: prepara la metadata para descargar.

Una decisión técnica importante es priorizar video sin audio cuando el stream no tiene audio. La aplicación pide cámara con `audio: false`, por eso `chooseSupportedMimeType` evita codecs de audio cuando no corresponden. Esto ayuda a compatibilidad entre navegadores.

La metadata incluye campos como:

```js
storage: 'browser-memory-until-explicit-download',
upload: 'none'
```

Eso documenta que el archivo vive temporalmente en memoria del navegador y que no se sube a un servidor.

## Qué son memoria del navegador, Blob y objectURL

Estos conceptos aparecen en la captura:

- **Memoria del navegador**: espacio temporal que usa la pestaña mientras está abierta. No equivale a guardar en disco de forma permanente.
- **Blob**: objeto que representa datos binarios o texto, por ejemplo un video grabado o un JSON.
- **objectURL**: URL temporal creada con `URL.createObjectURL(blob)` para que un `<video>` o un enlace `<a>` puedan usar ese Blob.

En este proyecto, `finishRecording` crea un Blob de video y otro Blob de metadata. Después crea URLs temporales para previsualizar y descargar. Más tarde `revokeCaptureUrls` libera esas URLs para no dejar memoria ocupada.

## src/app.js: controlador de la interfaz

[src/app.js](../src/app.js) conecta el HTML con las funciones de `catalog.mjs`, `lessons.mjs` y `capture.mjs`.

Al inicio selecciona elementos del DOM:

```js
const form = document.querySelector('#lookup-form');
const input = document.querySelector('#lookup-input');
const summary = document.querySelector('#summary');
```

DOM significa Document Object Model. Es la forma en que JavaScript ve y modifica la página HTML.

Responsabilidades de `app.js`:

- escuchar envíos del formulario de búsqueda;
- renderizar tarjetas de resultados;
- activar botones de ejemplos;
- preparar controles de reproducción;
- mostrar lecciones y práctica;
- pedir permiso de cámara;
- iniciar y detener grabaciones;
- crear enlaces de descarga para video y JSON;
- limpiar cámara y URLs temporales al salir.

Funciones útiles para estudiar:

- `renderResult(inputText)`: coordina búsqueda y renderizado.
- `preparePlayback(result)`: arma la secuencia de videos disponibles.
- `appendMissingVideoState(card)`: muestra estado honesto cuando no hay video.
- `renderLessons()`: dibuja lecciones.
- `renderPractice()`: dibuja la pregunta actual.
- `startCamera()`: pide permiso de cámara.
- `startRecording()`: crea `MediaRecorder` y empieza a grabar.
- `finishRecording(sessionId, recorder)`: prepara Blob, metadata y enlaces de descarga.
- `cleanupCapture()`: libera cámara, memoria y URLs temporales.

## Flujo end-to-end: búsqueda

```text
1. La persona escribe texto en el formulario.
2. app.js intercepta el submit.
3. renderResult llama lookupText.
4. catalog.mjs normaliza y separa tokens.
5. Se devuelven reconocidos y desconocidos.
6. app.js dibuja tarjetas y palabras no encontradas.
7. getPlayableSequence deja pasar solo entradas con videoPath.
8. Si no hay videos, la UI muestra estado pendiente en lugar de inventar señas.
```

Este flujo demuestra separación de responsabilidades: el catálogo decide qué datos existen; la interfaz decide cómo mostrarlos.

## Flujo end-to-end: lección

```text
1. buildBeginnerLessons agrupa el catálogo por categoría.
2. app.js selecciona una lección inicial.
3. createPracticeSession crea estado temporal.
4. getPracticePrompt arma la pregunta actual.
5. La persona elige una opción.
6. answerPracticeStep calcula si fue correcta.
7. app.js vuelve a renderizar la práctica.
8. Al recargar la página, el estado desaparece.
```

El punto educativo es que el progreso no se guarda en una base de datos. Solo vive en variables JavaScript como `practiceSession` mientras la pestaña está abierta.

## Flujo end-to-end: captura

```text
1. La persona abre la sección Cámara.
2. getCaptureSupport revisa si el navegador soporta cámara y grabación.
3. startCamera pide permiso con navigator.mediaDevices.getUserMedia.
4. La persona elige una etiqueta del catálogo o escribe una personalizada.
5. startRecording congela esa etiqueta con freezeResolvedLabel.
6. MediaRecorder graba un clip corto.
7. finishRecording crea un Blob de video.
8. buildCaptureMetadata crea el JSON descriptivo.
9. URL.createObjectURL genera enlaces temporales.
10. La persona descarga explícitamente video y JSON.
```

Nada se sube automáticamente. Si la persona cierra la pestaña sin descargar, puede perder el clip.

## Cómo agregar manualmente un video revisado

El proyecto no incluye videos privados en Git. La carpeta local `/videos/` está ignorada por [.gitignore](../.gitignore).

Proceso recomendado:

1. Ejecutá el sitio en `http://localhost:8000`.
2. Grabá un clip desde la sección Cámara.
3. Descargá el video y el JSON.
4. Revisá el clip con una persona o fuente competente antes de usarlo como material válido.
5. Copiá manualmente el video revisado dentro de `videos/`.
6. Abrí [src/catalog.mjs](../src/catalog.mjs).
7. Cambiá el `videoPath` de la entrada correspondiente, por ejemplo:

```js
videoPath: 'videos/hola-revisado.webm'
```

8. Recargá la página y buscá esa palabra.
9. Probá que el video se vea en el diccionario y en la reproducción ordenada.

No cambies `validationStatus` ni textos de validez si no hubo revisión real. Un archivo grabado no prueba por sí mismo que la seña sea correcta.

## Decisiones y tradeoffs del proyecto

| Decisión | Beneficio | Costo o límite |
| --- | --- | --- |
| Sin backend | Fácil de ejecutar y explicar. | No hay cuentas, sincronización ni guardado central. |
| Sin login | Menos complejidad y menos datos personales. | No hay perfiles ni historial por estudiante. |
| Sin persistencia del navegador | Privacidad y comportamiento simple. | El progreso se pierde al recargar. |
| Catálogo placeholder | Permite desarrollar UI sin inventar autoridad lingüística. | Todavía falta validación real de contenido. |
| Videos privados ignorados | Evita publicar material sensible por accidente. | Un sitio publicado no tendrá esos videos automáticamente. |
| Pruebas sobre funciones puras | Rápidas y fáciles de correr en Node. | No reemplazan pruebas manuales de navegador y cámara. |
| Cámara con descarga explícita | La persona controla sus archivos. | Si no descarga, puede perder la grabación. |

## Pruebas existentes

Las pruebas están en [tests/](../tests/) y se ejecutan con:

```sh
node --test
```

Qué cubren:

- [tests/catalog.test.mjs](../tests/catalog.test.mjs): normalización, tokens, búsqueda, categorías y videos disponibles.
- [tests/lessons.test.mjs](../tests/lessons.test.mjs): creación de lecciones, avance y finalización de práctica.
- [tests/capture.test.mjs](../tests/capture.test.mjs): soporte de cámara, MIME, etiquetas, metadata, nombres de archivo y limpieza de tracks.

Estas pruebas no abren una cámara real. Para eso hace falta una prueba manual en navegador.

## Glosario breve

| Término | Significado en este proyecto |
| --- | --- |
| MVP | Versión mínima útil para demostrar una idea sin construir todo el sistema final. |
| Catálogo | Lista de palabras, categorías y rutas de video. |
| Placeholder | Entrada temporal para desarrollo, no validada como contenido final. |
| DOM | Representación de la página HTML que JavaScript puede leer y modificar. |
| Módulo JavaScript | Archivo `.mjs` o script `type="module"` que exporta e importa funciones. |
| Backend | Servidor propio con lógica, base de datos o APIs. Este MVP no tiene backend. |
| Persistencia | Guardar datos para que sigan después de cerrar o recargar. |
| Blob | Objeto de datos usado para video o JSON en el navegador. |
| objectURL | Enlace temporal que apunta a un Blob local en memoria. |
| MIME type | Texto que describe el formato de un archivo, por ejemplo `video/webm`. |
| MediaRecorder | API del navegador para grabar audio o video desde un stream. |
| getUserMedia | API del navegador para pedir cámara o micrófono. |

## Camino de estudio: primera pasada realista

No hace falta dominar todos los archivos en una sola sesión. Una primera pasada de 15 a 25 minutos sirve para ubicar el mapa del proyecto y elegir qué estudiar después.

1. **Primeros 5 minutos:** leé el primer párrafo del [README.md](../README.md), confirmá qué hace y qué no hace la app, y ubicá cómo ejecutarla.
2. **Siguientes 5 minutos:** abrí [index.html](../index.html) y encontrá los `id` principales de diccionario, lecciones y cámara. No intentes entender todo el marcado todavía.
3. **Siguientes 5-10 minutos:** abrí [src/catalog.mjs](../src/catalog.mjs) y seguí `lookupText` con una frase de ejemplo. Este es el flujo más simple para empezar.
4. **Si te queda tiempo:** mirá [src/lessons.mjs](../src/lessons.mjs) o [src/capture.mjs](../src/capture.mjs), pero elegí uno. Captura usa APIs más avanzadas y puede requerir una segunda lectura.
5. **Después de la primera pasada:** volvé a [src/app.js](../src/app.js) para conectar lo que viste con la interfaz. Buscá `renderResult`, `startCamera` y `finishRecording` como puntos de entrada, no como obligación de dominar todo el archivo.

## Autoevaluación

**1. ¿Dónde está la lista de palabras del diccionario?**  
En [src/catalog.mjs](../src/catalog.mjs), dentro de `STARTER_CATALOG`.

**2. ¿Por qué las entradas actuales tienen `videoPath: null`?**  
Porque no hay videos revisados asociados. La aplicación debe mostrar un estado pendiente, no inventar señas.

**3. ¿Qué archivo conecta los botones del HTML con la lógica JavaScript?**  
[src/app.js](../src/app.js), porque consulta elementos del DOM y registra eventos.

**4. ¿Dónde se guarda el avance de una práctica?**  
En variables JavaScript de la pestaña, como `practiceSession`. No se guarda en disco ni en servidor.

**5. ¿La cámara reconoce señas automáticamente?**  
No. Solo graba un clip etiquetado y permite descargar video y metadata.

**6. ¿Por qué se usa `python3 -m http.server` si la app es JavaScript?**  
Porque sirve archivos estáticos para el navegador durante desarrollo. No ejecuta la lógica de la aplicación.

**7. ¿Para qué sirve `node --test`?**  
Para ejecutar pruebas automáticas sobre funciones JavaScript puras desde Node.

**8. ¿Qué significa `upload: 'none'` en la metadata?**  
Que la grabación no fue subida por la aplicación a ningún servidor.

## Resumen final

Tinku es un MVP de navegador que separa bien sus piezas: HTML para estructura, CSS para presentación, módulos JavaScript para lógica y pruebas Node para reglas puras. Sus decisiones favorecen privacidad, claridad y honestidad: no hay backend, no hay login, no hay persistencia automática y no hay reconocimiento de señas sin evidencia futura.
