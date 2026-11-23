/* SPAWN TCG: Necroplasma · game.js
   Reglas, IA, audio sintetizado e interfaz. Usa CARDS_DATABASE/D/BYNUM de cards.js. */
let DECK=null;try{const x=JSON.parse(localStorage.getItem('spawnTcgDeck')||'null');if(Array.isArray(x)&&x.length===20&&x.every(n=>BYNUM[n]))DECK=x}catch(e){}
const BOSSES={
violator:{n:'Violator',hp:20,i:'😈',d:'Mazo agresivo: coste bajo, prisa y daño directo.',deck:["003","003","041","041","015","015","011","011","008","008","051","051","117","117","004","002","005","094","094","052"]},
wynn:{n:'Jason Wynn / CIA',hp:22,i:'🕴️',d:'Táctico: mejoras, escudos y Stasis Field.',deck:["053","053","053","094","054","054","054","070","070","063","063","004","004","002","117","117","064","064","014","051"]},
malebolgia:{n:'Malebolgia',hp:25,i:'👁️',d:'Jefe: 25 HP iniciales y cartas pesadas.',deck:["119","119","005","005","070","070","120","120","030","030","001","001","003","004","004","052","051","117","064","053"]}};
/* AUDIO sintetizado (Web Audio API, sin archivos) */
let AC=null,SND=(()=>{try{return localStorage.getItem('spawnTcgSnd')!=='0'}catch(e){return true}})(),FID=0;
const au=()=>{try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume()}catch(e){}return AC};
function tone(f,d,ty,v,t0,f2){const a=au();if(!a)return;const t=a.currentTime+(t0||0),o=a.createOscillator(),gn=a.createGain();o.type=ty||'sine';o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);gn.gain.setValueAtTime(v||.2,t);gn.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(gn);gn.connect(a.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v,t0){const a=au();if(!a)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),x=b.getChannelData(0);for(let i=0;i<n;i++)x[i]=(Math.random()*2-1)*(1-i/n);const r=a.createBufferSource(),gn=a.createGain();r.buffer=b;gn.gain.value=v;r.connect(gn);gn.connect(a.destination);r.start(a.currentTime+(t0||0))}
const SFX={
place:()=>{tone(880,.25,'square',.08);tone(1318,.2,'triangle',.07,.03);tone(1760,.12,'sine',.05,.05);noise(.06,.15)},
hit:()=>{tone(140,.4,'sine',.6,0,38);tone(90,.25,'sawtooth',.2,0,40);noise(.2,.35)},
energy:()=>{tone(70,.7,'sawtooth',.14,0,140);tone(73,.7,'square',.06,0,146);tone(420,.5,'sine',.05,.1,1200)},
win:()=>{[[147,0],[175,.18],[220,.36],[294,.54]].forEach(([f,t])=>{tone(f,.5,'sawtooth',.14,t);tone(f/2,.5,'square',.1,t)});tone(294,1.4,'sawtooth',.16,.8);tone(147,1.4,'square',.1,.8);tone(349,1.4,'triangle',.08,.8)},
lose:()=>{[[220,0],[196,.3],[175,.6],[110,.9]].forEach(([f,t])=>tone(f,.5,'sawtooth',.14,t,f*.96))},
guard:()=>{tone(520,.08,'square',.09);tone(390,.14,'triangle',.08,.04);noise(.05,.18)},
stance:()=>{tone(300,.14,'sawtooth',.1,0,700);noise(.05,.1)},
trap:()=>{tone(1200,.35,'sawtooth',.12,0,200);tone(600,.3,'square',.08,.05,100);noise(.15,.3)},
shuffle:()=>{for(let i=0;i<6;i++)noise(.05,.14,i*.06)},
buff:()=>{tone(523,.15,'sine',.1);tone(659,.15,'sine',.1,.08);tone(784,.22,'sine',.1,.16)},
deckout:()=>{tone(110,.6,'sawtooth',.25,0,40);noise(.4,.3)},
discard:()=>{tone(200,.15,'triangle',.1,0,100);noise(.08,.15)}};
const sfx=n=>{if(SND&&SFX[n])try{SFX[n]()}catch(e){}};
const POL={violator:{face:4,trap:.2,guard:.1},wynn:{face:0,trap:.6,guard:.55},malebolgia:{face:2,trap:.3,guard:.3}};
let UID=0;
const mk=id=>({u:++UID,id,atk:D[id].a,hp:D[id].h,mx:D[id].h,rdy:false,fz:false,sh:false,n:1,m:'a',tg:false,fn:false});
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const mkSide=(s,b)=>{const B=b&&BOSSES[b],dk=s==='p'?(DECK||DEF_DECK):(B?B.deck:DEF_DECK),hp=s==='e'&&B?B.hp:20;return{hp,mhp:hp,deck:shuffle(dk.map(n=>BYNUM[n])),hand:[],f:[null,null,null],ko:[],trap:null}};
const opp=s=>s==='p'?'e':'p';
const nm=s=>s==='p'?'Tú':'Rival';
const L=(g,t)=>{g.log.unshift(t);if(g.log.length>60)g.log.length=60};
const E=(g,e)=>g.ev.push(e);
const clamp=v=>Math.max(-10,Math.min(10,v));
function draw(g,s){const S=g[s];
 if(!S.deck.length){const had=S.ko.length;S.hp-=5;E(g,{k:'num',s,i:'hp',t:'-5',c:'r'});E(g,{k:'hit',s,i:'hp'});E(g,{k:'snd',n:'deckout'});
  if(had){S.deck=shuffle(S.ko);S.ko=[];L(g,`${nm(s)}: mazo vacío. Baraja su Pila de KO (${had}) y recibe 5 de daño.`)}else L(g,`${nm(s)}: mazo vacío y sin Pila de KO, recibe 5 de daño.`)}
 if(S.deck.length)S.hand.push(S.deck.pop())}
