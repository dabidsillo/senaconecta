# HTML de Tinku, paso a paso

Esta guía te deja leer la página real de Tinku sin saber programar. **HTML organiza las partes que se ven; no busca, no graba ni decide resultados.** Para esas acciones, la página conecta con [CSS](../styles.css), que da aspecto, y con [JavaScript](../src/app.js), que responde al uso. Los recortes muestran solo algunas líneas: las etiquetas de cierre están en el archivo completo.

## Camino corto

1. Abrí la página en [index.html](../index.html) y compará cada bloque breve de abajo.
2. Elegí Diccionario, Lecciones o Cámara en el navegador y observá el resultado visible.
3. Después seguí con la [guía para estudiantes](guia-para-estudiantes.md), que explica cómo usar Tinku sin código.

## 1. El inicio: idioma, título y conexiones

```html
<html lang="es-BO">
  <head>
    <title>Tinku — Diccionario y lecciones iniciales</title>
    <link rel="stylesheet" href="styles.css">
    <script type="module" src="src/app.js"></script>
```

- **Qué miro:** la etiqueta `html`, el título de la pestaña y dos enlaces a otros archivos.
- **Qué significa:** `lang="es-BO"` avisa que el contenido está en español de Bolivia. `link` trae el aspecto desde CSS y `script` carga JavaScript como módulo.
- **Qué pasa al usarlo:** aparece el título en la pestaña y la página queda preparada para verse y responder. HTML por sí solo no ejecuta una búsqueda ni graba: [styles.css](../styles.css) y [src/app.js](../src/app.js) hacen el resto.

## 2. Atajo y navegación

```html
<a class="skip-link" href="#lookup-input">Saltar a la búsqueda</a>
<nav class="topbar" aria-label="Navegación principal">
  <a class="brand" href="#dictionary" aria-label="Ir al diccionario de Tinku">
  <div class="nav-links" aria-label="Navegación de secciones">
    <a href="#dictionary">Diccionario</a>
    <a href="#lessons">Lecciones</a>
    <a href="#capture">Cámara</a>
```

- **Qué miro:** enlaces con `#` y un bloque `nav`.
- **Qué significa:** cada `href="#..."` apunta al `id` de una parte de esta misma página. El `aria-label` de `nav` y del enlace de marca les da un nombre accesible; `skip-link` permite saltar directo a la búsqueda con teclado. El `div` genérico de `.nav-links` también tiene `aria-label` en el código, pero ese atributo por sí solo no garantiza que se anuncie como nombre de grupo.
- **Qué pasa al usarlo:** los enlaces llevan a la sección elegida. Al navegar con Tab, CSS muestra un borde de foco visible; no es un adorno, indica dónde está el teclado.

## 3. Diccionario: categoría, palabra y resultados

```html
<label for="dictionary-category">Categoría</label>
<select id="dictionary-category" name="dictionaryCategory" aria-describedby="dictionary-selectors-help">
<label for="dictionary-word">Palabra o frase</label>
<select id="dictionary-word" name="dictionaryWord" aria-describedby="dictionary-selectors-help" disabled>
```

- **Qué miro:** dos `label` y dos listas `select`.
- **Qué significa:** `for` une el texto del rótulo con el `id` del control. La relación real es **categoría → palabra o frase**: primero se elige la categoría y recién entonces se habilita la palabra.
- **Qué pasa al usarlo:** JavaScript llena la segunda lista a partir del catálogo. Elegir una etiqueta muestra una entrada exacta; no demuestra que exista una seña LSB validada en video.

```html
<form id="lookup-form" class="lookup-form" autocomplete="off">
  <label for="lookup-input">Texto para buscar</label>
  <input
    id="lookup-input"
    name="lookup"
    type="text"
    inputmode="text"
    maxlength="160"
    placeholder="Ej.: Hola, mamá"
    aria-describedby="lookup-help"
  >
  <button type="submit">Buscar</button>
</form>
<section class="results" aria-live="polite" aria-atomic="false">
  <p id="summary" class="summary">Elegí una entrada o ingresá texto para buscar en el catálogo.</p>
  <div id="recognized-list" class="card-grid" aria-label="Resultados reconocidos"></div>
```

- **Qué miro:** un formulario, una caja de texto, un botón y el lugar donde aparecerán resultados.
- **Qué significa:** `maxlength="160"` limita el texto. `aria-describedby` conecta la caja con su ayuda. `aria-live="polite"` comunica resultados nuevos a tecnologías de asistencia sin interrumpir de golpe.
- **Qué pasa al usarlo:** al enviar, [src/app.js](../src/app.js) busca texto en el catálogo y actualiza `summary`, resultados reconocidos y palabras no encontradas. El HTML solo reserva y nombra esos lugares.

