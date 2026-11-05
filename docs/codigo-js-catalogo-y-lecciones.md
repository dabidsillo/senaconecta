# JavaScript: catálogo, diccionario y lecciones

Este recorrido explica cómo Tinku organiza etiquetas de texto y responde a acciones de la página. No traduce ni reconoce señas: usa el catálogo público de palabras y frases.

## Mapa rápido

```text
catálogo compartido ──> búsqueda y diccionario ──> resultados de texto
        │
        └──────────────> lecciones ──> práctica temporal
                                      │
galería: botones y eventos ──────────┴──> desplazamiento y foco
```

- Un **módulo** es un archivo JS que comparte una tarea con otro mediante `export` e `import`.
- `const` crea un nombre que no se reasigna; una **array** es una lista ordenada.
- Una `function` es una receta con nombre. `if` decide según una condición y `return` entrega un resultado.
- Un **evento** es algo que ocurre en la página: enviar, hacer clic, desplazar o cambiar tamaño.

## 1. Un catálogo compartido, sin videos inventados

`src/catalog.mjs` convierte las categorías y sus listas en `STARTER_CATALOG`: 45 entradas de texto en 9 categorías. La misma lista alimenta diccionario, búsqueda y lecciones.

**`src/catalog.mjs` — extracto exacto**

```js
function createEntry(category, displayLabel) {
  return Object.freeze({
    id: stableId(category, displayLabel),
    label: normalizeText(displayLabel),
    displayLabel,
    category,
    aliases: Object.freeze([]),
    description: 'Vocabulario provisto por usuarios; seña y video pendientes de validación.',
    videoPath: null,
    validationStatus: 'placeholder'
  });
}
```

**Omisión explícita:** arriba está `stableId` y debajo se crea toda la lista; no se muestran para mirar una entrada a la vez.

`Object.freeze` evita cambios accidentales. `displayLabel` es el texto visible y `label` es la forma preparada para buscar. El `id` combina categoría y etiqueta para identificar la entrada. `videoPath: null` significa que no hay ruta de video: no confirma una seña LSB ni oculta un video validado.

`export const STARTER_CATALOG` comparte la array con otros módulos. Su creación recorre cada categoría y cada etiqueta para llamar a `createEntry`.

### Probalo: una entrada

1. Abrí Diccionario, elegí una categoría y luego una palabra o frase.
2. Mirá su nombre, categoría y estado de video.

**Resultado esperado:** aparece una entrada textual; no una reproducción ni una validación de señas.

## 2. Búsqueda: normalizar y preferir frases largas

Para buscar, el programa quita tildes, usa minúsculas, recorta espacios y separa palabras. Eso permite buscar sin exigir la misma mayúscula o tilde, aunque la etiqueta visible se conserva.

**`src/catalog.mjs` — extracto exacto**

```js
export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-BO')
    .trim();
}

export function tokenizeText(value) {
  return normalizeText(value).match(WORD_PATTERN) ?? [];
}
```

`String(value ?? '')` garantiza texto aun si falta un valor. `?? []` devuelve una array vacía si no hay palabras.

**Pseudocódigo — no es código para pegar ni ejecutar**

```text
para cada posición de la lista de palabras:
  probar desde la frase posible más larga hasta una sola palabra
  si una frase aparece en el catálogo: agregar sus entradas y avanzar esa cantidad
  si no aparece: agregar esa palabra a “desconocidas” y avanzar una posición
```

La búsqueda de frase larga reconoce, por ejemplo, `Lo siento` o `Por favor` antes que separar esas palabras. El orden escrito se conserva. Las etiquetas visibles conservan sus tildes, aunque la búsqueda no las exige.

**`src/app.js` — extractos exactos; líneas intermedias omitidas**

```js
form.addEventListener('submit', (event) => {
  event.preventDefault();
  resetDictionarySelectors();
  renderResult(input.value);
});
```

```js
function renderResult(inputText) {
  const result = lookupText(inputText);
```

Al enviar, el evento toma lo escrito y llama a `renderResult`; esta llama a `lookupText`. Después el resultado se dibuja creando nodos y usando `textContent`, así el texto ingresado no se interpreta como HTML. Los videos solo se preparan desde rutas declaradas; con `videoPath: null` no hay video para reproducir.

### Probalo: frase y desconocida

1. Buscá `Lo siento, misterio` y enviá el formulario.
2. Revisá reconocidas y desconocidas.

**Resultado esperado:** reconoce la frase real `Lo siento` y deja `misterio` como desconocida.

## 3. Selector: categoría más ID exacto

El selector primero limita por categoría y luego exige que el identificador coincida. Así, **Familia → Papá** y **Saludos → Lo siento** son elecciones exactas del catálogo actual.

**`src/dictionary-select.mjs` — extracto exacto**

```js
export function resolveDictionaryEntry(category, entryId, catalog = STARTER_CATALOG) {
  return catalog.find((entry) => entry.category === category && entry.id === entryId) ?? null;
}
```

`find` recorre la array. El `&&` exige categoría **e** identificador. `return` entrega la entrada o `null` si no existe: un ID de Familia no sirve dentro de Saludos.

**`src/app.js` — extracto exacto**

```js
dictionaryWordSelect.addEventListener('change', () => {
  const entry = resolveDictionaryEntry(dictionaryCategorySelect.value, dictionaryWordSelect.value);
  if (!entry) {
    renderResult('');
    summary.textContent = `Elegí una palabra o frase de ${formatCategoryLabel(dictionaryCategorySelect.value)}.`;
    return;
  }

  renderSelectedDictionaryEntry(entry);
});
```

