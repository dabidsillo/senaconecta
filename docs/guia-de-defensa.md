# Guía de defensa del MVP Tinku

Esta guía te ayuda a defender el MVP ante un jurado mixto. Usala junto con [docs/guia-del-proyecto.md](guia-del-proyecto.md), que explica la arquitectura con más detalle.

## Mensaje central

Tinku es una aplicación de navegador para explorar 45 entradas en 9 categorías, practicar por categorías y guardar opcionalmente clips cortos etiquetados de forma local. No reconoce señas, no usa inteligencia artificial, no sube archivos locales ni guarda datos en un servidor.

La frase más importante para decir con honestidad es esta:

> Las 45 entradas actuales enlazan videos WebM VP8 del catálogo con `validationStatus: 'owner-attested-review'`. La persona propietaria declaró su revisión LSB y autorización de publicación; esta herramienta no hizo verificación lingüística independiente. Los archivos son publicables, pero no existe un despliegue real todavía.

## Catálogo para demostrar

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

## Guion oral de 3 a 5 minutos

1. **Problema.** “Un proyecto escolar de lengua de señas puede exagerar fácilmente lo que hace. Este MVP propone una base pequeña y honesta.”
2. **Solución.** “La aplicación corre en el navegador. Permite elegir una etiqueta exacta con categoría y palabra, buscar texto o frases, practicar las 9 categorías y, con permiso, grabar un clip etiquetado.”
3. **Persistencia local.** “Buscar y practicar son temporales. Cuando termina una grabación, puedo elegir **Guardar seña**: ese clic guarda el clip solo en IndexedDB de este navegador y origen. Luego puedo reproducirlo o eliminarlo.”
4. **Demostración.** “Voy a seleccionar `Familia → Papá` y reproducir su video de catálogo, buscar `Santa Cruz` y mostrar una práctica. En la práctica primero reproduciré la seña: las opciones aparecen al iniciar el video; después mostraré una respuesta incorrecta y una correcta. Si uso cámara, mostraré un clip de menos de 15 segundos y su guardado local.”
5. **Límites.** “No hay backend, cuentas, IA, reconocimiento automático, subida de archivos locales ni verificación lingüística independiente. El clip de Mis señas no se agrega al catálogo y no se descarga como video o JSON.”
6. **Siguiente paso responsable.** “Los 45 videos fueron declarados revisados y publicables por su propietario, pero no diré que la herramienta los verificó ni que el sitio ya está desplegado.”

## Checklist de demo en la interfaz real

Antes de empezar, abrí el proyecto con el servidor local recomendado en [README.md](../README.md):

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Luego abrí `http://localhost:8000`. Evitá `file://` porque puede bloquear módulos JavaScript o cámara.

### 1. Diccionario y búsqueda textual

- [ ] Entrá a **Diccionario**.
- [ ] Elegí `Familia` y después `Papá`; explicá que esa selección muestra exactamente esa etiqueta y su reproductor WebM.
- [ ] Usá los ejemplos sugeridos `Hola, mamá`, `Lo siento, papá` y `Por favor, amigo`; señalá que `amigo` queda como palabra no encontrada.
- [ ] Reproducí el video de catálogo con sus controles. Explicá que la revisión y el permiso fueron declarados por la persona propietaria, no verificados independientemente por esta herramienta.

### 2. Práctica por categorías

