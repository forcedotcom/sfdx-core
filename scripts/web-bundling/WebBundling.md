# Web Bundling

for dev time, I use in 4 separate terminals

- `yarn compile --watch` (the normal tc compile to `/lib`)
- `yarn bundle:web --watch` (esbuild from `/lib` to `/tmp-lib-web`)
- `yarn copy:html --watch` (copies web.html from this folder into the tmp-lib-web folder)
- `yarn serve:web --watch` (reload the server when contents of `tmp-lib-web`)

view on http://localhost:8080

---