function win(g){if(g.over)return;if(g.p.hp<=0)g.over='e';else if(g.e.hp<=0)g.over='p';if(g.over)E(g,{k:'snd',n:g.over==='p'?'win':'lose'})}
function startTurn(g,s){g.turn=s;g.ph='main';g.ai='main';g.at=null;
 for(const x of['p','e'])g[x].f.forEach(u=>{if(u)u.sh=false});
 g[s].f.forEach((u,i)=>{if(u){u.tg=false;if(u.fn){u.fz=true;u.fn=false}u.rdy=!u.fz;u.n=0;const r=D[u.id].rg;if(r&&u.hp<u.mx){const h=Math.min(r,u.mx-u.hp);u.hp+=h;E(g,{k:'num',s,i,t:'+'+h+' HP',c:'g'})}}});
 draw(g,s);L(g,`— Turno ${s==='p'?'tuyo':'del rival'} (Necroplasma: ${s==='p'?g.m:-g.m}) —`);win(g)}
function trim(g,s){const S=g[s];while(S.hand.length>7){let k=S.hand.length-1;if(s==='e')k=S.hand.reduce((b,id,i)=>D[id].c<D[S.hand[b]].c?i:b,0);const id=S.hand.splice(k,1)[0];S.ko.push(id);E(g,{k:'snd',n:'discard'});L(g,`${nm(s)} descarta ${D[id].n} por límite de mano (7).`)}}
function endTurn(g,s,en){if(s==='p')g.mull=false;trim(g,s);g[s].f.forEach(u=>{if(u)u.fz=false});g.m=clamp(s==='p'?-en:en);startTurn(g,opp(s))}
function newGame(b){const g={p:mkSide('p'),e:mkSide('e',b),m:3,turn:'p',ph:'main',ai:'main',log:[],over:null,ev:[],boss:b,mull:true,at:null};
 for(let i=0;i<4;i++){draw(g,'p');draw(g,'e')}L(g,'¡Duelo contra '+BOSSES[b].n+'! Tienes 3 de Necroplasma.');startTurn(g,'p');return g}
const guarded=S=>S.f.some(u=>u&&u.m==='g');
function spring(g,o,why,ref){const O=g[o],id=O.trap;if(!id)return false;O.trap=null;
 const u=g[ref.s].f[ref.i];let neg=false;
 E(g,{k:'snd',n:'trap'});E(g,{k:'num',s:o,i:'trap',t:'¡TRAMPA!',c:'b'});
 L(g,`¡Trampa de ${nm(o)}! Se revela ${D[id].n} (${why==='direct'?'ataque directo':'invocación de coste 5+'}).`);
 if(id==='fire'){if(u&&u.id!=='angela'){hit(g,ref.s,ref.i,5);L(g,`Elemental Fire quema a ${D[u.id].n}.`);if(u.hp<=0)neg=true}else L(g,'El fuego no afecta a Angela.')}
 else if(id==='stasis'){if(u){u.fn=true;u.rdy=false;E(g,{k:'num',s:ref.s,i:ref.i,t:'❄️',c:'b'});L(g,`${D[u.id].n} queda congelado.`);neg=why==='direct'}}
 else if(id==='bums'){if(O.ko.length){const k=O.ko.pop();O.hand.push(k);L(g,`Recupera ${D[k].n} de la Pila de KO.`)}}
 else if(id==='media'){draw(g,o);draw(g,o);L(g,'Media Contact: roba 2 cartas.')}
 O.ko.push(id);return neg}
function setTrap(g,s,hi){const S=g[s],id=S.hand[hi];if(!id||S.trap||D[id].t!=='e')return;
 S.hand.splice(hi,1);S.trap=id;if(s==='p')g.mull=false;
 g.m=clamp(g.m+(s==='p'?-1:1));E(g,{k:'snd',n:'guard'});L(g,`${nm(s)} coloca una carta boca abajo (coste 1).`);
 if(!g.over&&((s==='p'&&g.m<0)||(s==='e'&&g.m>0))){L(g,`${nm(s)} cruza el medidor: el turno termina.`);endTurn(g,s,Math.abs(g.m))}}
