import{executeMove}from'../engine.js';
import{WIN_PATTERNS as W}from'../../utils/constants.js';
const A='O',H='X',TL=3000,PW=[3,1,3,1,4,1,3,1,3];
const ml=[];let mc=0;
function gp(){try{return JSON.parse(localStorage['nct_profile']||'null')}catch{return null}}
export function setupMoveLogExport(){
  window.downloadAayushMoveLog=function(f='json'){
    const txt=f==='csv'?'move,action,board,cell,score\n'+ml.map(e=>`${e.move},${e.action},${e.board},${e.cell},${e.score}`).join('\n'):JSON.stringify(ml,null,2);
    const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([txt],{type:'text/plain'})),download:`aayush_move_log.${f}`});
    document.body.append(a);a.click();a.remove();
  };}
function cs(){return{b:window.boards.map(b=>b.cells.map(c=>c.textContent||'')),w:[...window.boardWinners],n:window.nextBoard}}
function am(s,bi,ci,p){
  const b=s.b.map(r=>[...r]),w=[...s.w];
  b[bi][ci]=p;
  if(!w[bi]){if(W.some(l=>l.every(i=>b[bi][i]===p)))w[bi]=p;else if(b[bi].every(c=>c!==''))w[bi]='D'}
  return{b,w,n:(w[ci]||b[ci].every(c=>c!==''))?-1:ci};}
function vi(s){
  if(s.n!==-1&&!s.w[s.n]&&s.b[s.n].some(c=>c===''))return[s.n];
  return Array.from({length:9},(_,i)=>i).filter(i=>!s.w[i]&&s.b[i].some(c=>c===''));
}
function gl(s){const m=[];for(const bi of vi(s))for(let ci=0;ci<9;ci++)if(s.b[bi][ci]==='')m.push([bi,ci]);return m}
function mw(w,p){return W.some(l=>l.every(i=>w[i]===p))}
function ts(s){if(mw(s.w,A))return 100000;if(mw(s.w,H))return-100000;if(!gl(s).length)return 0;return null}
function ev(s){
  let sc=0,at=0,ht=0;
  for(const l of W){
    const ac=l.filter(i=>s.w[i]===A).length,hc=l.filter(i=>s.w[i]===H).length;
    if(!hc){if(ac===2){sc+=500;at++}else if(ac===1)sc+=50}
    if(!ac){if(hc===2){sc-=600;ht++}else if(hc===1)sc-=60}
  }
  if(at>=2)sc+=1200;if(ht>=2)sc-=1400;
  for(let i=0;i<9;i++){
    if(s.w[i])continue;
    const bd=s.b[i],bp=i===4?15:[0,2,6,8].includes(i)?10:5;
    for(const l of W){
      const ac=l.filter(j=>bd[j]===A).length,hc=l.filter(j=>bd[j]===H).length;
      if(!hc){if(ac===2)sc+=30+bp*.5;else if(ac===1)sc+=5}
      if(!ac){if(hc===2)sc-=35-bp*.5;else if(hc===1)sc-=6}
    }
    for(let ci=0;ci<9;ci++){if(bd[ci]===A)sc+=PW[ci];else if(bd[ci]===H)sc-=PW[ci]}
  }
  if(s.n===-1)sc-=8;
  else if(!s.w[s.n]){
    const tb=s.b[s.n];
    for(const l of W){
      const ac=l.filter(j=>tb[j]===A).length,hc=l.filter(j=>tb[j]===H).length;
      if(ac===2&&l.some(j=>tb[j]===''))sc+=15;
      if(hc===2&&l.some(j=>tb[j]===''))sc-=20;
    }
  }
  const pr=gp();
  if(pr){
    const mx=Math.max(...pr.boardFreq,1);
    for(let i=0;i<9;i++){if(s.w[i])continue;sc+=s.b[i].filter(c=>c===A).length*(1-pr.boardFreq[i]/mx)*4}
    if(pr.centerBias>.25)for(let i=0;i<9;i++)if(!s.w[i]){if(s.b[i][4]===A)sc+=10;else if(s.b[i][4]==='')sc+=4}
    if(pr.randomnessScore>.55)for(let i=0;i<9;i++)if(s.w[i]===A)sc+=PW[i]*3;
  }
  return sc;
}
function om(moves,s,mx){
  return moves.map(([bi,ci])=>{
    const p=mx?A:H,ns=am(s,bi,ci,p);
    let v=0;
    if(mw(ns.w,p))v+=100000;if(ns.w[bi]===p)v+=300;v+=PW[ci]*10;
    v+=ns.n!==-1&&!ns.w[ns.n]?(9-ns.b[ns.n].filter(c=>c==='').length)*4:-10;
    return{m:[bi,ci],v};
  }).sort((a,b)=>mx?b.v-a.v:a.v-b.v).map(x=>x.m);
}
let t0;
function mm(s,d,mx,a,b){
  if(Date.now()-t0>TL)return ev(s);
  const t=ts(s);if(t!==null)return t;
  if(!d)return ev(s);
  const mv=gl(s);if(!mv.length)return ev(s);
  const ord=om(mv,s,mx);
  if(mx){
    let best=-Infinity;
    for(const[bi,ci]of ord){const sc=mm(am(s,bi,ci,A),d-1,false,a,b);if(sc>best)best=sc;if(sc>a)a=sc;if(b<=a)break}
    return best;
  }
  let best=Infinity;
  for(const[bi,ci]of ord){const sc=mm(am(s,bi,ci,H),d-1,true,a,b);if(sc<best)best=sc;if(sc<b)b=sc;if(b<=a)break}
  return best;
}
function ct(w){
  let ai=0,h=0;
  for(const l of W){const ac=l.filter(i=>w[i]===A).length,hc=l.filter(i=>w[i]===H).length;if(ac===2&&!hc)ai++;if(hc===2&&!ac)h++}
  return{ai,h};
}
const Q=['I have seen all possible futures. This move is inevitable.','Your strategy collapsed 7 moves ago.','I already know how this ends.','Every path leads to the same conclusion.'];
export function makeAayushAcharyaMove(){
  const s=cs(),th=ct(s.w);
  let d=(th.ai>=2||th.h>=2)?9:7;
  t0=Date.now();mc++;
  const mv=gl(s),ord=om(mv,s,true);
  let bs=-Infinity,bm=null;
  for(const[bi,ci]of ord){
    const sc=mm(am(s,bi,ci,A),d-1,false,-Infinity,Infinity);
    if(sc>bs){bs=sc;bm=[bi,ci]}
    if(bs>=100000)break;
  }
  if(!bm)bm=ord[0]||mv[0];
  const[bi,ci]=bm;
  const e={move:mc,action:bs>=100000?'WIN':th.h>=2?'CRISIS':'OPT',board:bi,cell:ci,score:bs};
  ml.push(e);if(!window.aayushMoveLog)window.aayushMoveLog=[];window.aayushMoveLog.push(e);
  const _dlg=document.getElementById('ai-dialogue');
  if(_dlg){_dlg.textContent=Q[mc%Q.length];_dlg.style.display='block';_dlg.classList.remove('pop');void _dlg.offsetWidth;_dlg.classList.add('pop');setTimeout(()=>{_dlg.classList.remove('pop')},3000);}
  return executeMove(bi,ci);
}