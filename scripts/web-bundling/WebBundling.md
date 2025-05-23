# Web Bundling

for dev time, I use in 4 separate terminals

- `yarn compile --watch` (the normal tc compile to `/lib`)
- `yarn bundle:web --watch` (esbuild from `/lib` to `/dist/browser`)
- `yarn serve:web --watch` (reload the server when contents of `dist/browser`)

view on http://localhost:8080

---