function mulligan(g){const S=g.p;if(!g.mull)return;g.mull=false;S.deck.push(...S.hand);S.hand=[];shuffle(S.deck);for(let i=0;i<4;i++)draw(g,'p');E(g,{k:'snd',n:'shuffle'});L(g,'Mulligan: barajas tu mano y robas 4 cartas nuevas.')}
function toggle(g,s,i){const u=g[s].f[i];if(!u||u.tg)return;u.m=u.m==='g'?'a':'g';u.tg=true;E(g,{k:'snd',n:u.m==='g'?'guard':'stance'});E(g,{k:'num',s,i,t:u.m==='g'?'🛡️ GUARDIA':'⚔️ ATAQUE',c:'b'});L(g,`${D[u.id].n} (${nm(s)}) pasa a modo ${u.m==='g'?'Guardia':'Ataque'}.`)}
function hit(g,s,i,n,cb){const u=g[s].f[i];if(!u)return;const d=D[u.id];if(cb&&d.ar)n=Math.max(0,n-d.ar);if(d.sd&&!u.sh){u.sh=true;n=Math.max(0,n-2)}u.hp-=n;E(g,{k:'num',s,i,t:n?'-'+n:'🛡️',c:'r'});if(n)E(g,{k:'hit',s,i})}
function sweep(g){for(const s of['p','e'])g[s].f.forEach((u,i)=>{if(u&&u.hp<=0){g[s].ko.push(u.id);g[s].f[i]=null;L(g,`${D[u.id].n} (${nm(s)}) cae a la Pila de KO.`)}})}
function tg(g,s,id){const S=g[s],T=g[opp(s)],ix=(F,ok)=>F.map((u,i)=>u&&ok(u)?i:-1).filter(i=>i>=0);
 if(id==='cia'||id==='biggun')return ix(S.f,()=>1);
 if(id==='fire')return ix(T.f,u=>u.id!=='angela');
 if(id==='stasis')return ix(T.f,()=>1);
 return null}
function can(g,s,id){const t=tg(g,s,id);if(t)return t.length>0;if(D[id].t==='c')return g[s].f.includes(null)||(id==='spawn'&&g[s].f.some(u=>u&&u.id==='alsimmons'));if(id==='bums')return g[s].ko.length>0;return true}
function play(g,s,hi,o){const S=g[s],T=g[opp(s)],id=S.hand[hi],c=D[id];if(!id)return;
 const old=c.t==='c'?S.f[o.slot]:null,ev=id==='spawn'&&old&&old.id==='alsimmons',cost=ev?c.c-2:c.c;
 S.hand.splice(hi,1);if(s==='p')g.mull=false;g.m=clamp(g.m+(s==='p'?-cost:cost));
 L(g,`${nm(s)} juega ${c.n} (coste ${cost}${ev?', evoluciona a Al Simmons':''}).`);
 if(c.t==='c'){const u=mk(id);if(c.hs||(ev&&old.rdy))u.rdy=true;
  if(id==='spawn'&&S.ko.length){u.atk+=2;E(g,{k:'num',s,i:o.slot,t:'+2 ATK',c:'g'});L(g,'Spawn gana +2 ATK por la Pila de KO.')}
  S.f[o.slot]=u;E(g,{k:'snd',n:'place'});
  if(c.c>=5&&T.trap){spring(g,opp(s),'summon',{s,i:o.slot});sweep(g)}
  if(S.f[o.slot]===u){
  if(id==='overtkill'){T.f.forEach((_,i)=>hit(g,opp(s),i,2));L(g,'Overtkill: 2 de daño a cada personaje enemigo.')}
  if(id==='sam'){S.f.forEach((x,i)=>{if(x&&x!==u){x.atk++;E(g,{k:'num',s,i,t:'+1 ATK',c:'g'})}});L(g,'Sam & Twitch: tus demás personajes ganan +1 ATK.')}
  if(id==='commando'){T.hp-=3;E(g,{k:'num',s:opp(s),i:'hp',t:'-3',c:'r'});E(g,{k:'hit',s:opp(s),i:'hp'});L(g,'Commando Spawn: 3 de daño directo al HP rival.')}
  if(id==='redeemer'){const h=Math.min(4,S.mhp-S.hp);S.hp+=h;E(g,{k:'num',s,i:'hp',t:'+'+h+' HP',c:'g'});L(g,'Redeemer: recuperas '+h+' HP.')}
  if(id==='grandma'){S.f.forEach((x,i)=>{if(x){x.hp+=2;x.mx+=2;E(g,{k:'num',s,i,t:'+2 HP',c:'g'})}});L(g,'Grandma Blake: tus personajes ganan +2 HP.')}
  if(id==='urizen'){let b=-1;T.f.forEach((x,i)=>{if(x&&(b<0||x.atk>T.f[b].atk))b=i});if(b>=0){const x=T.f[b];E(g,{k:'num',s:opp(s),i:b,t:'KO',c:'r'});E(g,{k:'hit',s:opp(s),i:b});L(g,'Urizen destruye a '+D[x.id].n+'.');x.hp=0}}
  if(id==='cogliostro'){g.m=clamp(g.m+(s==='p'?1:-1));draw(g,s);L(g,'Cogliostro: +1 Necroplasma y roba 1 carta.')}}}
 else{E(g,{k:'snd',n:'energy'});
  if(id==='cia'){const u=S.f[o.tg];E(g,{k:'num',s,i:o.tg,t:o.md==='atk'?'+3 ATK':'+4 HP',c:'g'});if(o.md==='atk')u.atk+=3;else{u.hp+=4;u.mx+=4}L(g,`${D[u.id].n} recibe ${o.md==='atk'?'+3 ATK':'+4 HP'}.`)}
  if(id==='fire'){const u=T.f[o.tg];hit(g,opp(s),o.tg,5);L(g,`Elemental Fire quema a ${D[u.id].n}.`)}
  if(id==='bums'&&S.ko.length){const k=S.ko.pop();S.hand.push(k);L(g,`Recupera ${D[k].n} de la Pila de KO.`)}
  if(id==='blast'){T.hp-=3;S.hp-=1;L(g,`Necro-Blast: -3 HP al rival y -1 HP propio (${nm(s)}).`)}
  if(id==='stasis'){T.f[o.tg].fz=true;E(g,{k:'num',s:opp(s),i:o.tg,t:'❄️',c:'b'});L(g,`${D[T.f[o.tg].id].n} queda congelado.`)}
  if(id==='biggun'){const u=S.f[o.tg];u.atk+=4;E(g,{k:'num',s,i:o.tg,t:'+4 ATK',c:'g'});if(u.n&&!u.fz)u.rdy=true;L(g,'Big Gun: '+D[u.id].n+' gana +4 ATK.')}
  if(id==='media'){draw(g,s);draw(g,s);L(g,'Media Contact: roba 2 cartas.')}
  S.ko.push(id)}
 sweep(g);win(g);
 if(!g.over&&((s==='p'&&g.m<0)||(s==='e'&&g.m>0))){L(g,`${nm(s)} cruza el medidor: el turno termina.`);endTurn(g,s,Math.abs(g.m))}}
