# Human Vision presentation: multi-language build
- Python 3: data/gen_data.py -> retina density JSON + photoreceptor mosaic SVG
- TypeScript: src/optics.ts -> typed optics engine (Optics Lab) + chart renderer
- CSS: src/lab.css
- JavaScript: base.html (the 12-slide deck with Three.js/GSAP)
- Node.js: build.js assembles dist/index.html; serve.js presents offline
Run: npm install && npm run build && npm start
