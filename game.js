/* SPAWN TCG: Necroplasma · game.js
   Reglas, IA e interfaz (sin audio). Usa CARDS_DATABASE/D/BYNUM de cards.js. */
let DECK=null;try{const x=JSON.parse(localStorage.getItem('spawnTcgDeck')||'null');if(Array.isArray(x)&&x.length===20&&x.every(n=>BYNUM[n]))DECK=x}catch(e){}
const BOSSES={
violator:{n:'Violator',hp:20,i:'😈',d:'Mazo agresivo: coste bajo, prisa y daño directo.',deck:["003","003","041","041","013","013","072","048","048","011","011","015","015","008","055","055","094","094","051","120"]},
wynn:{n:'Jason Wynn / CIA',hp:22,i:'🕴️',d:'Táctico: mejoras, cadenas, escudos y Stasis Field.',deck:["053","053","094","078","078","075","075","054","054","070","070","082","082","063","004","004","117","117","090","051"]},
malebolgia:{n:'Malebolgia',hp:25,i:'👁️',d:'Jefe: 25 HP iniciales, demonios y la Mano de Malebolgia.',deck:["119","119","005","005","014","038","038","039","039","030","030","001","001","085","085","087","087","052","051","055"]}};
const POL={violator:{face:4,trap:.2,guard:.1},wynn:{face:0,trap:.6,guard:.55},malebolgia:{face:2,trap:.3,guard:.3}};
/* Eventos "hostiles": los que Grandma Blake puede anular (jugados: HOSTILE · como trampa con efecto real: HTRAP) */
const HOSTILE=['fire','stasis','blast','hand'],HTRAP=['fire','stasis'];
const OWN_EQ=['cia','biggun','cape','horse'];   // Mejoras que se equipan a un personaje propio
let UID=0;
const mk=id=>({u:++UID,id,atk:D[id].a,hp:D[id].h,mx:D[id].h,rdy:false,fz:false,sh:false,n:1,m:'a',tg:false,fn:false,ak:false,ta:0,eq:null,gb:false,ha:false,cp:false,chn:false});
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const mkSide=(s,b)=>{const B=b&&BOSSES[b],dk=s==='p'?(DECK||DEF_DECK):(B?B.deck:DEF_DECK),hp=s==='e'&&B?B.hp:20;return{hp,mhp:hp,deck:shuffle(dk.map(n=>BYNUM[n])),hand:[],f:[null,null,null],ko:[],trap:null,sup:null}};
const opp=s=>s==='p'?'e':'p';
const nm=s=>s==='p'?'Tú':'Rival';
/* Referencia a carta dentro del historial: se pinta como [001 · Spawn] (verde = tuya, rojo = del rival) */
const C=(id,s)=>`«${id}|${s}»`;
const L=(g,t)=>{g.log.unshift(t);if(g.log.length>60)g.log.length=60};
const E=(g,e)=>g.ev.push(e);
const clamp=v=>Math.max(-10,Math.min(10,v));
function draw(g,s){const S=g[s];
 if(!S.deck.length){const had=S.ko.length;S.hp-=5;E(g,{k:'num',s,i:'hp',t:'-5',c:'r'});E(g,{k:'hit',s,i:'hp'});E(g,{k:'shake'});
  if(had){S.deck=shuffle(S.ko);S.ko=[];L(g,`${nm(s)}: mazo vacío. Baraja su Pila de KO (${had}) y recibe 5 de daño.`)}else L(g,`${nm(s)}: mazo vacío y sin Pila de KO, recibe 5 de daño.`)}
 if(S.deck.length)S.hand.push(S.deck.pop())}
function win(g){if(g.over)return;if(g.p.hp<=0)g.over='e';else if(g.e.hp<=0)g.over='p'}
function startTurn(g,s){g.turn=s;g.ph='main';g.ai='main';g.at=null;
 for(const x of['p','e'])g[x].f.forEach(u=>{if(u)u.sh=false});
 g[s].f.forEach((u,i)=>{if(u){u.tg=false;if(u.fn){u.fz=true;u.fn=false}u.rdy=!u.fz&&!u.chn;u.n=0;u.ak=false;const r=D[u.id].rg;if(r&&u.hp<u.mx){const h=Math.min(r,u.mx-u.hp);u.hp+=h;E(g,{k:'num',s,i,t:'+'+h+' HP',c:'g'})}}});
 if(g[s].sup&&g[s].sup.id==='medic')g[s].f.forEach((u,i)=>{if(u&&u.hp<u.mx){u.hp++;E(g,{k:'num',s,i,t:'+1 HP',c:'g'})}});
 draw(g,s);L(g,`— Turno ${s==='p'?'tuyo':'del rival'} (Necroplasma: ${s==='p'?g.m:-g.m}) —`);win(g)}
function trim(g,s){const S=g[s];while(S.hand.length>7){let k=S.hand.length-1;if(s==='e')k=S.hand.reduce((b,id,i)=>D[id].c<D[S.hand[b]].c?i:b,0);const id=S.hand.splice(k,1)[0];S.ko.push(id);L(g,`${nm(s)} descarta ${C(id,s)} por límite de mano (7).`)}}
function endTurn(g,s,en){if(s==='p')g.mull=false;trim(g,s);g[s].f.forEach(u=>{if(u){u.fz=false;if(u.ta){u.atk-=u.ta;u.ta=0}}});g.m=clamp(s==='p'?-en:en);startTurn(g,opp(s))}
function newGame(b){const g={p:mkSide('p'),e:mkSide('e',b),m:3,turn:'p',ph:'main',ai:'main',log:[],over:null,ev:[],boss:b,mull:true,at:null};
 for(let i=0;i<4;i++){draw(g,'p');draw(g,'e')}L(g,'¡Duelo contra '+BOSSES[b].n+'! Tienes 3 de Necroplasma.');startTurn(g,'p');return g}
const guarded=S=>S.f.some(u=>u&&u.m==='g');