function attack(g,s,ai,ti){const S=g[s],o=opp(s),T=g[o],a=S.f[ai];if(!a||!a.rdy||a.m==='g')return;
 if(ti<0){if(guarded(T))return;a.rdy=false;E(g,{k:'lunge',s,i:ai});
  if(T.trap&&spring(g,o,'direct',{s,i:ai})){sweep(g);win(g);return}
  if(a.hp<=0){sweep(g);win(g);return}
  T.hp-=a.atk;E(g,{k:'snd',n:'hit'});E(g,{k:'num',s:o,i:'hp',t:'-'+a.atk,c:'r'});E(g,{k:'hit',s:o,i:'hp'});L(g,`${D[a.id].n} (${nm(s)}) ataca directo: -${a.atk} HP.`)}
 else{const t=T.f[ti];if(!t)return;a.rdy=false;E(g,{k:'lunge',s,i:ai});E(g,{k:'snd',n:'hit'});const d=D[t.id];let av=a.atk;if(a.id==='angela'&&(d.d||d.c>=4))av+=2;
  hit(g,o,ti,av,1);hit(g,s,ai,t.atk,1);L(g,`${D[a.id].n} (${nm(s)}) ataca a ${d.n}: ${av} de daño, recibe ${t.atk}.`)}
 sweep(g);win(g)}
function aiOpts(g,s,id){const S=g[s],T=g[opp(s)],t=tg(g,s,id);
 if(D[id].t==='c'){const e=S.f.indexOf(null);return{slot:e>=0?e:S.f.findIndex(u=>u&&u.id==='alsimmons')}}
 if(id==='cia'||id==='biggun'){const i=t.sort((a,b)=>S.f[b].atk-S.f[a].atk)[0];return{tg:i,md:S.f[i].hp>=5?'atk':'hp'}}
 const sc=i=>(id==='fire'&&T.f[i].hp<=5?100:0)+T.f[i].atk;
 if(t)return{tg:t.sort((a,b)=>sc(b)-sc(a))[0]};
 return{}}
