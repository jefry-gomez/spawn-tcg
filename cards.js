/* SPAWN TCG: Necroplasma · cards.js
   Solo datos de cartas e imágenes. Sin reglas de juego (eso vive en game.js). */
/* BASE DE DATOS (37 cartas): para ampliarla pega más entradas con este mismo formato.
   key = id interno (único; game.js programa los efectos por key) · number = número oficial (también nombra la imagen ./cartas/NNN.jpg)
   type: personaje (casillas de frente) | evento (instantáneo: se muestra, actúa y va a la Pila de KO) | mejora (continua: ocupa Apoyo) · opcionales: haste (prisa), shield (escudo), armor, regen, demon */
const CARDS_DATABASE=[
/* ---- Personajes ---- */
{"number":"001","key":"spawn","name":"Spawn","type":"personaje","faction":"Earthly Forces","cost":4,"atk":6,"hp":7,"demon":true,"icon":"💀","effect":"Al entrar, si tu Pila de KO tiene cartas, gana +2 ATK."},
{"number":"002","key":"angela","name":"Angela","type":"personaje","faction":"Heaven","cost":3,"atk":5,"hp":5,"icon":"🪽","effect":"Al atacar a un demonio o personaje de coste 4+, gana +2 ATK en ese combate."},
{"number":"003","key":"violator","name":"Violator","type":"personaje","faction":"Hellspawn","cost":4,"atk":7,"hp":5,"demon":true,"haste":true,"icon":"😈","effect":"Prisa: puede atacar el mismo turno en que entra."},
{"number":"004","key":"clown","name":"Clown","type":"personaje","faction":"Hellspawn","cost":3,"atk":4,"hp":6,"demon":true,"armor":1,"icon":"🤡","effect":"Piel Gruesa: Reduce en 1 el daño de combate que recibe."},
{"number":"005","key":"overtkill","name":"Overtkill","type":"personaje","faction":"Hellspawn","cost":6,"atk":8,"hp":9,"demon":true,"icon":"🦾","effect":"Al entrar, hace 2 de daño a cada personaje enemigo."},
{"number":"006","key":"terry","name":"Terry Fitzgerald","type":"personaje","faction":"Earthly Forces","cost":2,"atk":2,"hp":3,"icon":"🧔","effect":"Amigo leal: al entrar, robas 1 carta."},
{"number":"007","key":"wanda","name":"Wanda Blake","type":"personaje","faction":"Earthly Forces","cost":3,"atk":2,"hp":5,"icon":"👩","effect":"Cuidados: al entrar, tus demás personajes recuperan 2 HP."},
{"number":"008","key":"sam","name":"Sam & Twitch","type":"personaje","faction":"Earthly Forces","cost":3,"atk":3,"hp":4,"icon":"🕵️","effect":"Refuerzos: al entrar, tus demás personajes ganan +1 ATK."},
{"number":"011","key":"commando","name":"Commando Spawn","type":"personaje","faction":"Hellspawn","cost":5,"atk":6,"hp":6,"demon":true,"icon":"🪖","effect":"Al entrar, hace 3 de daño directo al HP rival."},
{"number":"013","key":"ninja","name":"Ninja Spawn","type":"personaje","faction":"Hellspawn","cost":3,"atk":5,"hp":3,"demon":true,"haste":true,"icon":"🥷","effect":"Prisa: puede atacar el mismo turno en que entra."},
{"number":"014","key":"giant","name":"Giant Spawn","type":"personaje","faction":"Hellspawn / Earthly Forces","cost":6,"atk":8,"hp":9,"demon":true,"shield":true,"icon":"🗿","effect":"Escudo: reduce en 2 el primer daño que recibe cada turno."},
{"number":"015","key":"alsimmons","name":"Al Simmons","type":"personaje","faction":"Earthly Forces","cost":2,"atk":3,"hp":3,"icon":"🕴️","effect":"Evolución: juega Spawn (001) sobre él pagando 2 menos; Spawn conserva su estado de ataque."},
{"number":"030","key":"cygor","name":"Spawn Level 5","type":"personaje","faction":"Hellspawn","cost":5,"atk":7,"hp":6,"demon":true,"regen":2,"icon":"🦍","effect":"Regeneración: recupera 2 HP al inicio de tu turno."},
{"number":"038","key":"redeemer","name":"Redeemer","type":"personaje","faction":"Hellspawn","cost":5,"atk":7,"hp":7,"demon":true,"icon":"🗡️","effect":"Al entrar, recuperas 4 HP."},
{"number":"039","key":"curse","name":"Curse","type":"personaje","faction":"Hellspawn","cost":4,"atk":5,"hp":5,"demon":true,"icon":"🧿","effect":"Maldición: al entrar, el personaje enemigo con más ATK pierde 2 ATK."},
{"number":"041","key":"billy","name":"Billy Kincaid","type":"personaje","faction":"Earthly Forces","cost":2,"atk":4,"hp":2,"haste":true,"icon":"🔪","effect":"Prisa: puede atacar el mismo turno en que entra."},
{"number":"048","key":"tony","name":"Tony Twist","type":"personaje","faction":"Mafia","cost":3,"atk":4,"hp":3,"icon":"🎩","effect":"Al entrar, hace 2 de daño directo al HP rival."},
{"number":"070","key":"medieval","name":"Medieval Spawn","type":"personaje","faction":"Hellspawn","cost":5,"atk":7,"hp":8,"demon":true,"shield":true,"icon":"🛡️","effect":"Escudo: reduce en 2 el primer daño que recibe cada turno."},
{"number":"072","key":"spawnmobile","name":"Spawnmobile","type":"personaje","faction":"Earthly Forces","cost":4,"atk":5,"hp":4,"haste":true,"icon":"🚗","effect":"Prisa: puede atacar el mismo turno en que entra."},
{"number":"082","key":"rig","name":"Monster Rig","type":"personaje","faction":"Earthly Forces","cost":5,"atk":6,"hp":9,"armor":1,"icon":"🚛","effect":"Blindaje: reduce en 1 el daño de combate que recibe."},
{"number":"117","key":"cogliostro","name":"Count Cogliostro","type":"personaje","faction":"Earthly Forces","cost":2,"atk":2,"hp":4,"icon":"🧙","effect":"Al entrar: +1 Necroplasma y robas 1 carta."},
/* ---- Eventos ---- */
{"number":"051","key":"fire","name":"Elemental Fire","type":"evento","faction":"Event","cost":3,"icon":"🔥","effect":"5 de daño a un personaje enemigo (no afecta a Angela)."},
{"number":"052","key":"bums","name":"Bums","type":"evento","faction":"Event","cost":1,"icon":"🥫","effect":"Recupera la última carta de tu Pila de KO y ponla en tu mano."},
{"number":"054","key":"stasis","name":"Stasis Field","type":"evento","faction":"Event","cost":2,"icon":"❄️","effect":"Congela a un personaje enemigo: no puede atacar en su próximo turno."},
{"number":"055","key":"blast","name":"Necro-Blast","type":"evento","faction":"Event","cost":2,"icon":"☢️","effect":"3 de daño directo al HP rival; pierdes 1 HP."},
{"number":"064","key":"media","name":"Media Contact","type":"evento","faction":"Event","cost":1,"icon":"📺","effect":"Roba 2 cartas."},
{"number":"087","key":"necroplasm","name":"Necro-Plasm","type":"evento","faction":"Event","cost":1,"icon":"🧪","effect":"Recuperas 3 de Necroplasma (el medidor se desplaza 3 a tu favor)."},
{"number":"119","key":"hand","name":"Hand of Malebolgia","type":"evento","faction":"Event","cost":7,"icon":"✋","effect":"Si tienes una casilla libre, toma el control de un personaje enemigo de coste 5 o menos y pásalo a tu campo (entra agotado)."},
{"number":"120","key":"fast_attack","name":"Fast Attack","type":"evento","faction":"Event","cost":2,"icon":"⚡","effect":"Un personaje propio gana +2 ATK y Prisa este turno."},
/* ---- Mejoras Continuas (ocupan la ranura de Apoyo) ---- */
{"number":"053","key":"cia","name":"C.I.A. Contact","type":"mejora","faction":"Enhancement","cost":2,"icon":"📡","effect":"Mejora Continua (Apoyo): equípala a un personaje propio y elige +3 ATK o +4 HP mientras siga en juego."},
{"number":"063","key":"grandma","name":"Grandma Blake","type":"mejora","faction":"Enhancement","cost":2,"icon":"👵","effect":"Mejora Continua (Apoyo): tus personajes de Earthly Forces ganan +2 HP mientras siga en Apoyo. Anula el primer Evento enemigo jugado contra ti y luego va a la Pila de KO."},
{"number":"075","key":"chains","name":"Living Chains","type":"mejora","faction":"Enhancement","cost":3,"icon":"⛓️","effect":"Mejora Continua (Apoyo): encadena a un personaje enemigo: no puede atacar mientras siga en juego."},
{"number":"078","key":"cape","name":"Living Cape","type":"mejora","faction":"Enhancement","cost":2,"icon":"🦇","effect":"Mejora Continua (Apoyo): equípala a un personaje propio: Escudo (reduce en 2 el primer daño que recibe cada turno)."},
{"number":"085","key":"hellfire","name":"Hellfire Aura","type":"mejora","faction":"Enhancement","cost":3,"icon":"🌋","effect":"Mejora Continua (Apoyo): tus personajes demonio ganan +1 ATK mientras siga en Apoyo."},
{"number":"090","key":"medic","name":"Field Medic","type":"mejora","faction":"Enhancement","cost":2,"icon":"🩹","effect":"Mejora Continua (Apoyo): al inicio de tu turno, tus personajes heridos recuperan 1 HP."},
{"number":"094","key":"biggun","name":"Big Gun","type":"mejora","faction":"Enhancement","cost":3,"icon":"🔫","effect":"Mejora Continua (Apoyo): equípala a un personaje propio: +4 ATK. Si entró este turno, puede atacar ya (Prisa)."},
{"number":"099","key":"horse","name":"Spawn Battle Horse","type":"mejora","faction":"Enhancement","cost":3,"icon":"🐎","effect":"Mejora Continua (Apoyo): equípala a un personaje propio: +2 ATK y +3 HP mientras siga en juego."}
];
const TY={personaje:'c',mejora:'m',evento:'e'},D={},BYNUM={};
CARDS_DATABASE.forEach(k=>{BYNUM[k.number]=k.key;D[k.key]={number:k.number,n:k.name,t:TY[k.type],c:k.cost,a:k.atk,h:k.hp,f:k.faction,x:k.effect,d:k.demon,hs:k.haste,sd:k.shield,ar:k.armor,rg:k.regen,i:k.icon}});
const DEF_DECK=["001","001","002","002","003","003","004","004","005","015","041","051","052","053","054","070","070","117","117","119"];