/* ---- Mejoras continuas (fila de Apoyo) ---- */
/* Auras: Grandma Blake (+2 HP a Earthly Forces) y Hellfire Aura (+1 ATK a demonios) mientras estén en Apoyo.
   Se re-sincronizan tras cada cambio de campo, así afectan también a los personajes que entran después. */
function sync(g){for(const s of['p','e']){const S=g[s],a=S.sup&&S.sup.id;
 S.f.forEach((u,i)=>{if(!u)return;const f=D[u.id],gb=a==='grandma'&&f.f.includes('Earthly Forces'),ha=a==='hellfire'&&!!f.d;
  if(gb&&!u.gb){u.gb=true;u.hp+=2;u.mx+=2;E(g,{k:'num',s,i,t:'+2 HP',c:'g'})}
  else if(!gb&&u.gb){u.gb=false;u.mx-=2;if(u.hp>u.mx)u.hp=u.mx}
  if(ha&&!u.ha){u.ha=true;u.atk+=1;E(g,{k:'num',s,i,t:'+1 ATK',c:'g'})}
  else if(!ha&&u.ha){u.ha=false;u.atk-=1}})}}
function applyEq(g,sp,u){const s=sp.ts,i=g[s].f.indexOf(u),n=(t,c)=>E(g,{k:'num',s,i,t,c:c||'g'});
 if(sp.id==='cia'){if(sp.md==='atk')u.atk+=3;else{u.hp+=4;u.mx+=4}n(sp.md==='atk'?'+3 ATK':'+4 HP')}
 else if(sp.id==='biggun'){u.atk+=4;n('+4 ATK')}
 else if(sp.id==='cape'){u.cp=true;n('🛡️ ESCUDO')}
 else if(sp.id==='horse'){u.atk+=2;u.hp+=3;u.mx+=3;n('+2 ATK +3 HP')}
 else if(sp.id==='chains'){u.chn=true;u.rdy=false;n('⛓️','b')}}
function revertEq(u,sp){
 if(sp.id==='cia'){if(sp.md==='atk')u.atk-=3;else{u.mx-=4;if(u.hp>u.mx)u.hp=u.mx}}
 else if(sp.id==='biggun')u.atk-=4;
 else if(sp.id==='cape')u.cp=false;
 else if(sp.id==='horse'){u.atk-=2;u.mx-=3;if(u.hp>u.mx)u.hp=u.mx}
 else if(sp.id==='chains')u.chn=false;
 if(sp.id!=='chains')u.eq=null}
/* Saca la Mejora de la ranura de Apoyo, revierte su efecto y la manda a la Pila de KO */
function dropSup(g,s,why){const S=g[s],sp=S.sup;if(!sp)return;
 const U=g[sp.ts||s];if(sp.u&&U.f.includes(sp.u))revertEq(sp.u,sp);
 S.ko.push(sp.id);S.sup=null;L(g,`${C(sp.id,s)} (${nm(s)}) ${why||'se retira'} y va a la Pila de KO.`);sync(g)}
/* Suelta cualquier Mejora (de cualquier jugador) que esté ligada a este personaje */
function detach(g,u){for(const x of['p','e']){const sp=g[x].sup;if(sp&&sp.u===u)dropSup(g,x,'pierde a su portador')}}
/* Grandma Blake anula el primer Evento enemigo jugado contra su dueño (lado s). Devuelve true si lo anuló. */
function gblock(g,s){const S=g[s];if(!S.sup||S.sup.id!=='grandma')return false;
 E(g,{k:'reveal',id:'grandma',s,t:'¡Grandma Blake anula el Evento!'});
 dropSup(g,s,'anula el primer Evento enemigo');return true}

function spring(g,o,why,ref){const O=g[o],id=O.trap;if(!id)return false;O.trap=null;
 const u=g[ref.s].f[ref.i];let neg=false;
 E(g,{k:'reveal',id,s:o,trap:true,t:(o==='p'?'Activas tu Trampa: ':'El Rival activa su Trampa: ')+D[id].n});
 E(g,{k:'num',s:o,i:'trap',t:'¡TRAMPA!',c:'b'});
 L(g,`¡Trampa de ${nm(o)}! Se revela ${C(id,o)} (${why==='direct'?'ataque directo':'invocación de coste 5+'}).`);
 if(HTRAP.includes(id)&&gblock(g,ref.s)){O.ko.push(id);return false}
 if(id==='fire'){if(u&&u.id!=='angela'){hit(g,ref.s,ref.i,5);L(g,`${C('fire',o)} quema a ${C(u.id,ref.s)}.`);if(u.hp<=0)neg=true}else L(g,'El fuego no afecta a Angela.')}
 else if(id==='stasis'){if(u){u.fn=true;u.rdy=false;E(g,{k:'num',s:ref.s,i:ref.i,t:'❄️',c:'b'});L(g,`${C(u.id,ref.s)} queda congelado.`);neg=why==='direct'}}
 else if(id==='bums'){if(O.ko.length){const k=O.ko.pop();O.hand.push(k);L(g,`Recupera ${C(k,o)} de la Pila de KO.`)}}
 else if(id==='media'){draw(g,o);draw(g,o);L(g,'Media Contact: roba 2 cartas.')}
 O.ko.push(id);return neg}
function setTrap(g,s,hi){const S=g[s],id=S.hand[hi];if(!id||S.trap||D[id].t!=='e')return;
 S.hand.splice(hi,1);S.trap=id;if(s==='p')g.mull=false;
 g.m=clamp(g.m+(s==='p'?-1:1));L(g,`${nm(s)} coloca una carta boca abajo (coste 1).`);
 if(!g.over&&((s==='p'&&g.m<0)||(s==='e'&&g.m>0))){L(g,`${nm(s)} cruza el medidor: el turno termina.`);endTurn(g,s,Math.abs(g.m))}}