function aiStep(g){const s='e',S=g.e,P=g.p,en=-g.m,pol=POL[g.boss]||POL.malebolgia;
 if(g.ai==='main'){let best=-1,bs=0;
  if(g.at===null)g.at=Math.random()<pol.trap;
  if(g.at&&!S.trap&&en>=1){const i=S.hand.findIndex(id=>id==='stasis'||(id==='fire'&&!tg(g,s,id).some(k=>P.f[k].hp<=5)));if(i>=0){setTrap(g,s,i);return}}
  S.hand.forEach((id,i)=>{const c=D[id];if(c.c>en||!can(g,s,id))return;let sc=c.c*2;
   if(id==='blast')sc=(P.hp<=3||(S.hp>8&&!P.f.some(Boolean)))?20:0;
   if(id==='fire')sc=tg(g,s,id).some(k=>P.f[k].hp<=5)?14:6;
   if(id==='stasis')sc=P.f.some(u=>u&&u.atk>=6)?9:2;
   if(id==='bums')sc=5;
   if(id==='cia')sc=7;if(id==='biggun')sc=8;if(id==='media')sc=S.hand.length<5?6:1;
   if(c.t==='c'&&!S.f.some(Boolean))sc+=5;
   if(sc>bs){bs=sc;best=i}});
  if(best>=0){play(g,s,best,aiOpts(g,s,S.hand[best]));return}
  g.ai='stance';return}
 if(g.ai==='stance'){S.f.forEach((u,i)=>{if(u&&u.m==='g'&&!u.tg&&!u.fz&&(P.hp<=u.atk||Math.random()>pol.guard))toggle(g,s,i)});g.ai='combat';return}
 if(g.ai==='combat'){const ai=S.f.findIndex(u=>u&&u.rdy&&u.m!=='g');if(ai<0){g.ai='final';return}
  const a=S.f[ai],face=!guarded(P);
  let bi=-1,bsc=0;
  P.f.forEach((t,i)=>{if(!t)return;const d=D[t.id],av=a.atk+(a.id==='angela'&&(d.d||d.c>=4)?2:0);
   const k=av>=t.hp+(D[t.id].sd&&!t.sh?2:0),sv=t.atk<a.hp;if(!k&&!sv)return;
   const sc=(k?3:0)+(sv?2:0)+d.c/10;if(sc>bsc){bsc=sc;bi=i}});
  const fs=face?(P.hp<=a.atk?100:(P.f.some(Boolean)?1+pol.face:6+pol.face)):-1;
  if(fs>bsc){attack(g,s,ai,-1);return}
  if(bi<0){a.rdy=false;return}
  attack(g,s,ai,bi);return}
 if(g.ai==='final'){S.f.forEach((u,i)=>{if(u&&u.m==='a'&&!u.tg&&!u.rdy&&Math.random()<(S.hp<=6?.8:pol.guard))toggle(g,s,i)});g.ai='end';return}
 const i=S.hand.findIndex(id=>D[id].t==='c'&&can(g,s,id)&&D[id].c>en);
 if(i>=0&&Math.random()<.5){play(g,s,i,aiOpts(g,s,S.hand[i]));return}
 L(g,'El rival pasa su turno.');endTurn(g,s,3)}

