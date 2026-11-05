# CSS de Tinku, paso a paso

Esta guía explica cómo `styles.css` da aspecto a la página real. **CSS organiza colores, tamaños, espacios y posiciones; no carga datos, no busca, no graba ni guarda registros.** Esas acciones son de JavaScript. Los ejemplos reúnen líneas reales de `styles.css`, pero omiten algunas líneas intermedias: son recortes para leer, no reglas completas para copiar.

## Camino corto

1. Abrí [index.html](../index.html) y después [styles.css](../styles.css).
2. Elegí una parte visible y buscá su clase en CSS.
3. Cambiá algo en una copia local y mirá el resultado.

## Dos señales para leer CSS

- Un punto, como `.lesson-list`, significa «elemento con esta clase»: en HTML, `class="lesson-list"`.
- Un numeral, como `#lesson-list`, significa «el elemento con este identificador único»: en HTML, `id="lesson-list"`.

Una regla tiene un selector y llaves. Si varias reglas cambian una misma propiedad, la **cascada** decide según cuál selector es más específico y cuál aparece después. Buscá primero el selector y luego la propiedad.

## 1. Base: colores y cajas
```css
:root {
  --bg: #f6f1e8;
  --surface: #fffaf1;
  --ink: #21180f;
  --brand: #8b3f1f;
  --accent: #f3b44b;
  --content-max: 1120px;
  --page-gutter: clamp(1rem, 4vw, 4rem);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
```
- **Qué ves:** variables, colores y fuentes. **Qué significa:** `var(--brand)` reutiliza un valor y `clamp(...)` limita el espacio según el ancho. **Qué pasa:** distintas partes comparten colores y márgenes.

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  background:
    radial-gradient(circle at top left, rgb(243 180 75 / 28%), transparent 32rem),
    linear-gradient(180deg, #fff9ee 0%, var(--bg) 48%, #efe4d4 100%);
  color: var(--ink);
}
```
- **Qué ves:** `*` apunta a todos los elementos y `body` a la página visible. **Qué significa:** `border-box` incluye relleno y borde; `margin: 0` quita el margen inicial. **Qué pasa:** aparece un fondo con degradados y tamaños predecibles.

## 2. Botones y foco de teclado
```css
button {
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: var(--brand);
  color: #fff;
  cursor: pointer;
  transition: transform 140ms ease, box-shadow 140ms ease, background 140ms ease;
}

button:hover,
button:focus-visible {
  background: var(--brand-strong);
  transform: translateY(-1px);
}
```
- **Qué ves:** una regla general y otra para `:hover` y `:focus-visible`. **Qué significa:** `hover` es el puntero encima; `focus-visible` muestra foco, por ejemplo con Tab. **Qué pasa:** los botones son altos, redondeados y cambian al señalarse o enfocarse.

```css
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}
```
- **Qué ves:** el mismo borde de foco para controles de teclado. **Qué significa:** `outline` se dibuja por fuera y `outline-offset` lo aleja. **Qué pasa:** Tab marca dónde está el teclado; la guía no evalúa su contraste en una pantalla o navegador real.

## 3. Barra, paneles y tarjetas
```css
.topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  overflow-x: auto;
  padding: 0.75rem var(--page-gutter);
}
```
- **Qué ves:** la clase de la barra; es un recorte parcial. **Qué significa:** `sticky` la mantiene arriba, `flex` ordena una fila y `overflow-x: auto` permite desplazarla si falta lugar. **Qué pasa:** la navegación se adapta a poco ancho.

```css
.panel {
  border: 1px solid var(--line);
  border-radius: 1.5rem;
  background: rgb(255 250 241 / 88%);
  box-shadow: var(--shadow);
  padding: var(--panel-padding);
}

.card-grid {
  display: grid;
  gap: 0.9rem;
}
```
- **Qué ves:** una receta para `panel` y otra para tarjetas. **Qué significa:** `grid` ordena cajas y `gap` deja espacio. **Qué pasa:** diccionario, lecciones y cámara se ven como paneles; CSS no decide cuáles tarjetas existen ni carga datos.

## 4. Lecciones: fila horizontal

Antes de la lista, `.lessons-panel { min-width: 0; }` permite que la sección mantenga el ancho de la página aunque tenga 15 tarjetas. Así se desplaza **la galería**, no toda la página.

```css
.lesson-list {
  display: grid;
  min-inline-size: 0;
  max-inline-size: 100%;
  grid-auto-columns: clamp(15rem, 72vw, 20rem);
  grid-auto-flow: column;
  gap: 0.9rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}

.lesson-card {
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```
- **Qué ves:** clases de la galería `id="lesson-list"` y sus tarjetas; es un recorte parcial. **Qué significa:** cada columna mide por lo menos `15rem`, usa `72vw` como tamaño adaptable al ancho de la ventana y no supera `20rem`; los límites en línea contienen la lista. El desplazamiento y `scroll-snap` se conservan. **Qué pasa:** se recorren horizontalmente; JavaScript crea las tarjetas y CSS las presenta.

## 5. Cámara y descargas
```css
.camera-grid {
  display: grid;
  gap: 1rem;
}

.download-button {
  display: inline-flex;
  min-height: 44px;
  border-radius: 999px;
  background: var(--success);
  color: #fff;
  text-decoration: none;
}
```
- **Qué ves:** una cuadrícula para cámara y una clase para enlaces de descarga. **Qué significa:** `inline-flex` acomoda contenido como botón sin dejar de ser enlace. **Qué pasa:** reciben forma y tamaño; CSS no pide cámara, graba ni crea archivos.

## 6. Pantalla ancha y menos movimiento
```css
@media (min-width: 720px) {
  .dictionary-selector-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .camera-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
```
- **Qué ves:** una regla `@media` interna; es un recorte parcial. **Qué significa:** una *media query* pregunta una condición; desde 720 píxeles, `1fr` reparte el espacio en dos columnas. **Qué pasa:** selectores y cámara se ven lado a lado; en pantallas angostas siguen las reglas anteriores.

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```
- **Qué ves:** una media query de movimiento. **Qué significa:** si el sistema pide menos movimiento, el desplazamiento suave de `html` pasa a `auto`. **Qué pasa:** los saltos de la página dejan de pedir desplazamiento suave; esta regla no elimina las transiciones de los botones ni cambia por sí sola la galería.

## Probá y observá
1. Abrí Tinku y presioná Tab hasta un enlace, campo o botón. **Resultado esperado:** aparece un borde de foco color acento alrededor del control enfocado.
2. Achicá y ensanchá la ventana alrededor de 720 píxeles y recorré Lecciones. **Resultado esperado:** la cámara pasa entre una y dos columnas según el ancho; las tarjetas se desplazan hacia los costados y se detienen en tarjetas.

## Para seguir
- Ver las partes que reciben clases e identificadores: [HTML paso a paso](codigo-html-paso-a-paso.md).
- Usar Tinku sin programar: [guía para estudiantes](guia-para-estudiantes.md).
- Ver el archivo completo: [styles.css](../styles.css).
