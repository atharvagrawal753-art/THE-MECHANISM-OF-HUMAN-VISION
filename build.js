// Node.js stage: orchestrates Python + TypeScript and assembles the final page.
const {spawnSync}=require('child_process'),fs=require('fs');
const run=(c,a)=>{const r=spawnSync(c,a,{stdio:'inherit'});if(r.status)process.exit(r.status)};
run('python3',['data/gen_data.py']);
run(fs.existsSync('node_modules/.bin/tsc')?'node_modules/.bin/tsc':'npx',fs.existsSync('node_modules/.bin/tsc')?[]:['tsc']);
const base=fs.readFileSync('base.html','utf8'),css=fs.readFileSync('src/lab.css','utf8'),js=fs.readFileSync('dist/optics.js','utf8');
const data=fs.readFileSync('data/data.json','utf8'),svg=fs.readFileSync('data/mosaic.svg','utf8');
const inj=`<script>const __VISION_DATA__=${data};const __MOSAIC__=${JSON.stringify(svg)};</script><script>(function(){${js}\n})();</script>`;
const out=base.replace('</head>',`<style>${css}</style></head>`).replace('</body>',inj+'</body>');
fs.writeFileSync('dist/index.html',out);console.log('node: dist/index.html',(out.length/1024|0)+' KB');