/* ===================== INTERFAZ (DOM, sin frameworks) ===================== */
const $=id=>document.getElementById(id),esc=t=>String(t).replace(/"/g,'&quot;');
let g=null,sh=null,su=null,ch=null,zm=null,dc=false,pick=true,aiT=0;const an={};
const ctx=()=>{const mine=g.turn==='p'&&!g.over,hid=mine&&g.ph==='main'&&sh!=null?g.p.hand[sh]:null;return{mine,hid,tl:hid?tg(g,'p',hid):null}};
const el=(s,i)=>document.querySelector(`[data-s="${s}"][data-i="${i}"]`);

function cardHTML(id,u,cls='',extra=''){const c=D[id],isC=c.t==='c',a=u?u.atk:c.a,h=u?u.hp:c.h;
 return `<div class="card ${c.t} ${cls}${u&&u.m==='g'?' guard':''}${u&&!u.rdy&&!u.fz&&!u.fn?' tired':''}" title="${esc(c.n+': '+c.x)}" ${extra}>
 <div class="lc"><div class="sk">💀</div><div class="sv g"><small>COSTE</small>${c.c}</div><div class="sv r"><small>ATK</small>${isC?a:'–'}</div><div class="sv y"><small>HP</small>${isC?h:'–'}</div><div class="no">${c.number}</div></div>
 <div class="rc"><div class="fc">${c.f}</div><div class="fr">${cardArt(c.number,c.i)}</div><div class="nm">${c.n}</div></div>
 ${u?`<div class="bd" title="${u.fz||u.fn?'Congelado':u.rdy?'Listo para atacar':'Agotado'}">${u.fz||u.fn?'❄️':u.rdy?'⚔️':'💤'}</div>`:''}${u&&u.m==='g'?'<div class="md" title="Modo Guardia">🛡️</div>':''}</div>`}

function rowHTML(s,x){const S=g[s],{hid,tl,mine}=x;
 let h=`<div class="pile"><span>MAZO</span><b>${S.deck.length}</b></div><div class="pile"><span>PILA KO</span><b>${S.ko.length}</b><span>${S.ko.length?D[S.ko[S.ko.length-1]].n:'vacía'}</span></div>`;
 h+=`<div class="slot trapslot" data-s="${s}" data-i="trap" title="${s==='p'&&S.trap?'Tu carta oculta: '+esc(D[S.trap].n):'Ranura de carta oculta'}"><span class="lbl">OCULTA</span>${S.trap?`<div class="card back" ${s==='p'?`data-zid="${S.trap}"`:''}></div>`:''}</div>`;
 S.f.forEach((u,i)=>{let gl='';
  if(hid){const c=D[hid];if(c.t==='c'&&s==='p'&&(!u||(hid==='spawn'&&u.id==='alsimmons')))gl='glow';else if((hid==='cia'||hid==='biggun')&&s==='p'&&tl.includes(i))gl='glow';else if((hid==='fire'||hid==='stasis')&&s==='e'&&tl.includes(i))gl='glow'}
  if(mine&&g.ph==='combat'){if(s==='p'&&u&&u.rdy&&u.m!=='g')gl='rdyc';if(s==='e'&&u&&su!=null)gl='glow';if(s==='p'&&su===i)gl='sel'}
  h+=`<div class="slot ${gl}${an[s+i]||''}" data-s="${s}" data-i="${i}">${u?cardHTML(u.id,u,'',`data-zid="${u.id}" data-zu="${s},${i}"`):''}${u&&s==='p'&&mine&&!u.tg?`<button class="mbtn" data-mode="${i}">${u.m==='g'?'⚔️ ATAQUE':'🛡️ GUARDIA'}</button>`:''}</div>`});
 return h}

function hpHTML(s,x){const hp=Math.max(0,g[s].hp),can=s==='e'&&x.mine&&g.ph==='combat'&&su!=null&&!guarded(g.e),e=$(s+'-hp');
 e.className='hp '+(can?'glow':'')+(an[s+'hp']||'');
 e.innerHTML=`<b>${s==='e'?BOSSES[g.boss].n:'TÚ'}</b><div class="bar"><div style="width:${hp/g[s].mhp*100}%"></div></div><b>♥ ${hp}</b>`}

function renderZoom(){const z=$('zoom'),f=$('zoom-fx');
 if(!zm){z.innerHTML='<p style="color:#8a9a9e">Pasa el ratón (o toca) una carta para verla en grande.</p>';f.hidden=true;return}
 const c=D[zm.id];z.innerHTML=cardHTML(zm.id,zm.u);f.hidden=false;f.innerHTML=`<b>${c.n}</b> <small>#${c.number} · ${c.f}</small><p>${c.x}</p>`}

function render(){const x=ctx(),en=g.turn==='p'?g.m:-g.m,needsT=x.hid&&x.tl!==null;
 hpHTML('e',x);hpHTML('p',x);
 $('e-hand').innerHTML=g.e.hand.map(()=>'<div class="card back" style="--cw:38px"></div>').join('');
 $('e-field').innerHTML=rowHTML('e',x);$('p-field').innerHTML=rowHTML('p',x);
 $('meter-label').textContent=`Necroplasma de ${g.turn==='p'?'tu':'su'} turno: ${Math.max(0,en)}`;
 $('meter').innerHTML=Array.from({length:21},(_,k)=>{const v=k-10;return `<i class="${v===g.m?'on':v<0?'n':v>0?'p':''}">${v===g.m?v:''}</i>`}).join('');
 $('p-hand').innerHTML=g.p.hand.map((id,i)=>cardHTML(id,null,(sh===i?'sel ':'')+(can(g,'p',id)?'':'dim'),`data-h="${i}" data-zid="${id}"`)).join('');
 $('hint').textContent=g.over?'Partida terminada.':g.turn==='e'?'Turno del rival…':g.ph==='main'?(x.hid?(needsT?'Elige un objetivo resaltado.':'Pulsa JUGAR o elige una zona vacía.'):'Elige una carta de tu mano.'):(su==null?'Elige un personaje con ⚔ y luego su objetivo. Si el rival no tiene personajes en Guardia 🛡️, puedes atacar su HP.':'Elige el objetivo enemigo.');
 $('btn-play').hidden=!(x.hid&&!needsT&&can(g,'p',x.hid));
 $('btn-trap').hidden=!(x.hid&&D[x.hid].t==='e'&&!g.p.trap);
 $('btn-mull').hidden=!(x.mine&&g.mull&&g.ph==='main');
 $('btn-combat').disabled=!x.mine||g.ph!=='main';$('btn-end').disabled=!x.mine;
 $('log').innerHTML=g.log.map(t=>`<div>${t}</div>`).join('');
 renderZoom();
 $('ov-boss').hidden=!pick;$('ov-ch').hidden=!ch;$('ov-end').hidden=!g.over||pick;
 if(g.over){$('end-title').textContent=g.over==='p'?'VICTORIA':'DERROTA';$('end-msg').textContent=g.over==='p'?'El Infierno se queda sin campeón.':'El rival te deja sin HP.'}
 const dv=dc&&g.p.hand.length>7;$('ov-disc').hidden=!dv;
 if(dv){$('disc-n').textContent=g.p.hand.length-7;$('disc-hand').innerHTML=g.p.hand.map((id,i)=>cardHTML(id,null,'',`data-d="${i}" data-zid="${id}"`)).join('')}
 $('btn-sound').textContent=SND?'🔊 SONIDO ON':'🔇 SONIDO OFF'}

/* ---- Eventos visuales: números flotantes, destellos, sonido ---- */
function floatNum(e){const t=el(e.s,e.i);if(!t)return;const r=t.getBoundingClientRect(),d=document.createElement('div');
 d.className='fl '+e.c;d.textContent=e.t;d.style.cssText=`position:fixed;left:${r.left+r.width/2}px;top:${r.top+r.height*.25}px`;document.body.appendChild(d);setTimeout(()=>d.remove(),1100)}
function flash(s,i,cl){const k=s+i;an[k]=(an[k]||'')+' '+cl;const e=el(s,i);if(e)e.classList.add(cl);
 setTimeout(()=>{delete an[k];const e2=el(s,i);if(e2)e2.classList.remove(cl)},520)}
function runEv(ev){const did={},once=n=>{if(!did[n]){did[n]=1;sfx(n)}};
 ev.forEach(e=>{if(e.k==='snd')return once(e.n);
  if(e.k==='num'){floatNum(e);if(e.c==='g'){once('buff');flash(e.s,e.i,'buff')}else if(e.c==='r'&&e.t!=='🛡️')once('hit');return}
  flash(e.s,e.i,e.k==='lunge'?'lunge'+e.s:e.k)})}

/* ---- Bucle de partida ---- */
function schedule(){clearTimeout(aiT);if(g.turn==='e'&&!g.over&&!pick)aiT=setTimeout(()=>upd(aiStep),g.ai==='main'?900:700)}
function upd(f){const t0=g.turn;g.ev=[];f(g);if(g.turn!==t0){sh=su=null;dc=false}render();runEv(g.ev);schedule()}
function start(k){g=newGame(k);pick=false;sh=su=ch=zm=null;dc=false;render();runEv(g.ev);g.ev=[];sfx('energy');schedule()}
const doPlay=(hi,o)=>{sh=null;ch=null;upd(n=>play(n,'p',hi,o))};
function clickSlot(s,i){const x=ctx();if(!x.mine)return;
 if(g.ph==='main'){if(!x.hid)return;const c=D[x.hid];
  if(c.t==='c'&&s==='p'&&(!g.p.f[i]||(x.hid==='spawn'&&g.p.f[i].id==='alsimmons')))return doPlay(sh,{slot:i});
  if((x.hid==='cia'||x.hid==='biggun')&&s==='p'&&x.tl.includes(i)){if(x.hid==='cia'){ch={tg:i};render();return}return doPlay(sh,{tg:i})}
  if((x.hid==='fire'||x.hid==='stasis')&&s==='e'&&x.tl.includes(i))return doPlay(sh,{tg:i});return}
 const u=g[s].f[i];if(!u)return;
 if(s==='p'){if(u.rdy&&u.m!=='g'){su=i;render()}}
 else if(su!=null){const a=su;su=null;upd(n=>attack(n,'p',a,i))}}
function face(){if(ctx().mine&&g.ph==='combat'&&su!=null&&!guarded(g.e)){const a=su;su=null;upd(n=>attack(n,'p',a,-1))}}

/* ---- Constructor de mazos e imágenes ---- */
const mgrMsg=t=>{$('mgr-msg').textContent=t};
const mgrArr=()=>$('mgr-deck').value.split(/[\s,;]+/).filter(Boolean).map(x=>x.padStart(3,'0'));
function mgrSync(){const a=mgrArr(),bad=a.filter(n=>!BYNUM[n]);$('mgr-count').textContent=`${a.length}/20 cartas${bad.length?' · inválidos: '+bad.join(', '):''}`}
const persist=()=>{try{localStorage.setItem('spawnTcgImgs',JSON.stringify(IM));return true}catch(e){mgrMsg('No hay espacio en localStorage: usa imágenes más pequeñas o quita otras.');return false}};
function mgrSave(go){const a=mgrArr(),bad=a.filter(n=>!BYNUM[n]);
 if(a.length!==20||bad.length){mgrMsg(bad.length?'Números inválidos: '+bad.join(', '):`El mazo debe tener 20 cartas (tienes ${a.length}).`);return}
 DECK=a;try{localStorage.setItem('spawnTcgDeck',JSON.stringify(a))}catch(e){}mgrMsg('Mazo guardado: se usa desde la próxima partida.');
 if(go){$('ov-mgr').hidden=true;start(g.boss)}}
function mgrOpen(){$('mgr-deck').value=(DECK||DEF_DECK).join(', ');mgrMsg('');mgrSync();$('ov-mgr').hidden=false}

function boot(){
 $('boss-list').innerHTML=Object.entries(BOSSES).map(([k,b])=>`<button class="boss" data-boss="${k}"><div class="bi">${b.i}</div><b>${b.n}</b><small>♥ ${b.hp} HP</small><p>${b.d}</p></button>`).join('');
 $('mgr-card').innerHTML=CARDS_DATABASE.map(k=>`<option value="${k.number}">${k.number} · ${k.name}</option>`).join('');
 $('mgr-chips').innerHTML=CARDS_DATABASE.map(k=>`<button data-add="${k.number}" title="${esc(k.name)}">${k.number}</button>`).join('');
 $('mgr-chips').onclick=e=>{const b=e.target.closest('[data-add]');if(!b)return;const t=$('mgr-deck'),v=t.value.trim().replace(/[,;]$/,'');t.value=v+(v?', ':'')+b.dataset.add;mgrSync()};
 $('mgr-deck').oninput=mgrSync;
 $('mgr-last').onclick=()=>{$('mgr-deck').value=mgrArr().slice(0,-1).join(', ');mgrSync()};
 $('mgr-def').onclick=()=>{$('mgr-deck').value=DEF_DECK.join(', ');mgrSync()};
 $('mgr-del').onclick=()=>{const n=$('mgr-card').value;delete IM[n];persist();mgrMsg('Imagen quitada de '+n);render()};
 $('mgr-save').onclick=()=>mgrSave(false);$('mgr-save-new').onclick=()=>mgrSave(true);$('mgr-close').onclick=()=>{$('ov-mgr').hidden=true};
 $('mgr-file').onchange=e=>{const num=$('mgr-card').value,fs=[...e.target.files];
  fs.forEach(f=>{const m=f.name.match(/(\d{3})/),n=fs.length===1?num:(m&&BYNUM[m[1]]?m[1]:null);
   if(!n){mgrMsg(`"${f.name}": el nombre no tiene un número de carta válido (ej. 001.jpg).`);return}
   const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,360/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);IM[n]=c.toDataURL('image/jpeg',.82);if(persist())mgrMsg('Imagen asignada a la carta '+n+'.');render()};im.src=r.result};r.readAsDataURL(f)});e.target.value=''};
 $('btn-bag').onclick=mgrOpen;$('btn-menu-bag').onclick=mgrOpen;
 $('btn-sound').onclick=()=>{SND=!SND;try{localStorage.setItem('spawnTcgSnd',SND?'1':'0')}catch(e){}sfx('place');render()};
 $('btn-new').onclick=()=>{pick=true;render()};$('end-new').onclick=()=>{pick=true;render()};
 $('btn-play').onclick=()=>{const hid=ctx().hid;if(hid==null)return;const e=g.p.f.indexOf(null);doPlay(sh,D[hid].t==='c'?{slot:e>=0?e:g.p.f.findIndex(u=>u&&u.id==='alsimmons')}:{})};
 $('btn-trap').onclick=()=>{const hi=sh;sh=null;upd(n=>setTrap(n,'p',hi))};
 $('btn-mull').onclick=()=>{sh=null;zm=null;upd(n=>mulligan(n))};
 $('btn-combat').onclick=()=>{sh=null;upd(n=>{n.ph='combat';L(n,'Fase de combate.')})};
 $('btn-end').onclick=()=>{if(g.p.hand.length>7){dc=true;render()}else upd(n=>{L(n,'Terminas tu turno.');endTurn(n,'p',3)})};
 $('ch-atk').onclick=()=>doPlay(sh,{tg:ch.tg,md:'atk'});$('ch-hp').onclick=()=>doPlay(sh,{tg:ch.tg,md:'hp'});$('ch-cancel').onclick=()=>{ch=null;render()};
 $('disc-cancel').onclick=()=>{dc=false;render()};
 document.addEventListener('click',e=>{const t=e.target;let b;
  if(b=t.closest('[data-mode]')){const i=+b.dataset.mode;if(su===i)su=null;upd(n=>toggle(n,'p',i));return}
  if(b=t.closest('[data-boss]')){start(b.dataset.boss);return}
  if(b=t.closest('[data-d]')){const i=+b.dataset.d;if(g.p.hand.length-1<=7)dc=false;
   upd(n=>{const d=n.p.hand.splice(i,1)[0];n.p.ko.push(d);E(n,{k:'snd',n:'discard'});L(n,'Descartas '+D[d].n+' por límite de mano.');if(n.p.hand.length<=7){L(n,'Terminas tu turno.');endTurn(n,'p',3)}});return}
  if(b=t.closest('#p-hand [data-h]')){const i=+b.dataset.h;zm={id:g.p.hand[i],u:null};if(ctx().mine&&g.ph==='main')sh=sh===i?null:i;render();return}
  if(b=t.closest('.slot[data-s]')){if(b.dataset.i!=='trap')clickSlot(b.dataset.s,+b.dataset.i);return}
  if(t.closest('#e-hp'))face()});
 document.addEventListener('pointerover',e=>{const c=e.target.closest('[data-zid]');if(!c)return;
  const [s,i]=(c.dataset.zu||'').split(','),u=s?g[s].f[+i]:null;if(zm&&zm.id===c.dataset.zid&&zm.u===u)return;zm={id:c.dataset.zid,u};renderZoom()});
 g=newGame('violator');render()}
boot();
