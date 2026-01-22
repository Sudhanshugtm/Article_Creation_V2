# Article title prototype (Codex TypeaheadSearch)

Mobile-first prototype for the **New article → Article title** step, using Wikimedia Codex `CdxTypeaheadSearch`.

## Run locally

From the repo root:

```bash
npm --prefix typeahead-demo ci
npm run dev
```

Open `http://localhost:5174/`.

To test on your phone, connect to the same Wi‑Fi and open the Network URL printed by Vite (e.g. `http://192.168.x.x:5174/`).

## Troubleshooting

If you see:

`Failed to parse source for import analysis … Install @vitejs/plugin-vue to handle .vue files.`

Run the dev server from `typeahead-demo/` (or use `npm run dev` from the repo root). Don’t run `vite` from the repo root directly.
