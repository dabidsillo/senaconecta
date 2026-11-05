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
- [ ] **VOCAB-2 — Add accessible dependent dictionary selectors.** Add category and word selects, populate from shared catalog, reset stale choice on category change, show selected entry with existing video/no-video rendering, retain independent text search and capture selector, update UX copy/styles/README. Add testable helper logic for cascade where practical. Progress: in progress. Commit: pending.
- [ ] **VOCAB-3 — Verify integrated flows.** Run Node suite and syntax/diff checks, review catalog inventory/no-video, selector HTML+JS wiring and local HTTP, note browser manual checks and never claim validated LSB movement. Progress: pending. Commit: pending if verification changes tracked artifacts.

## Next step
Implement VOCAB-1 first and reconcile the feature file, Engram mirror and visible todo on every transition.