function mulligan(g){const S=g.p;if(!g.mull)return;g.mull=false;S.deck.push(...S.hand);S.hand=[];shuffle(S.deck);for(let i=0;i<4;i++)draw(g,'p');L(g,'Mulligan: barajas tu mano y robas 4 cartas nuevas.')}
function toggle(g,s,i){const u=g[s].f[i];if(!u||u.tg)return;u.m=u.m==='g'?'a':'g';u.tg=true;E(g,{k:'num',s,i,t:u.m==='g'?'🛡️ GUARDIA':'⚔️ ATAQUE',c:'b'});L(g,`${C(u.id,s)} (${nm(s)}) pasa a modo ${u.m==='g'?'Guardia':'Ataque'}.`)}
function hit(g,s,i,n,cb){const u=g[s].f[i];if(!u)return;const d=D[u.id];if(cb&&d.ar)n=Math.max(0,n-d.ar);if((d.sd||u.cp)&&!u.sh){u.sh=true;n=Math.max(0,n-2)}u.hp-=n;E(g,{k:'num',s,i,t:n?'-'+n:'🛡️',c:'r'});if(n){E(g,{k:'hit',s,i});if(n>=5)E(g,{k:'shake'})}}
/* Retira personajes muertos (su Mejora equipada, o las Cadenas que lo ataban, también caen) y re-sincroniza las auras */
function sweep(g){for(const s of['p','e']){const S=g[s];S.f.forEach((u,i)=>{if(u&&u.hp<=0){S.ko.push(u.id);S.f[i]=null;L(g,`${C(u.id,s)} (${nm(s)}) cae a la Pila de KO.`);
  for(const x of['p','e']){const X=g[x];if(X.sup&&X.sup.u===u){X.ko.push(X.sup.id);L(g,`${C(X.sup.id,x)} cae a la Pila de KO junto a su portador.`);X.sup=null}}}})}
 sync(g)}
function tg(g,s,id){const S=g[s],T=g[opp(s)],ix=(F,ok)=>F.map((u,i)=>u&&ok(u)?i:-1).filter(i=>i>=0);
 if(OWN_EQ.includes(id)||id==='fast_attack')return ix(S.f,()=>1);
 if(id==='fire')return ix(T.f,u=>u.id!=='angela');
 if(id==='stasis'||id==='chains')return ix(T.f,()=>1);
 if(id==='hand')return S.f.includes(null)?ix(T.f,u=>D[u.id].c<=5):[];
 return null}
function can(g,s,id){const t=tg(g,s,id);if(t)return t.length>0;if(D[id].t==='c')return g[s].f.includes(null)||(id==='spawn'&&g[s].f.some(u=>u&&u.id==='alsimmons'));if(id==='bums')return g[s].ko.length>0;return true}
function play(g,s,hi,o){const S=g[s],T=g[opp(s)],id=S.hand[hi],c=D[id];if(!id)return;
 const old=c.t==='c'?S.f[o.slot]:null,ev=id==='spawn'&&old&&old.id==='alsimmons',cost=ev?c.c-2:c.c;
 S.hand.splice(hi,1);if(s==='p')g.mull=false;g.m=clamp(g.m+(s==='p'?-cost:cost));
 L(g,`${nm(s)} juega ${C(id,s)} (coste ${cost}${ev?', evoluciona a Al Simmons':''}).`);
 if(c.t==='c'){const u=mk(id);if(c.hs||(ev&&old.rdy))u.rdy=true;
  if(id==='spawn'&&S.ko.length){u.atk+=2;E(g,{k:'num',s,i:o.slot,t:'+2 ATK',c:'g'});L(g,`${C(id,s)} gana +2 ATK por la Pila de KO.`)}
  S.f[o.slot]=u;
  if(ev){u.ak=old.ak;if(S.sup&&S.sup.u===old){S.sup.u=u;u.eq=S.sup.id;applyEq(g,S.sup,u)}}
  sync(g);
  if(c.c>=5&&T.trap){spring(g,opp(s),'summon',{s,i:o.slot});sweep(g)}
  if(S.f[o.slot]===u){
  if(id==='overtkill'){T.f.forEach((_,i)=>hit(g,opp(s),i,2));L(g,`${C(id,s)}: 2 de daño a cada personaje enemigo.`)}
  if(id==='sam'){S.f.forEach((x,i)=>{if(x&&x!==u){x.atk++;E(g,{k:'num',s,i,t:'+1 ATK',c:'g'})}});L(g,`${C(id,s)}: tus demás personajes ganan +1 ATK.`)}
  if(id==='commando'){T.hp-=3;E(g,{k:'num',s:opp(s),i:'hp',t:'-3',c:'r'});E(g,{k:'hit',s:opp(s),i:'hp'});L(g,`${C(id,s)}: 3 de daño directo al HP rival.`)}
  if(id==='tony'){T.hp-=2;E(g,{k:'num',s:opp(s),i:'hp',t:'-2',c:'r'});E(g,{k:'hit',s:opp(s),i:'hp'});L(g,`${C(id,s)}: 2 de daño directo al HP rival.`)}
  if(id==='cogliostro'){g.m=clamp(g.m+(s==='p'?1:-1));draw(g,s);L(g,`${C(id,s)}: +1 Necroplasma y roba 1 carta.`)}
  if(id==='terry'){draw(g,s);L(g,`${C(id,s)}: robas 1 carta.`)}
  if(id==='wanda'){S.f.forEach((x,i)=>{if(x&&x!==u&&x.hp<x.mx){const h=Math.min(2,x.mx-x.hp);x.hp+=h;E(g,{k:'num',s,i,t:'+'+h+' HP',c:'g'})}});L(g,`${C(id,s)}: tus demás personajes recuperan 2 HP.`)}
  if(id==='redeemer'){const h=Math.min(4,S.mhp-S.hp);S.hp+=h;E(g,{k:'num',s,i:'hp',t:'+'+h+' HP',c:'g'});L(g,`${C(id,s)}: recuperas ${h} HP.`)}
  if(id==='curse'){let b=-1;T.f.forEach((x,i)=>{if(x&&(b<0||x.atk>T.f[b].atk))b=i});
   if(b>=0){const x=T.f[b];x.atk=Math.max(0,x.atk-2);E(g,{k:'num',s:opp(s),i:b,t:'-2 ATK',c:'r'});L(g,`${C(id,s)} maldice a ${C(x.id,opp(s))}: -2 ATK.`)}}}}
 else if(c.t==='m'){
  if(S.sup)dropSup(g,s,'es reemplazada');
  const ts=id==='chains'?opp(s):s;
  S.sup={id,u:null,md:o.md||null,ts};E(g,{k:'buff',s,i:'sup'});
  if(OWN_EQ.includes(id)||id==='chains'){const u=g[ts].f[o.tg];S.sup.u=u;if(id!=='chains')u.eq=id;applyEq(g,S.sup,u);
   if(id==='biggun'&&u.n&&!u.ak&&!u.fz&&!u.chn)u.rdy=true;
   L(g,`${C(id,s)} se ${id==='chains'?'enrolla en':'equipa a'} ${C(u.id,ts)}.`)}
  else L(g,`${C(id,s)} queda activa en la ranura de Apoyo.`);
  sync(g)}
 else{
  E(g,{k:'reveal',id,s,t:(s==='p'?'Juegas: ':'El Rival juega: ')+c.n});
  const blk=HOSTILE.includes(id)&&gblock(g,opp(s));
  if(!blk){
   if(id==='fire'){const u=T.f[o.tg];hit(g,opp(s),o.tg,5);L(g,`${C(id,s)} quema a ${C(u.id,opp(s))}.`)}
   if(id==='bums'&&S.ko.length){const k=S.ko.pop();S.hand.push(k);L(g,`Recupera ${C(k,s)} de la Pila de KO.`)}
   if(id==='blast'){T.hp-=3;S.hp-=1;L(g,`${C(id,s)}: -3 HP al rival y -1 HP propio (${nm(s)}).`)}
   if(id==='stasis'){T.f[o.tg].fz=true;E(g,{k:'num',s:opp(s),i:o.tg,t:'❄️',c:'b'});L(g,`${C(T.f[o.tg].id,opp(s))} queda congelado.`)}
   if(id==='fast_attack'){const u=S.f[o.tg];u.atk+=2;u.ta=(u.ta||0)+2;E(g,{k:'num',s,i:o.tg,t:'+2 ATK',c:'g'});
    if(u.n&&!u.ak&&!u.fz&&!u.chn)u.rdy=true;
    L(g,`${C(id,s)}: ${C(u.id,s)} gana +2 ATK y Prisa este turno.`)}
   if(id==='media'){draw(g,s);draw(g,s);L(g,`${C(id,s)}: roba 2 cartas.`)}
   if(id==='necroplasm'){g.m=clamp(g.m+(s==='p'?3:-3));L(g,`${C(id,s)}: recuperas 3 de Necroplasma.`)}
   if(id==='hand'){const k=S.f.indexOf(null),u=T.f[o.tg];
    if(u&&k>=0&&D[u.id].c<=5){detach(g,u);T.f[o.tg]=null;S.f[k]=u;u.rdy=false;u.n=0;u.tg=false;
     E(g,{k:'num',s,i:k,t:'✋ CONTROL',c:'b'});L(g,`${C(id,s)}: ${nm(s)} toma el control de ${C(u.id,s)} (entra agotado).`)}
    else L(g,`${C(id,s)} no encuentra objetivo válido.`)}}
  S.ko.push(id)}
 sweep(g);win(g);
 if(!g.over&&((s==='p'&&g.m<0)||(s==='e'&&g.m>0))){L(g,`${nm(s)} cruza el medidor: el turno termina.`);endTurn(g,s,Math.abs(g.m))}}
