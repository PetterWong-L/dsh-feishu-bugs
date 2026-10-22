const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export function registerRoute(ctx,run,snapshot,subscribe) {
 const clients=new Set();
 const closeEvents=ctx.webServer.register({kind:'exact',path:'/feishu-bugs/events',handler(req,res){
  const admission=ctx.connection.admit(req);
  if('rejection' in admission){res.writeHead(admission.rejection);res.end();return;}
  if(admission.peer.id!==ctx.connection.browserPeer.id){res.writeHead(403);res.end();return;}
  if(req.method!=='GET'){res.writeHead(405);res.end();return;}
  res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.write('data: {}\n\n');clients.add(res);
  const off=subscribe(()=>res.write('data: {}\n\n'));
  res.on('close',()=>{off();clients.delete(res);});
 }});
 const closeApi=registerApi(ctx,run,snapshot);
 return()=>{closeEvents();closeApi();for(const res of clients)res.end();};
}
function registerApi(ctx,run,snapshot) {
 return ctx.webServer.register({kind:'exact',path:'/feishu-bugs/api',async handler(req,res){
  const reply=(status,body)=>{res.writeHead(status,headers);res.end(JSON.stringify(body));};
  const admission=ctx.connection.admit(req);
  if('rejection' in admission)return reply(admission.rejection,{error:'Authentication required'});
  if(admission.peer.id!==ctx.connection.browserPeer.id)return reply(403,{error:'Owner browser required'});
  if(req.method==='GET')return reply(200,snapshot());
  if(req.method!=='POST')return reply(405,{error:'GET or POST required'});
  const site=req.headers['sec-fetch-site'];
  if(site!==undefined&&site!=='same-origin')return reply(403,{error:'Same origin required'});
  if(req.headers.origin===undefined){
   // Desktop strips Origin/Fetch Metadata while forwarding authenticated dsh-app:// requests.
   // admit() above is still the signed-credential boundary. This non-simple header
   // forces cross-origin web callers through CORS preflight, which we never grant.
   if(req.headers['x-dsh-feishu-bugs']!=='1')return reply(403,{error:'Refresh the panel to update its request security marker'});
  }else{
   let origin;try{origin=new URL(req.headers.origin);}catch{return reply(403,{error:'Invalid origin'});}
   if(!['http:','https:'].includes(origin.protocol)||origin.host!==req.headers.host)return reply(403,{error:'Same origin required'});
  }
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']??''))return reply(415,{error:'JSON required'});
  try{let n=0;const chunks=[];for await(const chunk of req){n+=chunk.length;if(n>32768)return reply(413,{error:'Request too large'});chunks.push(chunk);}
   const args=JSON.parse(Buffer.concat(chunks).toString('utf8'));await run(args);return reply(200,snapshot());
  }catch(e){return reply(400,{error:e instanceof SyntaxError?'Invalid JSON':String(e.message).slice(0,400)});}
 }});
}
