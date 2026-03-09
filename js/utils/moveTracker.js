const SK='nct_moves',PK='nct_profile',MX=50;
let _s={id:Date.now().toString(36),t0:Date.now(),mode:null,mv:[]};
function _n(m){return{id:Date.now().toString(36),t0:Date.now(),mode:m||null,mv:[]}}
export function resetSession(m){_s=_n(m)}
export function recordMove(p,b,c,bw,nb){
  const prev=_s.mv.at(-1);
  _s.mv.push({p,b,c,t:Date.now(),dt:prev?Date.now()-prev.t:0,bw:[...bw],nb,n:_s.mv.length});}
export function finalizeGame(w){
  const d=_ld();
  d.push({id:_s.id,mode:_s.mode,w,mv:_s.mv,ms:Date.now()-_s.t0});
  if(d.length>MX)d.splice(0,d.length-MX);
  try{localStorage.setItem(SK,JSON.stringify(d));localStorage.setItem(PK,JSON.stringify(_bp(d)))}catch{}
  _s=_n(_s.mode);}
function _ld(){try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch{return[]}}
export function getProfile(){try{return JSON.parse(localStorage.getItem(PK)||'null')}catch{return null}}
function _bp(z){
  const ag=z.filter(g=>g.mode==='ai');
  const hm=ag.flatMap(g=>g.mv.filter(m=>m.p==='X'));
  const wi=ag.filter(g=>g.w==='X').length,lo=ag.filter(g=>g.w==='O').length,dr=ag.filter(g=>g.w==='draw').length;
  const n=hm.length||1;
  const bf=Array(9).fill(0);hm.forEach(m=>bf[m.b]++);
  const mx=Math.max(...bf,1);
  const op={};
  ag.forEach(g=>{const f=g.mv.find(m=>m.p==='X');if(f){const k=`${f.b}-${f.c}`;op[k]=(op[k]||0)+1}});
  return{
    games:z.length,wins:wi,losses:lo,draws:dr,
    winRate:wi/(wi+lo+dr||1),
    centerBias:+(hm.filter(m=>m.c===4).length/n).toFixed(3),
    cornerBias:+(hm.filter(m=>[0,2,6,8].includes(m.c)).length/n).toFixed(3),
    randomnessScore:+(hm.filter(m=>m.dt>0&&m.dt<1500).length/n).toFixed(3),
    aggressionScore:+(hm.filter(m=>[0,2,4,6,8].includes(m.b)).length/n).toFixed(3),
    boardFreq:bf,
    boardAvoidance:bf.map(v=>+(1-v/mx).toFixed(3)),
    openings:op,
    avgThinkMs:Math.round(hm.reduce((s,m)=>s+m.dt,0)/n),
  };}
export function exportMoves(fmt='json'){
  const d=_ld();
  if(fmt==='csv'){
    const r=['gameId,mode,winner,player,board,cell,thinkMs,moveNum'];
    d.forEach(g=>g.mv.forEach(m=>r.push(`${g.id},${g.mode||''},${g.w||''},${m.p},${m.b},${m.c},${m.dt},${m.n}`)));
    return r.join('\n');}
  return JSON.stringify(d,null,2);}
export function downloadMoves(fmt='json'){
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([exportMoves(fmt)],{type:'text/plain'})),download:`nct_moves.${fmt}`});
  document.body.append(a);a.click();a.remove();}
window.downloadGameMoves=downloadMoves;
window.getPlayerProfile=getProfile;
window.exportGameMoves=exportMoves;