function attack(g,s,ai,ti){const S=g[s],o=opp(s),T=g[o],a=S.f[ai];if(!a||!a.rdy||a.m==='g')return;
 if(ti<0){if(guarded(T))return;a.rdy=false;a.ak=true;E(g,{k:'lunge',s,i:ai});
  if(T.trap&&spring(g,o,'direct',{s,i:ai})){sweep(g);win(g);return}
  if(a.hp<=0){sweep(g);win(g);return}
  T.hp-=a.atk;E(g,{k:'num',s:o,i:'hp',t:'-'+a.atk,c:'r'});E(g,{k:'hit',s:o,i:'hp'});if(a.atk>=5)E(g,{k:'shake'});L(g,`${C(a.id,s)} ataca directo: -${a.atk} HP.`)}
 else{const t=T.f[ti];if(!t)return;a.rdy=false;a.ak=true;E(g,{k:'lunge',s,i:ai});const d=D[t.id];let av=a.atk;if(a.id==='angela'&&(d.d||d.c>=4))av+=2;
  hit(g,o,ti,av,1);hit(g,s,ai,t.atk,1);L(g,`${C(a.id,s)} ataca a ${C(t.id,o)}: ${av} de daño, recibe ${t.atk}.`)}
 sweep(g);win(g)}