**Límite real:** el panel también contiene `sequence-video` y botones de reproducción, pero el catálogo actual no tiene videos cargados y validados: las entradas usan `videoPath: null`. Por eso puede verse “Video no disponible”; Tinku no inventa movimientos ni reproduce videos automáticamente.

## 4. Lecciones, galería y práctica

```html
<div class="lesson-gallery-controls" role="group" aria-label="Navegación de lecciones">
  <button id="previous-lesson" type="button" aria-label="Ver lecciones anteriores" disabled>Anterior</button>
  <button id="next-lesson" type="button" aria-label="Ver más lecciones" disabled>Siguiente</button>
</div>
<div id="lesson-list" class="lesson-list" role="region" tabindex="0" aria-label="Galería desplazable de lecciones por categoría" aria-describedby="lesson-gallery-help"></div>
<section class="practice-panel" aria-labelledby="practice-title" aria-live="polite">
```

- **Qué miro:** botones, una galería vacía al principio y el espacio de práctica.
- **Qué significa:** `role="group"` reúne controles relacionados; `role="region"` y `aria-label` nombran la galería. `tabindex="0"` permite enfocarla con teclado. `aria-describedby` enlaza las instrucciones para recorrerla.
- **Qué pasa al usarlo:** JavaScript crea las tarjetas desde el catálogo; CSS las acomoda horizontalmente. Los botones avanzan o retroceden. La práctica es textual y se reinicia al recargar porque no se guarda fuera de la pestaña.

## 5. Cámara: vista previa, etiqueta y guardado local

```html
<label for="custom-label">O etiqueta personalizada</label>
<input
  id="custom-label"
  name="customLabel"
  type="text"
  maxlength="80"
  placeholder="Ej.: saludo practicado por estudiante"
  aria-describedby="capture-label-help"
>
<video id="camera-preview" class="capture-video" playsinline muted hidden></video>
<button id="start-camera" type="button">Iniciar cámara</button>
<button id="start-recording" type="button" disabled>Grabar clip</button>
<p id="capture-status" class="meta" aria-live="polite">El límite de grabación es de 15 segundos para cuidar memoria del dispositivo.</p>
```

- **Qué miro:** un rótulo y campo de etiqueta, una zona de video, dos botones y un mensaje de estado.
- **Qué significa:** la etiqueta puede venir del catálogo o ser personalizada; su ayuda explica la prioridad. `hidden` oculta el video hasta que corresponda mostrarlo. `playsinline` evita forzar pantalla completa en celulares compatibles y `muted` silencia la vista previa. `aria-live` comunica cambios de estado.
- **Qué pasa al usarlo:** al elegir iniciar cámara, JavaScript pide permiso. Con una etiqueta válida puede habilitar grabar; el límite es 15 segundos para cuidar memoria. La cámara no traduce ni reconoce señas, no sube archivos y no usa backend.

```html
<video id="recorded-preview" class="capture-video" controls preload="metadata" hidden></video>
<div class="save-actions">
  <button id="save-recording" type="button" disabled>Guardar seña</button>
</div>
<section class="saved-recordings" aria-labelledby="saved-recordings-title">
  <h3 id="saved-recordings-title">Señas guardadas localmente</h3>
  <ul id="saved-recordings-list" class="saved-recordings-list" aria-live="polite"></ul>
</section>
```

- **Qué miro:** una segunda vista previa, el botón **Guardar seña** y una lista inicialmente vacía.
- **Qué significa:** `controls` pide controles nativos de reproducción. El botón permanece deshabilitado hasta que exista un clip pendiente; la lista recibe las señas guardadas y sus acciones de reproducir o eliminar. No hay enlaces ni botones de descarga en la interfaz actual.
- **Qué pasa al usarlo:** al terminar una grabación, JavaScript muestra una vista previa temporal. Solo al elegir **Guardar seña**, guarda el `Blob` del video y su metadata en IndexedDB, dentro de este navegador y este origen (por ejemplo, el mismo `http://localhost:8000` o sitio HTTPS). Después se puede listar, reproducir localmente o eliminar el registro. El navegador puede rechazar el guardado por cuota o borrar datos del sitio; antes de registrar a otra persona, corresponde obtener su consentimiento.

## Probá y observá

1. Elegí **Familia** y luego **Papá**. **Resultado esperado:** se muestra una entrada textual exacta; si buscás video, se informa que no está disponible, no aparece una seña inventada.
2. Con Tab, llegá a **Saltar a la búsqueda** o a la galería de lecciones. **Resultado esperado:** se ve el foco y el salto/galería se puede usar con teclado; los rótulos ayudan a identificar los controles.

## Para seguir

- Usar el prototipo sin código: [guía para estudiantes](guia-para-estudiantes.md).
- Ver la estructura completa: [index.html](../index.html).
- Revisar el aspecto y las acciones reales: [styles.css](../styles.css) y [src/app.js](../src/app.js).
