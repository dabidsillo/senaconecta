# JavaScript: cámara, clips y descargas

Esta guía sigue el recorrido de la cámara de Tinku sin pedirte que memorices JavaScript. Vas a poder explicar qué se necesita para grabar, qué datos acompaña al clip y por qué nada se sube solo. Leela junto con la [guía para estudiantes](guia-para-estudiantes.md).

## Mapa corto
El navegador comprueba si puede pedir cámara y grabar video. Con permiso, guarda una transmisión activa y habilita los botones correctos. Una etiqueta del catálogo identifica el clip; una etiqueta escrita por la persona tiene prioridad. Al empezar, la etiqueta queda fija; al terminar se preparan un video y un JSON para descargar. Al recargar, cerrar o iniciar otra captura, se libera la memoria temporal.

> **Límite importante:** esto no reconoce señas, no traduce, no valida una seña LSB y no sube archivos. Una etiqueta dice qué se quiso registrar; la revisión humana decide después si el clip es útil.

## Antes de tocar la cámara: soporte, localhost y permiso

La página se abre con `src/app.js`, pero las decisiones pequeñas y comprobables viven en `src/capture.mjs`. Primero se revisan dos herramientas del navegador: `getUserMedia`, que puede pedir una cámara, y `MediaRecorder`, que puede convertir la transmisión en video.

**Extracto literal de `src/capture.mjs` (`getCaptureSupport`; se omitió el `return` final de soporte correcto):**

```js
const mediaDevices = navigatorRef?.mediaDevices;
const MediaRecorderCtor = environment.MediaRecorder;

if (!mediaDevices?.getUserMedia) {
  return {
    supported: false,
    reason: 'getUserMedia-unavailable',
    message: 'Este navegador no ofrece acceso a cámara con getUserMedia.'
  };
}

if (typeof MediaRecorderCtor !== 'function') {
  return {
    supported: false,
    reason: 'mediaRecorder-unavailable',
    message: 'Este navegador permite cámara, pero no puede grabar video con MediaRecorder.'
  };
}
```

No es una promesa de que la cámara vaya a abrirse: solo comprueba que el navegador ofrece esas herramientas. Al presionar **Iniciar cámara**, el navegador pide permiso. Para esa petición suele hacer falta un contexto seguro: `https` o `localhost`. Por eso el README propone abrir el proyecto con un servidor local, por ejemplo `http://localhost:8000`, y no directamente como `file://`.

El pedido real usa video y desactiva el audio. Si una persona rechaza el permiso o el contexto no es seguro, la aplicación muestra una explicación; no intenta grabar a escondidas.

**Extracto literal de `src/app.js` (`startCamera`; se omitió el manejo completo de errores):**

```js
stream = await navigator.mediaDevices.getUserMedia({
  audio: false,
  video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } }
});

activeStream = stream;
cameraPreview.srcObject = stream;
await cameraPreview.play();
```

## Cámara activa y estados de los botones

`activeStream` es la cámara que quedó abierta en esta pestaña. Mientras se solicita permiso, el botón dice **Iniciando cámara…**. Con una transmisión activa dice **Detener cámara**. El botón de grabar solo se habilita cuando hay cámara, soporte y una etiqueta válida.

**Extracto literal de `src/capture.mjs` (`getCaptureControlState`):**

```js
camera: {
  label: cameraRequestPending ? 'Iniciando cámara…' : hasActiveStream ? 'Detener cámara' : 'Iniciar cámara',
  disabled: !captureIsSupported || cameraRequestPending || recorderIsBusy
},
recording: {
  label: isFinalizing ? 'Preparando clip…' : isRecording ? 'Detener clip' : 'Grabar clip',
  disabled: isFinalizing || (!isRecording && (!captureIsSupported || !hasActiveStream || !labelIsReady))
}
```

No hace falta seguir cada signo. La idea es evitar combinaciones confusas: no se detiene la cámara mientras el grabador está ocupado y no se inicia un clip sin una etiqueta. Cuando se está preparando el resultado, ambos controles esperan para no mezclar acciones.

## Elegir el nombre: catálogo primero, etiqueta propia después

En la pantalla se puede elegir **categoría → palabra o frase** del catálogo. Eso conserva tanto el texto como `catalogId`, el identificador exacto de la entrada. También existe una etiqueta personalizada. Si hay texto personalizado, gana sobre la selección del catálogo; puede usarse incluso sin categoría.

