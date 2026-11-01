import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../dist');
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const dest=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
  if(dest!==root&&!dest.startsWith(root+path.sep)){res.writeHead(403);return res.end('Forbidden');}
  const body=await readFile(dest);res.writeHead(200,{'Content-Type':types[path.extname(dest)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-cache'});res.end(body);
 }catch{res.writeHead(404);res.end('找不到這個檔案');}
});
server.listen(port,process.env.CODESPACES?'0.0.0.0':'127.0.0.1',()=>console.log(`Pro Tools 工作台 → http://127.0.0.1:${port}`));
