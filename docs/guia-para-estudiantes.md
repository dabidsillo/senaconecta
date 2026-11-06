# Guía breve para explicar Tinku

Esta guía te ayuda a mostrar Tinku aunque no programes. No tenés que memorizar código ni escribirlo: explicá lo que la página hace y también sus límites.

## Guion breve para decir en voz alta

> Tinku es un prototipo para explorar vocabulario, practicar por categorías y, si quiero, grabar un clip corto con cámara. Tiene 45 entradas en 9 categorías, cada una con un video WebM VP8 del catálogo. La persona propietaria declaró revisadas las señas y autorizada su publicación; esta herramienta no hizo una verificación lingüística independiente y no hay un despliegue real. La práctica vuelve a empezar si recargo. Si grabo un clip, puedo elegir **Guardar seña** para conservarlo solo en este navegador; después lo puedo reproducir o eliminar. Tinku no reconoce señas, no traduce ni sube esos clips.

## El catálogo que se puede mostrar

| Categoría | Etiquetas exactas |
| --- | --- |
| ALIMENTOS | Arroz, Café, Fideo, Leche, Pan |
| ANIMALES | Cóndor, Gallina, Gato, Perro, Vaca |
| COLORES | Amarillo, Azul, Rojo, Verde |
| DEPARTAMENTOS | Beni, La Paz, Oruro, Potosí, Santa Cruz |
| DÍAS DE LA SEMANA | Jueves, Lunes, Martes, Miércoles, Viernes |
| FAMILIA | Bebé, Hija, Hijo, Mamá, Papá |
| FRUTAS | Guineo, Manzana, Naranja, Piña, Plátano |
| LUGARES | Baño, Casa, Escuela, Hospital, Mercado |
| SALUDOS | Chau, Gracias, Hola, Lo siento, Por favor, Te amo |

## Qué hace y qué no hace

| Sí hace | No hace |
| --- | --- |
| Busca etiquetas de texto y permite elegir categoría y palabra. | No reconoce movimientos ni traduce señas a texto. |
| Organiza 45 entradas con videos WebM VP8 en 9 categorías. | No verifica independientemente que un video sea una seña LSB válida ni afirma despliegue real. |
| Muestra un video público del catálogo y propone respuestas de texto por categoría. | No guarda el avance de práctica al recargar o cerrar la página. |
| Graba, si das permiso, clips de hasta 15 segundos. | No descarga video ni JSON, no sube clips y no crea cuentas. |
| Guarda un clip solo al pulsar **Guardar seña**. | No lo agrega automáticamente al catálogo ni lo comparte. |
| Permite reproducir o eliminar los clips guardados. | No agrega esos clips de Mis señas al catálogo ni los valida. |

## La idea del código: partes, aspecto y acciones

Pensalo como una maqueta escolar:

- **HTML = partes.** `index.html` nombra y ordena títulos, botones, formularios y secciones.
- **CSS = aspecto.** `styles.css` decide colores, tamaños, espacios y cómo se acomodan las partes.
- **JavaScript (JS) = acciones.** `src/app.js` responde cuando alguien busca, practica, graba, guarda, reproduce o elimina.

Para estudiar el código por partes, seguí este orden:

1. [HTML paso a paso](codigo-html-paso-a-paso.md): qué elementos forman la página.
2. [CSS paso a paso](codigo-css-paso-a-paso.md): colores, foco, galería y pantallas anchas.
3. [JavaScript: catálogo, diccionario y lecciones](codigo-js-catalogo-y-lecciones.md): búsqueda y práctica.
4. [JavaScript: cámara y descargas](codigo-js-camara-y-descargas.md): permisos, grabación y archivos locales.

El último enlace conserva su nombre para no romper la ruta; en la interfaz actual el flujo es guardar localmente, no descargar archivos.

## Cómo mostrar cada parte

### 1. Diccionario

Elegí una categoría y una etiqueta, por ejemplo **Familia → Papá**. También podés usar los ejemplos sugeridos `Hola, mamá`, `Lo siento, papá` y `Por favor, amigo`; `amigo` muestra cómo se ve una palabra que no está en el catálogo. La búsqueda no interpreta una seña hecha con las manos ni guarda lo que escribís.

Al elegir una entrada, por ejemplo Familia → Papá, aparece su video del catálogo y podés usar los controles para reproducirlo. Los 45 WebM tienen revisión LSB y permiso de publicación declarados por la persona propietaria; no digas que esta herramienta lo verificó independientemente ni que el sitio ya está desplegado. “Video no disponible” sigue siendo un respaldo genérico si falta un archivo.

