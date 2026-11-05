# Guía breve para explicar Tinku

Esta guía te ayuda a mostrar Tinku aunque no programes. No tenés que memorizar código ni escribirlo: señalá los archivos y explicá qué parte hace cada trabajo.

## Guion breve para decir en voz alta (alrededor de un minuto)

> Tinku es un prototipo para explorar vocabulario en texto, practicar por categorías y, si quiero, grabar un clip corto con cámara. El diccionario tiene 112 palabras o frases en 15 categorías. Por ejemplo, distingue **Papá** de Familia y **Papa** de Verduras: son entradas diferentes. Las lecciones se recorren horizontalmente y la práctica vuelve a empezar si recargo la página. La cámara es opcional: puede grabar hasta 15 segundos y después yo descargo un video y su archivo JSON con datos del clip. Tinku no reconoce señas, no traduce, no sube archivos y no confirma que los videos sean señas LSB validadas. Es una base para practicar, organizar muestras y revisarlas con personas.

## Qué hace y qué no hace

| Sí hace | No hace |
| --- | --- |
| Busca etiquetas de texto y permite elegir categoría y palabra. | No reconoce movimientos ni traduce señas a texto. |
| Organiza 112 etiquetas en 15 categorías. | No prueba que una etiqueta sea una seña LSB validada. |
| Propone práctica textual por categoría. | No guarda el avance al recargar o cerrar la página. |
| Graba, si das permiso, clips de hasta 15 segundos. | No sube clips, no crea cuentas ni los guarda permanentemente. |
| Ofrece descargar un video y su JSON. | No incluye videos LSB validados en el sitio público. |

## La idea del código: partes, aspecto y acciones

Pensalo como una maqueta escolar:

- **HTML = partes.** `index.html` nombra y ordena lo que aparece: títulos, botones, formularios y secciones.
- **CSS = aspecto.** `styles.css` decide colores, tamaños, espacios y cómo se acomodan las partes.
- **JavaScript (JS) = acciones.** `src/app.js` responde cuando alguien busca, hace clic, practica o graba.

No hace falta aprender símbolos. Para explicarlos, apuntá al archivo correcto.

### Cadena concreta: de una página a una acción

1. En `index.html`, estas líneas conectan la página con el aspecto y las acciones:

```html
    <link rel="stylesheet" href="styles.css">
    <script type="module" src="src/app.js"></script>
```

2. En `styles.css`, este comienzo define que la lista de lecciones se pueda recorrer hacia los costados:

```css
.lesson-list {
  display: grid;
  grid-auto-columns: minmax(0, min(84%, 20rem));
  grid-auto-flow: column;
  gap: 0.9rem;
  overflow-x: auto;
```

3. En `src/app.js`, JavaScript encuentra la lista de lecciones de la página:

```js
const lessonList = document.querySelector('#lesson-list');
```

4. También escucha un clic en el botón para ir a la siguiente lección:

```js
nextLessonButton.addEventListener('click', () => scrollLessonGallery(1));
```

Estos ejemplos son literales del proyecto. La última llave de CSS está más abajo en el archivo: se muestra solo el comienzo para que sea corto.

Para estudiar el código por partes, seguí este orden (podés detenerte después de cualquiera):

1. [HTML paso a paso](codigo-html-paso-a-paso.md): qué elementos forman la página.
2. [CSS paso a paso](codigo-css-paso-a-paso.md): colores, foco, galería y pantallas anchas.
3. [JavaScript: catálogo, diccionario y lecciones](codigo-js-catalogo-y-lecciones.md): búsqueda y práctica.
4. [JavaScript: cámara y descargas](codigo-js-camara-y-descargas.md): permisos, grabación y archivos locales.

### Tres palabras que podés reconocer

- `#lesson-list` significa “el elemento con ese identificador único”; en HTML aparece como `id="lesson-list"`.
- `.lesson-list` significa “los elementos de esa clase”; CSS la usa para darles aspecto y comportamiento visual.
- Una `function` es una receta con nombre: JavaScript la guarda para usarla cuando hace falta. Un `click` es el clic de una persona; `addEventListener('click', ...)` indica qué receta se ejecuta después.

## Cómo mostrar cada parte

### 1. Diccionario

Elegí una categoría y luego una palabra o frase. Mostrá que **Familia → Papá** y **Verduras → Papa** no son lo mismo: el selector usa la categoría y el identificador propio de cada entrada. La búsqueda libre ignora la tilde y puede encontrar ambas; no mira ni interpreta una seña hecha con las manos.

Si aparece “Video no disponible”, explicá la verdad: la etiqueta existe en el catálogo, pero no hay un video cargado y revisado para mostrar. No inventes una seña ni digas que un resultado fue validado por LSB.

### 2. Lecciones

Deslizá horizontalmente las tarjetas o usá **Anterior** y **Siguiente**. Elegí una categoría y respondé la práctica textual. Si recargás la página, el avance se reinicia porque vive solamente en la memoria de esa pestaña. Eso es intencional: no hay cuenta ni guardado permanente.

### 3. Cámara opcional

Usala solo si querés mostrar la captura. Elegí una categoría y una etiqueta, o escribí una etiqueta propia; después permití la cámara. El clip dura como máximo 15 segundos. Al terminar, aparecen dos descargas: **video** y **metadata JSON**. Bajá ambos archivos y revisalos con una persona antes de usarlos; el JSON describe datos del clip, no valida su significado.

## Preparación local y lista de demostración

1. En la carpeta del proyecto, ejecutá `python3 -m http.server 8000 --bind 127.0.0.1`.
2. Abrí `http://localhost:8000` en un navegador moderno.
3. Probá Diccionario con `Papá` y `Papa` en sus categorías distintas.
4. Desplazate por Lecciones, respondé una práctica y recargá para observar el reinicio.
5. Solo si hay tiempo y permiso, probá Cámara; verificá que se ofrezcan las dos descargas y explicá que requiere revisión humana.

Si usás Windows, podés probar `iniciar-tinku.bat` con Python 3 instalado; todavía no fue probado en una computadora Windows. GitHub contiene el código, pero no publica automáticamente una página web ni incluye los videos privados.

## Preguntas que pueden hacerte

**¿Tinku traduce señas?**  No. El prototipo busca etiquetas de texto, practica con texto y puede grabar clips etiquetados.

**¿La cámara reconoce si hice bien una seña?**  No. Solo graba el clip que vos decidís capturar; una etiqueta no es una evaluación automática.

**¿Los videos ya son LSB validados?**  No. El catálogo actual puede mostrar que falta video; cualquier clip debe ser revisado por personas calificadas antes de presentarlo como válido.

**¿Qué ocurre con mi grabación?**  Queda temporalmente en el navegador hasta que la reemplazás, recargás o cerrás la página. Descargarla no borra la vista previa. Nada se sube automáticamente. Para conservarla, descargá el video y el JSON.

**¿Por qué se borra la práctica al recargar?**  Porque el avance se mantiene solo en la memoria de la pestaña. Así el prototipo no crea perfiles ni guarda progreso permanente.

## Para cerrar tu explicación

Decí qué viste, no lo que imaginás: “Mostré una etiqueta de texto, una práctica que se reinicia y una captura opcional descargable”. Si alguien pregunta por una seña o por la calidad de un video, la respuesta responsable es que hace falta revisión humana.