/* ---- Imágenes: ./cartas/NNN.jpg → NNN.png → icono SVG ---- */
let IM={};try{IM=JSON.parse(localStorage.getItem('spawnTcgImgs')||'{}')}catch(e){}   // imágenes subidas por el usuario (localStorage)
const BAD=new Set();                                                                  // rutas que ya fallaron
const artSources=n=>[IM[n],`./cartas/${n}.jpg`,`./cartas/${n}.png`].filter(u=>u&&!BAD.has(u));
const artSVG=(n,i)=>`<svg viewBox="0 0 60 80"><rect width="60" height="80" fill="#12090a"/><circle cx="30" cy="36" r="20" fill="none" stroke="#39ff14" stroke-width="2"/><circle cx="30" cy="36" r="15" fill="none" stroke="#c1121f" stroke-width="1"/><text x="30" y="44" text-anchor="middle" font-size="22">${i}</text><text x="30" y="72" text-anchor="middle" fill="#8a9a9e" font-size="9" font-family="system-ui">${n}</text></svg>`;
function artFail(img){BAD.add(img.getAttribute('src'));const s=artSources(img.dataset.n);
 if(s.length){img.src=s[0];return}
 const w=document.createElement('div');w.innerHTML=artSVG(img.dataset.n,img.dataset.i);img.replaceWith(w.firstChild)}
function cardArt(n,icon){const s=artSources(n);
 return s.length?`<img src="${s[0]}" data-n="${n}" data-i="${icon}" alt="" draggable="false" onerror="artFail(this)">`:artSVG(n,icon)}