Si ya guardaste un clip y buscás su etiqueta por texto, puede aparecer una zona azul separada llamada **Mis señas**. Cada tarjeta tiene controles nativos de video para reproducir su propio clip; el navegador prepara los clips cercanos de forma diferida. Cada uno sigue siendo local y sin validar: no se agrega al catálogo, no cambia las categorías, ni vuelve correcta una seña. Si la misma etiqueta existe en el catálogo, se muestran por separado el resultado con video del catálogo y cada clip local.

Al elegir **Reproducir frase**, la frase sigue el orden escrito. Solo en ese momento puede usar como respaldo el clip local más reciente de una etiqueta exacta que no tenga video público reproducible; un video público siempre tiene prioridad. Ese clip local no se lee durante la búsqueda y sigue sin validar. Si falta, el almacenamiento falla o el navegador no puede decodificarlo, la frase se detiene y no salta a otra seña.

### 2. Lecciones

Deslizá horizontalmente las tarjetas o usá **Anterior** y **Siguiente**. Elegí una categoría, reproducí el video público de la seña y recién entonces elegí una respuesta de texto. Si falta o falla el video, no aparecen respuestas para evitar adivinar sin ver una seña. Si recargás la página, el avance se reinicia porque vive solamente en la memoria de esa pestaña. Eso es intencional: no hay cuenta ni perfil.

### 3. Cámara y guardado local

Usala solo si querés mostrar la captura. Elegí, por ejemplo, `Familia` y `Papá`, o escribí una etiqueta propia; después permití la cámara. El clip dura como máximo 15 segundos. Cuando termina, primero aparece una vista previa temporal. Elegí **Guardar seña** solo si querés conservarlo.

Al guardar, el clip y su etiqueta quedan en IndexedDB del mismo navegador y origen. Recargar no lo borra normalmente: aparece en la lista para **Reproducir** o **Eliminar** y, cuando coincide con una búsqueda libre, en **Mis señas** dentro del Diccionario. No se sube, no se descarga como video o JSON y no pasa al catálogo.

No es una copia portable: otro dominio, navegador, perfil, computadora o dispositivo no la recibe. El navegador puede rechazar el guardado por falta de espacio o borrar datos por sus reglas de privacidad, al limpiar datos del sitio o por evicción de almacenamiento. Pedí consentimiento antes de grabar a otra persona, especialmente si es menor de edad.

## Preparación local y lista de demostración

1. En la carpeta del proyecto, ejecutá `python3 -m http.server 8000 --bind 127.0.0.1`.
2. Abrí `http://localhost:8000` en un navegador moderno.
3. Probá Diccionario con `Papá` y los ejemplos sugeridos `Hola, mamá`, `Lo siento, papá` y `Por favor, amigo`.
4. Desplazate por Lecciones, respondé una práctica y recargá para observar el reinicio.
5. Solo si hay tiempo y permiso, probá Cámara: grabá menos de 15 segundos, usá **Guardar seña**, recargá y verificá que podés reproducir o eliminar el clip.

Si usás Windows, podés probar `iniciar-tinku.bat` con Python 3 instalado; todavía no fue probado en una computadora Windows. GitHub puede alojar código, pero no publica automáticamente una página web, ni vuelve públicos videos privados, ni transporta los clips guardados en tu navegador.

## Preguntas que pueden hacerte

**¿Tinku traduce señas?** No. El prototipo busca etiquetas de texto, muestra videos públicos para practicar y puede grabar clips etiquetados.

**¿La cámara reconoce si hice bien una seña?** No. Solo graba el clip que vos decidís capturar; una etiqueta no es una evaluación automática.

**¿Los videos ya son LSB validados?** Las 45 entradas están vinculadas a WebM y la persona propietaria declaró su revisión LSB y permiso de publicación. Esta herramienta no realizó validación lingüística independiente y no existe un despliegue real.

**¿Qué ocurre con mi grabación?** Antes de guardar, es una vista previa temporal. Si elegís **Guardar seña**, queda en IndexedDB de este navegador y origen hasta que la eliminás o el navegador borra su almacenamiento. Nada se sube automáticamente.

**¿Por qué se borra la práctica al recargar?** Porque el avance se mantiene solo en la memoria de la pestaña. Es distinto de los clips que elegís guardar.

## Para cerrar tu explicación

Decí qué viste, no lo que imaginás: “Mostré una entrada de catálogo con su WebM, una práctica que se reinicia y una captura opcional que se guarda localmente solo con un clic”. Si alguien pregunta por una seña o por la calidad de un clip de Mis señas, la respuesta responsable es que hace falta revisión humana; los clips locales no se suben ni validan.
