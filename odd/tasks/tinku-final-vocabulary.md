# Tinku final text vocabulary and dependent selectors

## Goal
Replace the six illustrative starter labels with the user's 112 supplied words/phrases in 15 categories, and offer two dependent dictionary selectors (category → word) without breaking free-text search, lessons, capture, or honest no-video behavior.

## Scope and decisions
- Source of truth: user's 15 category lists in the current conversation. Display Spanish accents/normal spelling (e.g. Buenos días, ¿Cómo estás?, Papá, Mamá, Tú, Sí); preserve supplied word choice including **Amarilla**, **Guineo**, **Flota**, **Trufi**, **Nuestro**. User supplied family **Papá** and vegetable **Papa**: keep distinct IDs/categories; selector must disambiguate and free-text lookup should not silently discard one.
- Add selectors alongside existing text input; do not replace input or change capture's distinct label selector. Changing category resets selected word and populated options; choosing a word displays that exact catalog entry and its video/no-video state. No auto-play.
- Multiword entries (Buenos días, Buenas tardes, Buenas noches, ¿Cómo estás?, Estoy bien, Más o menos, Lo siento, Te amo, Santa Cruz, La Paz) must work as whole phrases in free text (longest token match) rather than accidentally count component words as unknown. Preserve old multi-token search behavior where terms exist.
- New labels are user-supplied final text vocabulary, **not** proof that signed videos have been validated or published: every entry still has `videoPath: null`, no aliases, and pending-sign-video status. Update copy/README accordingly; no fake video URL, upload or persistent state.
- Use the existing Node runner `node --test` and JS syntax checks. Browser visual/camera/media playback require real browser and actual reviewed files; no private DOCX or changes MD must be staged/published.
- Existing feature branch `feat/lsb-mvp`; per ODD use local work-unit commits only; no push/PR without user decision. A separately present `docs/DICCIONARIO LSB.docx` is user-owned and untracked; do not read, stage or publish it. Ignore it explicitly, as well as generated `.codegraph/` state.
- Engram mirror: `odd/tinku-final-vocabulary/tasks`.

## Source inventory (as provided; display accents may be restored)
- SALUDOS (15): Hola; Chau; Buenos dias; Buenas tardes; Buenas noches; Gracias; Por favor; ¿Como estas?; Estoy bien; Mal; Mas o menos; Si; No; Lo siento; Te amo.
- FAMILIA (9): Papa; Mama; Bebe; Abuelo; Abuela; Hijo; Hija; Hermano; Hermana.
- ALIMENTOS (11): Pan; Leche; Carne; Fideo; Queso; Arroz; Sal; Aceite; Cafe; Azucar; Te.
- LUGARES (8): Casa; Cuarto; Baño; Escuela; Hospital; Iglesia; Farmacia; Mercado.
- COLORES (4): Rojo; Amarilla; Azul; Verde.
- ANIMALES (5): Perro; Gato; Vaca; Condor; Gallina.
- DEPARTAMENTOS DE BOLIVIA (9): Santa Cruz; La Paz; Cochabamba; Oruro; Tarija; Beni; Chuquisaca; Potosi; Pando.
- NATURALEZA (4): Frio; Calor; Sol; Lluvia.
- MEDIOS DE TRANSPORTE (5): Auto; Flota; Micro; Trufi; Motocicleta.
- VERDURAS (4): Tomate; Cebolla; Zanahoria; Papa.
- FRUTAS (6): Manzana; Naranja; Uva; Platano; Guineo; Piña.
- VERBOS (8): Cocinar; Comprar; Vender; Aprender; Comer; Dibujar; Dormir; Ayudar.
- PRONOMBRES (6): Yo; Tu; Nosotros; El; Ella; Nuestro.
- NUMEROS (11): Cero; Uno; Dos; Tres; Cuatro; Cinco; Seis; Siete; Ocho; Nueve; Diez.
- DIAS DE LA SEMANA (7): Lunes; Martes; Miercoles; Jueves; Viernes; Sabado; Domingo.

## Tasks
- [x] **VOCAB-1 — Replace catalog and support phrase/homonym lookup.** 112 exact terms across 15 categories with stable unique IDs and `videoPath: null`; longest phrase matching recognizes multiword labels, and `papa` returns both Papá (Familia) and Papa (Verduras). Independent verifier observed `node --test` 33/33 passed, `node --check src/catalog.mjs` and `git diff --check` passed. Root ignores protect the separate dictionary DOCX and generated `.codegraph/`. Progress: complete. Commit: `f9efb8c` (`feat: load final Tinku vocabulary with phrase search`).
- [x] **VOCAB-2 — Add accessible dependent dictionary selectors.** Labeled category→word selects populate from the shared catalog, clear stale selections/results and use exact category+entry ID; free-text search, examples and capture label select remain independent. Added pure helper and 4 tests, updated responsive CSS/README/public guides. Independent verifier observed `node --test` 37/37, `node --check src/app.js src/dictionary-select.mjs`, `git diff --check` and localhost HTTP 200. Browser visual check pending. Progress: complete. Commit: `7f5a3d2` (`feat: browse vocabulary with dependent selectors`).
- [x] **VOCAB-3 — Verify integrated flows.** Independent verifier observed `node --test` 37/37 passed; `node --check` for catalog/app/selector passed; `git diff --check` passed; 112 entries in 15 categories, all `videoPath: null`; category+ID wiring and ignored/untracked DOCX/media confirmed. Initial localhost check failed because no server was running; after explicitly starting a bounded loopback static server, index and both catalog/selector modules responded HTTP 200 with expected content, then the server was stopped. Real browser layout, keyboard interaction, camera/media and downloads remain pending human walkthrough and are not claimed verified. Progress: complete for automated integration checks; manual browser verification outstanding. Evidence: commits `f9efb8c`, `7f5a3d2`; this progress record follows as a documentation-only work unit.

## Next step
Ask the user to browse category→word, try Papá/Papa and a multiword search, and verify no-video states in a real browser. Associate reviewed video files only after creator validation. Keep this branch local until the user separately requests a push.