function aiOpts(g,s,id){const S=g[s],T=g[opp(s)],t=tg(g,s,id);
 if(D[id].t==='c'){const e=S.f.indexOf(null);return{slot:e>=0?e:S.f.findIndex(u=>u&&u.id==='alsimmons')}}
 if(OWN_EQ.includes(id)){const i=t.sort((a,b)=>S.f[b].atk-S.f[a].atk)[0];return{tg:i,md:S.f[i].hp>=5?'atk':'hp'}}
 if(id==='fast_attack'){const w=i=>{const u=S.f[i];return(u.n&&!u.ak&&!u.fz&&!u.chn&&u.m!=='g'?10:u.rdy&&u.m!=='g'?5:0)+u.atk};return{tg:t.sort((a,b)=>w(b)-w(a))[0]}}
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
   if(id==='grandma')sc=S.f.some(u=>u&&D[u.id].f.includes('Earthly Forces'))?8:3;
   if(id==='fast_attack')sc=S.f.some(u=>u&&u.n&&!u.ak&&!u.fz&&!u.chn&&u.m!=='g')?9:(S.f.some(u=>u&&u.rdy&&u.m!=='g')?5:0);
   if(id==='necroplasm')sc=S.hand.some(h=>D[h].c>en)?9:2;
   if(id==='hand')sc=16;
   if(id==='cape')sc=6;if(id==='horse')sc=7;
   if(id==='chains')sc=P.f.some(u=>u&&u.atk>=5)?9:4;
   if(id==='hellfire')sc=S.f.filter(u=>u&&D[u.id].d).length>=2?9:3;
   if(id==='medic')sc=S.f.some(Boolean)?5:1;
   if(c.t==='m'&&S.sup)sc=0;
   if(c.t==='c'&&!S.f.some(Boolean))sc+=5;
   if(sc>bs){bs=sc;best=i}});
  if(best>=0){play(g,s,best,aiOpts(g,s,S.hand[best]));return}
  g.ai='stance';return}
 if(g.ai==='stance'){S.f.forEach((u,i)=>{if(u&&u.m==='g'&&!u.tg&&!u.fz&&(P.hp<=u.atk||Math.random()>pol.guard))toggle(g,s,i)});g.ai='combat';return}
 if(g.ai==='combat'){const ai=S.f.findIndex(u=>u&&u.rdy&&u.m!=='g');if(ai<0){g.ai='final';return}
  const a=S.f[ai],face=!guarded(P);
  let bi=-1,bsc=0;
  P.f.forEach((t,i)=>{if(!t)return;const d=D[t.id],av=a.atk+(a.id==='angela'&&(d.d||d.c>=4)?2:0);
   const k=av>=t.hp+((D[t.id].sd||t.cp)&&!t.sh?2:0),sv=t.atk<a.hp;if(!k&&!sv)return;
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
let g=null,sh=null,su=null,ch=null,zm=null,dc=false,pick=true,aiT=0,busy=false,gen=0;const an={};
const ctx=()=>{const mine=g.turn==='p'&&!g.over,hid=mine&&g.ph==='main'&&sh!=null?g.p.hand[sh]:null;return{mine,hid,tl:hid?tg(g,'p',hid):null}};
const el=(s,i)=>document.querySelector(`[data-s="${s}"][data-i="${i}"]`);
const OWNT=id=>OWN_EQ.includes(id)||id==='fast_attack';          // objetivo: personaje propio
const ENT=id=>id==='fire'||id==='stasis'||id==='chains'||id==='hand';   // objetivo: personaje enemigo
/* Convierte las referencias «id|lado» del historial en nombres resaltados y pasables por el ratón */
const logHTML=t=>String(t).replace(/«([^|»]+)\|([pe])»/g,(m,id,s)=>D[id]?`<span class="lg ${s==='p'?'g':'r'}" data-zid="${id}">[${D[id].number} · ${D[id].n}]</span>`:m);

function cardHTML(id,u,cls='',extra=''){const c=D[id],isC=c.t==='c',a=u?u.atk:c.a,h=u?u.hp:c.h,
 st=u?[u.eq&&D[u.eq].i,u.chn&&'⛓️',u.gb&&'👵',u.ha&&'🌋'].filter(Boolean).join(''):'';
 return `<div class="card ${c.t} ${cls}${u&&u.m==='g'?' guard':''}${u&&!u.rdy&&!u.fz&&!u.fn?' tired':''}" title="${esc(c.n+': '+c.x)}" ${extra}>
 <div class="lc"><div class="sk">💀</div><div class="sv g"><small>COSTE</small>${c.c}</div><div class="sv r"><small>ATK</small>${isC?a:'–'}</div><div class="sv y"><small>HP</small>${isC?h:'–'}</div><div class="no">${c.number}</div></div>
 <div class="rc"><div class="fc">${c.f}</div><div class="fr">${cardArt(c.number,c.i)}</div><div class="nm">${c.n}</div></div>
 ${u?`<div class="bd" title="${u.fz||u.fn?'Congelado':u.chn?'Encadenado':u.rdy?'Listo para atacar':'Agotado'}">${u.fz||u.fn?'❄️':u.chn?'⛓️':u.rdy?'⚔️':'💤'}</div>`:''}${u&&u.m==='g'?'<div class="md" title="Modo Guardia">🛡️</div>':''}${st?`<div class="eq" title="Efectos activos sobre este personaje">${st}</div>`:''}</div>`}

/* Fila frontal: Mazo, Pila de KO y 3 casillas de personaje */
function fieldHTML(s,x){const S=g[s],{hid,tl,mine}=x;
 let h=`<div class="pile"><span>MAZO</span><b>${S.deck.length}</b></div><div class="pile"><span>PILA KO</span><b>${S.ko.length}</b><span>${S.ko.length?D[S.ko[S.ko.length-1]].n:'vacía'}</span></div>`;
 S.f.forEach((u,i)=>{let gl='';
  if(hid){const c=D[hid];if(c.t==='c'&&s==='p'&&(!u||(hid==='spawn'&&u.id==='alsimmons')))gl='glow';else if(OWNT(hid)&&s==='p'&&tl.includes(i))gl='glow';else if(ENT(hid)&&s==='e'&&tl.includes(i))gl='glow'}
  if(mine&&g.ph==='combat'){if(s==='p'&&u&&u.rdy&&u.m!=='g')gl='rdyc';if(s==='e'&&u&&su!=null)gl='glow';if(s==='p'&&su===i)gl='sel'}
  h+=`<div class="slot ${gl}${an[s+i]||''}" data-s="${s}" data-i="${i}">${u?cardHTML(u.id,u,'',`data-zid="${u.id}" data-zu="${s},${i}"`):''}${u&&s==='p'&&mine&&!u.tg?`<button class="mbtn" data-mode="${i}">${u.m==='g'?'⚔️ ATAQUE':'🛡️ GUARDIA'}</button>`:''}</div>`});
 return h}

/* Fila trasera: ranura de Apoyo (Mejora Continua activa) + ranura de Trampa boca abajo */
function supportHTML(s,x){const S=g[s],{hid,tl}=x,sp=S.sup;
 const gl=s==='p'&&hid&&D[hid].t==='m'&&tl===null?'glow':'';
 let h=`<div class="slot suppslot ${gl}${an[s+'sup']||''}" data-s="${s}" data-i="sup" title="${sp?esc(D[sp.id].n+' (Mejora Continua activa)'):'Ranura de Apoyo (Mejora Continua)'}">${sp?cardHTML(sp.id,null,'',`data-zid="${sp.id}"`):'<span class="lbl">APOYO</span>'}</div>`;
 h+=`<div class="slot trapslot" data-s="${s}" data-i="trap" title="${s==='p'&&S.trap?'Tu carta oculta: '+esc(D[S.trap].n):'Ranura de carta oculta'}"><span class="lbl">OCULTA</span>${S.trap?`<div class="card back" ${s==='p'?`data-zid="${S.trap}"`:''}></div>`:''}</div>`;
 return h}

function hpHTML(s,x){const hp=Math.max(0,g[s].hp),can=s==='e'&&x.mine&&g.ph==='combat'&&su!=null&&!guarded(g.e),e=$(s+'-hp');
 e.className='hp '+(can?'glow':'')+(an[s+'hp']||'');
 e.innerHTML=`<b>${s==='e'?BOSSES[g.boss].n:'TÚ'}</b><div class="bar"><div style="width:${hp/g[s].mhp*100}%"></div></div><b>♥ ${hp}</b>`}

function renderZoom(){const z=$('zoom'),f=$('zoom-fx');
 if(!zm){z.innerHTML='<p style="color:#8a9a9e">Pasa el ratón (o toca) una carta para verla en grande.</p>';f.hidden=true;return}
 const c=D[zm.id];z.innerHTML=cardHTML(zm.id,zm.u);f.hidden=false;f.innerHTML=`<b>${c.n}</b> <small>#${c.number} · ${c.f}</small><p>${c.x}</p>`}

function render(){const x=ctx(),en=g.turn==='p'?g.m:-g.m,needsT=x.hid&&x.tl!==null;
 hpHTML('e',x);hpHTML('p',x);
 $('e-hand').innerHTML=g.e.hand.map(()=>'<div class="card back" style="--cw:28px"></div>').join('');
 $('e-field').innerHTML=fieldHTML('e',x);$('p-field').innerHTML=fieldHTML('p',x);
 $('e-support').innerHTML=supportHTML('e',x);$('p-support').innerHTML=supportHTML('p',x);
 $('meter-label').textContent=`Necroplasma de ${g.turn==='p'?'tu':'su'} turno: ${Math.max(0,en)}`;
 $('meter').innerHTML=Array.from({length:21},(_,k)=>{const v=k-10;return `<i class="${v===g.m?'on':v<0?'n':v>0?'p':''}">${v===g.m?v:''}</i>`}).join('');
 $('p-hand').innerHTML=g.p.hand.map((id,i)=>cardHTML(id,null,(sh===i?'sel ':'')+(can(g,'p',id)?'':'dim'),`data-h="${i}" data-zid="${id}"`)).join('');
 $('hint').textContent=g.over?'Partida terminada.':g.turn==='e'?'Turno del rival…':g.ph==='main'?(x.hid?(needsT?'Elige un objetivo resaltado.':(D[x.hid].t==='m'?'Pulsa JUGAR o la ranura de Apoyo.':'Pulsa JUGAR o elige una zona vacía.')):'Elige una carta de tu mano.'):(su==null?'Elige un personaje con ⚔ y luego su objetivo. Si el rival no tiene personajes en Guardia 🛡️, puedes atacar su HP.':'Elige el objetivo enemigo.');
 $('btn-play').hidden=!(x.hid&&!needsT&&can(g,'p',x.hid));
 $('btn-trap').hidden=!(x.hid&&D[x.hid].t==='e'&&!g.p.trap);
 $('btn-mull').hidden=!(x.mine&&g.mull&&g.ph==='main');
 $('btn-combat').disabled=!x.mine||g.ph!=='main';$('btn-end').disabled=!x.mine;
 $('log').innerHTML=g.log.map(t=>`<div>${logHTML(t)}</div>`).join('');
 renderZoom();
 $('ov-boss').hidden=!pick;$('ov-ch').hidden=!ch;$('ov-end').hidden=!g.over||pick;
 if(g.over){$('end-title').textContent=g.over==='p'?'VICTORIA':'DERROTA';$('end-msg').textContent=g.over==='p'?'El Infierno se queda sin campeón.':'El rival te deja sin HP.'}
 const dv=dc&&g.p.hand.length>7;$('ov-disc').hidden=!dv;
 if(dv){$('disc-n').textContent=g.p.hand.length-7;$('disc-hand').innerHTML=g.p.hand.map((id,i)=>cardHTML(id,null,'',`data-d="${i}" data-zid="${id}"`)).join('')}}

/* ---- Eventos visuales: números flotantes, destellos, sacudida ---- */
function floatNum(e){const t=el(e.s,e.i);if(!t)return;const r=t.getBoundingClientRect(),d=document.createElement('div');
 d.className='fl '+e.c;d.textContent=e.t;d.style.cssText=`position:fixed;left:${r.left+r.width/2}px;top:${r.top+r.height*.25}px`;document.body.appendChild(d);setTimeout(()=>d.remove(),1100)}
function flash(s,i,cl){const k=s+i;an[k]=(an[k]||'')+' '+cl;const e=el(s,i);if(e)e.classList.add(cl);
 setTimeout(()=>{delete an[k];const e2=el(s,i);if(e2)e2.classList.remove(cl)},520)}
function shake(){const b=$('board');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');setTimeout(()=>b.classList.remove('shake'),450)}
function runEv(ev){let sk=false;
 ev.forEach(e=>{if(e.k==='reveal')return;if(e.k==='shake'){sk=true;return}
  if(e.k==='num'){floatNum(e);if(e.c==='g')flash(e.s,e.i,'buff');return}
  flash(e.s,e.i,e.k==='lunge'?'lunge'+e.s:e.k)});
 if(sk)shake()}

/* ---- Zona de Activación (#reveal): muestra cada Evento/Trampa 1.2 s en el centro antes de resolverse en el tablero ---- */
function showReveals(list,done){const rv=$('reveal'),my=gen;let k=0;busy=true;
 const next=()=>{
  if(my!==gen){rv.hidden=true;return}                       // se empezó otra partida: abandonar
  if(k>=list.length){rv.hidden=true;busy=false;return done()}
  const e=list[k++];
  $('reveal-card').innerHTML=cardHTML(e.id,null);$('reveal-who').textContent=e.t||'';
  rv.className='reveal'+(e.trap?' trap':'');
  rv.hidden=true;void rv.offsetWidth;rv.hidden=false;       // reinicia la animación
  setTimeout(next,1200)};
 next()}

/* ---- Bucle de partida ---- */
function schedule(){clearTimeout(aiT);if(g.turn==='e'&&!g.over&&!pick&&!busy)aiT=setTimeout(()=>upd(aiStep),g.ai==='main'?900:700)}
function upd(f){if(busy)return;const t0=g.turn;g.ev=[];f(g);if(g.turn!==t0){sh=su=null;dc=false}
 const rvs=g.ev.filter(e=>e.k==='reveal'),rest=g.ev.filter(e=>e.k!=='reveal'),
  fin=()=>{render();runEv(rest);schedule()};
 if(rvs.length)showReveals(rvs,fin);else fin()}
function start(k){gen++;busy=false;$('reveal').hidden=true;g=newGame(k);pick=false;sh=su=ch=zm=null;dc=false;render();runEv(g.ev);g.ev=[];schedule()}
const doPlay=(hi,o)=>{if(busy)return;sh=null;ch=null;upd(n=>play(n,'p',hi,o))};
function clickSlot(s,i){const x=ctx();if(!x.mine)return;
 if(g.ph==='main'){if(!x.hid)return;const c=D[x.hid];
  if(c.t==='c'&&s==='p'&&(!g.p.f[i]||(x.hid==='spawn'&&g.p.f[i].id==='alsimmons')))return doPlay(sh,{slot:i});
  if(OWNT(x.hid)&&s==='p'&&x.tl.includes(i)){if(x.hid==='cia'){ch={tg:i};render();return}return doPlay(sh,{tg:i})}
  if(ENT(x.hid)&&s==='e'&&x.tl.includes(i))return doPlay(sh,{tg:i});return}
 const u=g[s].f[i];if(!u)return;
 if(s==='p'){if(u.rdy&&u.m!=='g'){su=i;render()}}
 else if(su!=null){const a=su;su=null;upd(n=>attack(n,'p',a,i))}}
function clickSup(){const x=ctx();if(x.mine&&g.ph==='main'&&x.hid&&D[x.hid].t==='m'&&x.tl===null&&can(g,'p',x.hid))doPlay(sh,{})}
function face(){if(ctx().mine&&g.ph==='combat'&&su!=null&&!guarded(g.e)){const a=su;su=null;upd(n=>attack(n,'p',a,-1))}}

/* ---- Constructor de mazos e imágenes (Vista Galería / Vista Lista, máx. 2 copias por carta, 20 cartas) ---- */
const MAXC=2,TYN={c:'Personaje',m:'Mejora',e:'Evento'};
let MD=[],MV='gal';
const mgrMsg=t=>{$('mgr-msg').textContent=t};
const cnt=n=>MD.filter(x=>x===n).length;
const sorted=()=>CARDS_DATABASE.slice().sort((a,b)=>a.number.localeCompare(b.number));
function mgrAdd(n){if(MD.length>=20){mgrMsg('El mazo ya tiene 20 cartas.');return}if(cnt(n)>=MAXC){mgrMsg(`Máximo ${MAXC} copias de cada carta.`);return}MD.push(n);MD.sort();mgrMsg('');mgrRender()}
function mgrDel(n){const i=MD.indexOf(n);if(i>=0){MD.splice(i,1);mgrMsg('');mgrRender()}}
function mgrRender(){const gal=MV==='gal',body=$('mgr-body'),st=body.scrollTop;
 $('mgr-gal').hidden=!gal;$('mgr-list').hidden=gal;
 $('mgr-v-gal').classList.toggle('on',gal);$('mgr-v-list').classList.toggle('on',!gal);
 $('mgr-count').textContent=`${MD.length}/20`;$('mgr-count').className=MD.length===20?'ok':'';
 if(gal)$('mgr-gal').innerHTML=sorted().map(k=>{const n=cnt(k.number);
  return `<div class="gt ${n>=MAXC?'full':n?'':'zero'}"><div data-add="${k.number}">${cardHTML(k.key,null)}</div><div class="gc"><button type="button" data-del="${k.number}" title="Quitar una copia">−</button><b>${n}/${MAXC}</b><button type="button" data-add="${k.number}" title="Añadir una copia">+</button></div></div>`}).join('');
 else $('mgr-list').innerHTML=sorted().map(k=>{const n=cnt(k.number),d=D[k.key];
  return `<div class="lr ${n?'has':''}" title="${esc(k.effect)}"><span class="ln">${k.number}</span><span>${k.name}</span><span class="lt">${TYN[d.t]}</span><span>⚡${d.c}</span><span class="lq"><button type="button" data-del="${k.number}">[-]</button><b>${n}/${MAXC}</b><button type="button" data-add="${k.number}">[+]</button></span></div>`}).join('');
 body.scrollTop=st}
const persist=()=>{try{localStorage.setItem('spawnTcgImgs',JSON.stringify(IM));return true}catch(e){mgrMsg('No hay espacio en localStorage: usa imágenes más pequeñas o quita otras.');return false}};
function mgrSave(go){
 if(MD.length!==20){mgrMsg(`El mazo debe tener 20 cartas (tienes ${MD.length}).`);return}
 DECK=MD.slice();try{localStorage.setItem('spawnTcgDeck',JSON.stringify(DECK))}catch(e){}mgrMsg('Mazo guardado: se usa desde la próxima partida.');
 if(go){$('ov-mgr').hidden=true;start(g.boss)}}
function mgrOpen(){MD=(DECK||DEF_DECK).slice().sort();mgrMsg('');mgrRender();$('ov-mgr').hidden=false}
const rulesShow=v=>{$('ov-rules').hidden=!v};

function boot(){
 $('boss-list').innerHTML=Object.entries(BOSSES).map(([k,b])=>`<button class="boss" data-boss="${k}"><div class="bi">${b.i}</div><b>${b.n}</b><small>♥ ${b.hp} HP</small><p>${b.d}</p></button>`).join('');
 $('mgr-card').innerHTML=sorted().map(k=>`<option value="${k.number}">${k.number} · ${k.name}</option>`).join('');
 const mgrClick=e=>{const a=e.target.closest('[data-add]'),d=e.target.closest('[data-del]');if(a)mgrAdd(a.dataset.add);else if(d)mgrDel(d.dataset.del)};
 $('mgr-gal').onclick=mgrClick;$('mgr-list').onclick=mgrClick;
 $('mgr-v-gal').onclick=()=>{MV='gal';mgrRender()};$('mgr-v-list').onclick=()=>{MV='list';mgrRender()};
 $('mgr-clear').onclick=()=>{MD=[];mgrMsg('');mgrRender()};
 $('mgr-def').onclick=()=>{MD=DEF_DECK.slice().sort();mgrMsg('');mgrRender()};
 $('mgr-del').onclick=()=>{const n=$('mgr-card').value;delete IM[n];persist();mgrMsg('Imagen quitada de '+n);render();mgrRender()};
 $('mgr-save').onclick=()=>mgrSave(false);$('mgr-save-new').onclick=()=>mgrSave(true);$('mgr-close').onclick=()=>{$('ov-mgr').hidden=true};
 $('mgr-file').onchange=e=>{const num=$('mgr-card').value,fs=[...e.target.files];
  fs.forEach(f=>{const m=f.name.match(/(\d{3})/),n=fs.length===1?num:(m&&BYNUM[m[1]]?m[1]:null);
   if(!n){mgrMsg(`"${f.name}": el nombre no tiene un número de carta válido (ej. 001.jpg).`);return}
   const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,360/im.width),c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);IM[n]=c.toDataURL('image/jpeg',.82);if(persist())mgrMsg('Imagen asignada a la carta '+n+'.');render();mgrRender()};im.src=r.result};r.readAsDataURL(f)});e.target.value=''};
 $('btn-bag').onclick=mgrOpen;$('btn-menu-bag').onclick=mgrOpen;
 $('btn-rules').onclick=()=>rulesShow(true);$('btn-menu-rules').onclick=()=>rulesShow(true);$('rules-close').onclick=()=>rulesShow(false);
 $('ov-rules').addEventListener('click',e=>{if(e.target===e.currentTarget)rulesShow(false)});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){rulesShow(false);$('ov-mgr').hidden=true}});
 $('btn-new').onclick=()=>{pick=true;render()};$('end-new').onclick=()=>{pick=true;render()};
 $('btn-play').onclick=()=>{const hid=ctx().hid;if(hid==null)return;const e=g.p.f.indexOf(null);doPlay(sh,D[hid].t==='c'?{slot:e>=0?e:g.p.f.findIndex(u=>u&&u.id==='alsimmons')}:{})};
 $('btn-trap').onclick=()=>{const hi=sh;sh=null;upd(n=>setTrap(n,'p',hi))};
 $('btn-mull').onclick=()=>{sh=null;zm=null;upd(n=>mulligan(n))};
 $('btn-combat').onclick=()=>{sh=null;upd(n=>{n.ph='combat';L(n,'Fase de combate.')})};
 $('btn-end').onclick=()=>{if(g.p.hand.length>7){dc=true;render()}else upd(n=>{L(n,'Terminas tu turno.');endTurn(n,'p',3)})};
 $('ch-atk').onclick=()=>doPlay(sh,{tg:ch.tg,md:'atk'});$('ch-hp').onclick=()=>doPlay(sh,{tg:ch.tg,md:'hp'});$('ch-cancel').onclick=()=>{ch=null;render()};
 $('disc-cancel').onclick=()=>{dc=false;render()};
 document.addEventListener('click',e=>{if(busy)return;const t=e.target;let b;
  if(b=t.closest('.lg[data-zid]')){zm={id:b.dataset.zid,u:null};renderZoom();return}
  if(b=t.closest('[data-mode]')){const i=+b.dataset.mode;if(su===i)su=null;upd(n=>toggle(n,'p',i));return}
  if(b=t.closest('[data-boss]')){start(b.dataset.boss);return}
  if(b=t.closest('[data-d]')){const i=+b.dataset.d;if(g.p.hand.length-1<=7)dc=false;
   upd(n=>{const d=n.p.hand.splice(i,1)[0];n.p.ko.push(d);L(n,'Descartas '+C(d,'p')+' por límite de mano.');if(n.p.hand.length<=7){L(n,'Terminas tu turno.');endTurn(n,'p',3)}});return}
  if(b=t.closest('#p-hand [data-h]')){const i=+b.dataset.h;zm={id:g.p.hand[i],u:null};if(ctx().mine&&g.ph==='main')sh=sh===i?null:i;render();return}
  if(b=t.closest('.slot[data-s]')){const k=b.dataset.i;if(/^\d$/.test(k))clickSlot(b.dataset.s,+k);else if(k==='sup'&&b.dataset.s==='p')clickSup();return}
  if(t.closest('#e-hp'))face()});
 document.addEventListener('pointerover',e=>{const c=e.target.closest('[data-zid]');if(!c||c.closest('#ov-mgr'))return;
  const [s,i]=(c.dataset.zu||'').split(','),u=s?g[s].f[+i]:null;if(zm&&zm.id===c.dataset.zid&&zm.u===u)return;zm={id:c.dataset.zid,u};renderZoom()});
 g=newGame('violator');render()}
boot();