- [ ] Entrá a **Lecciones**.
- [ ] Mostrá las 9 categorías en la galería horizontal y usá touch/trackpad, teclado o **Anterior**/**Siguiente**.
- [ ] Elegí una categoría y reproducí primero el video público de la seña.
- [ ] Confirmá que las opciones de texto aparecen solo cuando empieza la reproducción; respondé una opción incorrecta y luego una correcta.
- [ ] Explicá que la incorrecta conserva el video y el paso, mientras la correcta avanza. Si el video falta o no se puede cargar, no se ofrecen opciones.
- [ ] Recargá si querés demostrar el límite: el progreso vuelve a empezar porque solo vive en memoria de la pestaña.

### 3. Cámara opcional y guardado explícito

Hacé esta parte solo si el jurado, el entorno y la persona grabada dan permiso.

- [ ] Entrá a **Cámara** y explicá que no traduce ni reconoce movimientos.
- [ ] Elegí `Familia` y `Papá`, o escribí una etiqueta personalizada.
- [ ] Iniciá cámara solo si hay permiso.
- [ ] Grabá un clip corto; como máximo dura 15 segundos.
- [ ] Mostrá la vista previa temporal y pulsá **Guardar seña**.
- [ ] Mostrá la lista local y usá **Reproducir**; después usá **Eliminar** si no se necesita conservarlo.
- [ ] Recargá para demostrar que el clip guardado puede persistir en el mismo navegador, sin afirmar que sea permanente o portable.

## Privacidad, cuota y consentimiento

Un clip guardado pertenece al almacenamiento IndexedDB del mismo navegador y origen. No viaja a otro dominio, navegador, perfil, computadora o dispositivo. El navegador puede rechazar el guardado por cuota, eliminar datos por limpieza de almacenamiento, modo de privacidad o sus propias políticas de evicción. Por eso no es una copia de respaldo.

Pedí consentimiento antes de activar la cámara y antes de conservar o mostrar un clip. Si participa una persona menor de edad, seguí el consentimiento que corresponda a su familia, institución y contexto. No proyectes, compartas ni reutilices videos con datos personales sin autorización.

## Plan B para problemas durante la defensa

| Problema | Qué hacer | Qué decir |
| --- | --- | --- |
| No hay cámara | Saltá la grabación y explicá `src/capture.mjs` con la UI visible. | “La cámara es opcional; la app debe seguir explicándose sin capturar datos.” |
| El navegador bloquea cámara | Confirmá que estás en `localhost`; si sigue fallando, no fuerces permisos. | “El navegador protege cámara por permisos y contexto seguro.” |
| No se puede guardar | No fuerces intentos repetidos; explicá cuota, privacidad o falta de IndexedDB. | “El almacenamiento es local y depende de las reglas y espacio del navegador.” |
| Un archivo de catálogo falta o no carga | Mostrá el aviso “Video no disponible” o el error del reproductor; en práctica, no habrá opciones. | “Ese es el respaldo genérico para un activo ausente; las 45 rutas actuales del catálogo apuntan a WebM VP8, pero eso no sustituye una comprobación en navegador.” |
| No abre con `file://` | Usá el servidor Python local. | “Python solo sirve archivos; la app sigue siendo del navegador.” |
| Node no ejecuta pruebas | Revisá que el comando se corra desde la raíz del repo. | “Node se usa para pruebas automáticas, no para servir la aplicación final.” |

## Preguntas probables y respuestas cortas

**¿La aplicación enseña LSB de forma validada?** Muestra 45 videos cuya revisión LSB fue declarada por su propietario. La herramienta no realizó una verificación lingüística independiente ni mide aprendizaje.

**¿Reconoce una seña desde la cámara?** No. La cámara solo graba un clip etiquetado para vista previa y guardado local opcional.

**¿Los videos se suben a internet?** No. No hay backend ni subida automática; guardar usa IndexedDB local y no crea descargas.

**¿Se guarda el progreso del estudiante?** No. La práctica vive en la pestaña actual y se reinicia al recargar.

**¿Se guarda una grabación?** Solo si la persona pulsa **Guardar seña**. Puede seguir disponible tras recargar en el mismo navegador y origen, hasta que se elimine o el navegador borre el almacenamiento.

**¿Los videos ya son LSB validados o públicos?** Las 45 rutas WebM están vinculadas al catálogo y la persona propietaria declaró revisión y permiso de publicación. No hay despliegue real y la herramienta no verificó lingüísticamente esos videos.

## Para jurado técnico

**¿Dónde está el catálogo?** En [src/catalog.mjs](../src/catalog.mjs). Ahí están las 45 entradas, sus rutas relativas `./assets/catalog/<id>.webm` y `validationStatus: 'owner-attested-review'`.

**¿Cómo se evita inventar videos?** Para una entrada elegida, `getPlayableSequence` en [src/catalog.mjs](../src/catalog.mjs) acepta solo `videoPath` no vacío. Para búsqueda libre, [src/app.js](../src/app.js) usa `createPhraseSequencePlan`: una ruta pública `videoPath` declarada y no vacía gana al planificar, y solo puede usar metadata de un clip local sin validar cuando falta esa ruta. Si esa ruta pública después falla en el navegador, muestra el error y detiene la frase; no cambia dinámicamente al clip local. Si no hay medio, mantiene un estado pendiente en vez de inventar una seña.

**¿Cómo se guarda un clip?** [src/app.js](../src/app.js) llama a `captureStore.save` solo después del clic explícito. [src/capture-store.mjs](../src/capture-store.mjs) guarda el Blob y la metadata en IndexedDB; lista metadata y lee el Blob al reproducirlo.

**¿Qué controla la captura?** [src/capture.mjs](../src/capture.mjs) valida soporte, resuelve etiquetas, prepara metadata y define el límite. [src/app.js](../src/app.js) conecta esos helpers con los botones reales y detiene la grabación a los 15 segundos.

**¿Qué prueban los tests?** Las pruebas en [tests/](../tests/) cubren funciones de catálogo, lecciones, captura, selector y almacenamiento. No reemplazan una prueba de cámara, cuota o privacidad en un navegador real.

## Límites que conviene decir antes de que los pregunten

- No afirmes mejora de aprendizaje porque no hay medición con estudiantes.
- No afirmes compatibilidad con todos los navegadores; cámara, grabación, IndexedDB y la reproducción de WebM dependen del navegador y dispositivo.
- No afirmes que los controles o las opciones de práctica fueron validados en un navegador si solo corriste pruebas de Node; la reproducción y el evento `playing` requieren comprobación manual.
- No digas que hay IA, reconocimiento automático o traducción de señas.
- No presentes la declaración del propietario como verificación lingüística independiente ni como certificación oficial.
- No prometas alojamiento, publicación o lanzamiento: los videos son publicables, pero no hay despliegue real.
- No presentes el almacenamiento local como respaldo permanente ni como mecanismo de compartir archivos.

## Cierre recomendado

“Mi defensa no es que el proyecto ya resuelve toda la enseñanza de LSB. El MVP ofrece catálogo con 45 WebM declarados revisados y publicables por su propietario, búsqueda, práctica temporal, captura opcional y guardado local explícito. No hubo verificación lingüística independiente ni despliegue; Mis señas sigue siendo local y sin validar.”