**Extracto literal de `src/capture.mjs` (`resolveCaptureLabel`):**

```js
const cleanedCustomLabel = normalizeCustomLabel(customLabel);
if (cleanedCustomLabel) {
  return { label: cleanedCustomLabel, source: 'custom', catalogId: null };
}

if (catalogId && cleanedCatalogLabel) {
  return { label: cleanedCatalogLabel, source: 'catalog', catalogId };
}
```

Esta prioridad es deliberada: una persona que escribe una corrección o una descripción distinta no queda atada a lo que había seleccionado antes. La etiqueta propia se limpia de espacios repetidos y se limita a 80 caracteres; no verifica el significado de una seña.

### Ejemplo concreto: Familia → Papá

Elegí **Familia** y luego **Papá**; no escribas nada en “etiqueta personalizada”. Al iniciar, el clip queda asociado a `label: "Papá"`, `labelSource: "catalog"` y al `catalogId` propio de Papá. Para una fecha de ejemplo `2024-01-02T03:04:05.006Z`, el nombre base seguro tendría esta forma: `tinku-capture-papa-2024-01-02T03-04-05-006Z`. La pareja descargable usa el mismo base: `… .webm` (o `.mp4`, si ese fue el formato) y `… .json`.

El nombre de archivo elimina tildes para que sea más compatible, pero el JSON conserva `Papá`. No confundas **Familia → Papá** con **Verduras → Papa**: se distinguen por categoría e identificador. Tampoco escribas una etiqueta propia `Papa` si querías conservar el vínculo del catálogo con **Papá**; una etiqueta propia reemplaza ese vínculo y deja `catalogId` en `null`.

## Congelar la etiqueta al comenzar

La persona podría cambiar un selector mientras el video se está grabando. Para que el JSON no describa el clip con un nombre posterior, `startRecording` crea una copia fija antes de empezar.

**Extracto literal de `src/app.js` (`startRecording`; se omitieron comprobaciones y manejo de errores):**

```js
const resolvedLabel = currentResolvedLabel();
const recordingLabel = freezeResolvedLabel(resolvedLabel);
activeRecordingLabel = recordingLabel;

recordingStartedAt = new Date();
mediaRecorder.start();
```

“Congelada” significa que esa copia ya no cambia aunque alguien modifique categoría, palabra o campo de texto después. No es una firma, ni una validación automática, ni consentimiento: es una protección para que video y metadata sigan hablando del mismo momento.

## Grabar sin audio, detener a mano o a los 15 segundos

La cámara se pide con `audio: false`. Además, para una transmisión sin pistas de audio, el programa elige solamente tipos MIME que no declaran un códec de audio. Esto busca un video silencioso; el formato exacto depende de lo que soporte el navegador.

**Extracto literal de `src/capture.mjs` (`chooseSupportedMimeType`; se omitió la lista de formatos candidatos):**

```js
const safeCandidates = hasAudio
  ? candidates
  : candidates.filter((type) => !mimeTypeDeclaresAudio(type));

return safeCandidates.find((type) => isTypeSupported.call(mediaRecorder, type)) ?? '';
```

El botón **Detener clip** llama a la detención manual. Si nadie lo presiona, un temporizador pide detener la grabación a los 15 000 milisegundos, es decir, 15 segundos.

**Extracto literal de `src/app.js` (`startRecording`; temporizador completo):**

```js
recordingLimitTimer = window.setTimeout(() => {
  if (mediaRecorder === recorder && recorder.state === 'recording' && isCurrentRecordingSession(sessionId, {
    activeSessionId: recordingSessionId,
    cleanupSessionId,
    pendingTimeoutSessionId: timedOutSessionId
  })) {
    safeStopRecorder('Se alcanzó el límite de 15 segundos y la grabación se detuvo automáticamente.');
  }
}, DEFAULT_RECORDING_LIMIT_MS);
```

También hay protecciones para sesiones viejas o eventos tardíos: cada grabación recibe un número, el evento `stop` se acepta solo si pertenece al grabador actual y hay una espera de hasta tres segundos para que el navegador confirme el final. Si no confirma, no se prepara un clip parcial. Es mejor pedir reintentar que ofrecer un archivo dudoso.

## Del video temporal al video y JSON descargables

