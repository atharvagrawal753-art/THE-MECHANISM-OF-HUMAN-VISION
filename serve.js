// Node.js: run `npm start`, then open http://localhost:8080 to present offline.
require('http').createServer((q,r)=>{r.setHeader('Content-Type','text/html');r.end(require('fs').readFileSync(__dirname+'/dist/index.html'))}).listen(8080,()=>console.log('http://localhost:8080'));