**Omisión explícita:** el manejador anterior, para cambiar categoría, recarga sus opciones y borra la selección de palabra. Este bloque muestra el siguiente evento.

`addEventListener('change', ...)` espera un cambio. El `if` atiende una selección vacía y el `return` evita continuar. Si hay entrada, `renderSelectedDictionaryEntry` muestra esa elección exacta, no ejecuta una búsqueda textual.

El dibujo de resultados crea nodos y pone etiquetas con `textContent`; por eso el texto ingresado no se interpreta como HTML. El catálogo actual tiene `videoPath: null`, de modo que no hay video para reproducir.

### Probalo: dos selecciones exactas

1. Elegí **Familia → Papá**.
2. Cambiá a **Saludos** y elegí **Lo siento**.

**Resultado esperado:** la lista de palabra se reinicia al cambiar categoría y cada selección muestra su categoría correcta.

## 4. Lecciones: misma lista, progreso en memoria

`src/lessons.mjs` agrupa el catálogo compartido. Crea una lección por categoría con dos o más entradas, por lo que las lecciones también reúnen las 45 etiquetas en 9 categorías.

**Pseudocódigo — no es código para pegar ni ejecutar**

```text
agrupar las entradas del catálogo por categoría
conservar solamente grupos con dos o más entradas
convertir cada grupo en una lección con título, resumen y sus mismas entradas
```

Una sesión guarda `currentIndex`, aciertos, intentos, finalización y el último resultado solo mientras la pestaña está abierta.

**`src/lessons.mjs` — extracto exacto de `answerPracticeStep`**

```js
  const correct = selectedEntryId === prompt.answerId;
  const lastStep = session.currentIndex >= lesson.entries.length - 1;
  const nextIndex = correct && !lastStep ? session.currentIndex + 1 : session.currentIndex;
  const completed = correct && lastStep;
```

**Omisión explícita:** estas líneas están dentro de la función; antes obtiene `prompt` y después devuelve una nueva sesión.

Si la respuesta es incorrecta, conserva el índice. Si es correcta y no es la última, avanza; el último acierto marca finalizada la sesión.

**`src/app.js` — extracto exacto**

```js
button.addEventListener('click', () => {
  const result = answerPracticeStep(practiceSession, selectedLesson, option.id);
  practiceSession = result.nextSession;
  renderPractice();
});
```

El evento de clic pide el nuevo estado y redibuja la práctica. Recargar crea de nuevo esa memoria, por eso el avance se reinicia y no queda guardado.

### Probalo: error, acierto y recarga

1. Elegí una lección y respondé una opción incorrecta.
2. Elegí la correcta y después recargá la página.

**Resultado esperado:** el error mantiene el paso, el acierto avanza y la recarga borra el progreso de la sesión.

## 5. Galería: límites, eventos y foco

La galería separa cálculo y pantalla. `src/lesson-gallery.mjs` es un módulo puro: recibe números y devuelve un destino; `src/app.js` mide tarjetas y desplaza la página.

**`src/lesson-gallery.mjs` — extracto exacto**

```js
  if (direction > 0) {
    return offsets.find((offset) => offset > boundaries.scrollLeft + safeTolerance) ?? boundaries.maxScrollLeft;
  }

  if (direction < 0) {
    return [...offsets].reverse().find((offset) => offset < boundaries.scrollLeft - safeTolerance) ?? 0;
  }
```

**Omisión explícita:** antes, `getNextGalleryTarget` calcula límites y ordena posiciones de tarjetas. Este final elige adelante, atrás o un borde.

El primer `if` busca el siguiente desplazamiento y el segundo, con la lista invertida, el anterior. Si no encuentra tarjeta, `??` devuelve el final o `0`. Una tolerancia pequeña evita errores de redondeo cerca de un borde.

**`src/app.js` — extracto exacto**

```js
previousLessonButton.addEventListener('click', () => scrollLessonGallery(-1));
nextLessonButton.addEventListener('click', () => scrollLessonGallery(1));
lessonList.addEventListener('scroll', syncLessonGalleryControls, { passive: true });
window.addEventListener('resize', syncLessonGalleryControls);
```

Los clics piden atrás o adelante. Los eventos `scroll` y `resize` revisan los límites para activar o desactivar controles. Al reiniciar una práctica desde una tarjeta, la aplicación puede devolver el foco al botón seleccionado para no perder la ubicación con teclado.

### Probalo: extremos y foco

1. Usá **Siguiente** hasta la última tarjeta y luego **Anterior**.
2. Elegí una práctica usando teclado.

**Resultado esperado:** avanza una tarjeta por vez, no pasa el extremo y el foco queda en la acción elegida. Esta lógica no sustituye una prueba visual en navegador.

## Qué verifican las pruebas automáticas

`tests/catalog.test.mjs`, `tests/dictionary-select.test.mjs`, `tests/lessons.test.mjs` y `tests/lesson-gallery.test.mjs` comprueban reglas de módulos: inventario, frases, IDs, progreso y límites. Son pruebas automáticas de JavaScript; no prueban la apariencia del navegador ni que exista o sea válido un video.

Volvé a la [guía para estudiantes](guia-para-estudiantes.md) o seguí con [HTML paso a paso](codigo-html-paso-a-paso.md) y [CSS paso a paso](codigo-css-paso-a-paso.md).