Cuando llega el final correcto, los pedacitos de video se unen en un `Blob`. Luego se crea un objeto con datos como etiqueta, `catalogId`, tipo MIME, tamaño, duración y fechas. Ese objeto declara explícitamente `upload: "none"`.

**Extracto literal de `src/capture.mjs` (`buildCaptureMetadata`; se omitieron otros campos):**

```js
return {
  purpose: 'training-and-evaluation-sample',
  warning: 'Esta captura etiquetada no es una traducción ni reconocimiento automático de señas.',
  label: resolvedLabel?.label ?? '',
  catalogId: resolvedLabel?.catalogId ?? null,
  storage: 'browser-memory-until-explicit-download',
  upload: 'none'
};
```

**Extracto literal de `src/app.js` (`finishRecording`; se omitieron asignaciones de vista previa):**

```js
const videoBlob = new Blob(recordedChunks, { type: selectedMimeType || 'video/webm' });
const metadataBlob = createMetadataBlob(metadata);

recordingObjectUrl = URL.createObjectURL(videoBlob);
metadataObjectUrl = URL.createObjectURL(metadataBlob);
```

Esas URL temporales alimentan la vista previa y los dos enlaces: **Descargar video** y **Descargar metadata JSON**. Descargar copia un archivo al lugar que elija el navegador; no borra la vista previa, porque la página todavía conserva sus URL y `Blob` temporales para que puedas mirar el resultado y revisar el JSON.

## Palabras nuevas, en simple

- **Blob:** una caja temporal de datos en memoria. Aquí puede contener el video o el texto JSON antes de la descarga.
- **JSON:** texto ordenado con pares de nombre y valor, útil para acompañar el video con datos como `label` y `catalogId`.
- **Evento:** aviso de que algo ocurrió, como llegar un fragmento de video o terminar el grabador.
- **MIME:** etiqueta técnica que indica el tipo de contenido, por ejemplo `video/webm` o `application/json`.

## Liberar memoria al reemplazar, recargar o cerrar

Al iniciar otra grabación, la aplicación libera las URL del clip anterior y borra su vista previa. Si solo presionás **Detener cámara**, el clip ya preparado y sus descargas siguen disponibles mientras la página permanece abierta. Al recargar o salir de la página, se detienen las pistas y se liberan la vista previa y los archivos temporales. Por eso hay que descargar los dos archivos antes de recargar o cerrar si querés conservarlos.

**Extracto literal de `src/app.js` (`revokeCaptureUrls`):**

```js
if (recordingObjectUrl) {
  URL.revokeObjectURL(recordingObjectUrl);
  recordingObjectUrl = null;
}
if (metadataObjectUrl) {
  URL.revokeObjectURL(metadataObjectUrl);
  metadataObjectUrl = null;
}
```

Esto no borra un archivo que ya descargaste. Solo suelta la referencia temporal que la pestaña usaba. El README también indica que los videos locales revisados pertenecen a `videos/`, una carpeta ignorada por Git: no se publican automáticamente en GitHub ni el sitio los recibe por esa vía.

## Revisión humana y cuidado de las personas

Antes de reutilizar un clip, una persona competente debe revisarlo: encuadre, etiqueta, contexto y si corresponde presentarlo como una seña. En el caso de menores, no grabes ni compartas material sin la autorización informada de su madre, padre, tutor o responsable según las reglas de la institución. El programa no puede comprobar ese permiso ni validar una seña por vos.

## Ejercicio sin cámara

Sin grabar ni pedir permiso, elegí en la interfaz **Familia → Papá** y explicá en una hoja qué esperás encontrar en los dos archivos: un video y un JSON con la etiqueta `Papá`, una fuente `catalog` y su `catalogId`. Después cambiá mentalmente a la etiqueta propia `Papa` y señalá dos diferencias: reemplazaría al catálogo y no tendría `catalogId`. Resultado esperado: podés distinguir el nombre visible, el identificador del catálogo y un nombre de archivo sin tilde sin afirmar que hubo reconocimiento o una seña validada.

## Seguí el recorrido

- Para entender la página donde están los botones, leé [HTML paso a paso](codigo-html-paso-a-paso.md).
- Para cámara, descargas y límites desde el uso cotidiano, volvé a la [guía para estudiantes](guia-para-estudiantes.md).
- Para catálogo, búsqueda y práctica, continuá con [JavaScript: catálogo, diccionario y lecciones](codigo-js-catalogo-y-lecciones.md).
