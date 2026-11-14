/* ===== Catalogue des services AWS : index, tiroir, pages ===== */
const SVC={}; SERVICE_DATA.forEach(x=>SVC[x.k]=x);
const CAT_ORDER=[TK('Identité & accès'),TK('Protection des données'),TK('Détection & monitoring'),TK('Réseau & edge'),TK('Calcul & conteneurs'),TK('Stockage'),TK('Bases de données'),TK('Intégration & analytique'),TK('Gouvernance & gestion'),TK('Outils développeur'),TK('Concept')];
const CAT_COLOR={'Identité & accès':'#DD344C','Protection des données':'#DD344C','Détection & monitoring':'#E7157B','Réseau & edge':'#8C4FFF','Calcul & conteneurs':'#ED7100','Stockage':'#7AA116','Bases de données':'#C925D1','Intégration & analytique':'#8C4FFF','Gouvernance & gestion':'#E7157B','Outils développeur':'#C925D1','Concept':'#5B6B8C'};
const svcName=k=>(SVC[k]&&SVC[k].name)||T(KEYNAMES[k]||k);
let SVC_IDX=null;
function buildSvcIndex(){
  SVC_IDX={}; const pats={};
  SERVICE_DATA.forEach(sv=>{ const toks=(sv.match&&sv.match.length?sv.match:[sv.name]).map(t=>String(t).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
    try{ pats[sv.k]=new RegExp('(?<![A-Za-z0-9])(?:'+toks.join('|')+')(?![A-Za-z0-9])','i'); }catch(e){ pats[sv.k]=null; } SVC_IDX[sv.k]=[]; });
  LESSONS.forEach(l=>{
    const explicit=new Set([...(l.services||[]),...l.blocks.filter(b=>b.type==='svc').flatMap(b=>b.items.map(i=>i.k))]);
    const txt=JSON.stringify(l.blocks)+' '+l.title+' '+JSON.stringify(l.terms||[]);
    SERVICE_DATA.forEach(sv=>{ if(explicit.has(sv.k)||(pats[sv.k]&&pats[sv.k].test(txt))) SVC_IDX[sv.k].push(l); });
  });
}
const svcLessons=k=>{ if(!SVC_IDX) buildSvcIndex(); return SVC_IDX[k]||[]; };

/* ---- tiroir ---- */
let drawerEl=null, drawerLast=null;
function closeDrawer(){ if(!drawerEl) return; drawerEl.classList.remove('open'); document.body.classList.remove('drawer-open'); if(drawerLast&&drawerLast.focus) drawerLast.focus(); }
function ensureDrawer(){
  if(drawerEl) return;
  drawerEl=h('aside',{id:'drawer',role:'dialog','aria-modal':'true','aria-label':T('Fiche service')});
  const scrim=h('div',{id:'scrim',onclick:closeDrawer}); document.body.append(scrim,drawerEl);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeDrawer(); });
}
function miniUse(sv){
  if(!sv||!sv.use||!sv.use.length) return null;
  return h('ol',{class:'pl mini'},sv.use.map((u,i)=>h('li',{class:'stg t-neutral'},h('span',{class:'n',text:i+1}),aico(u.k,38),h('b',{text:u.t}))));
}
function openService(k,ctx){
  ensureDrawer(); drawerLast=document.activeElement; const sv=SVC[k]; drawerEl.innerHTML='';
  const close=h('button',{type:'button',class:'dr-x','aria-label':T('Fermer'),onclick:closeDrawer,html:'<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg>'});
  const head=h('div',{class:'dr-h'},aico(k,64),h('div',null,h('h3',{text:svcName(k)}),sv&&sv.cat?h('span',{class:'cat',style:'--cc:'+(CAT_COLOR[sv.cat]||'#5B6B8C'),text:T(sv.cat)}):null));
  drawerEl.append(close,head);
  if(!sv){ drawerEl.append(h('p',{class:'dr-p',text:T('La fiche détaillée de ce composant n\'est pas encore rédigée.')})); }
  else{
    drawerEl.append(h('p',{class:'dr-tag',text:sv.tagline}),h('p',{class:'dr-p',html:im(sv.role)}));
    if(ctx) drawerEl.append(h('div',{class:'dr-ctx'},h('b',{text:T('Dans cette leçon')}),h('p',{html:im(ctx)})));
    drawerEl.append(h('h4',{text:T('Pourquoi l\'utiliser')}),h('ul',{class:'dr-ul'},(sv.why||[]).map(w=>h('li',{html:im(w)}))));
    const mu=miniUse(sv); if(mu) drawerEl.append(h('h4',{text:T('En pratique')}),mu);
    if(sv.derja) drawerEl.append(h('div',{class:'derja'},h('span',{class:'lbl',text:T('Derja')}),h('div',{html:im(sv.derja)})));
  }
  drawerEl.append(h('a',{class:'btn pri dr-more',href:'#service-'+k,onclick:()=>{ drawerEl.classList.remove('open'); document.body.classList.remove('drawer-open'); },text:T('Ouvrir la fiche complète')}));
  drawerEl.classList.add('open'); document.body.classList.add('drawer-open'); close.focus();
}

/* ---- index ---- */
let svcFilter={cat:'all',q:''};
function svcCardIndex(sv){
  const n=svcLessons(sv.k).length;
  return h('a',{class:'sc',href:'#service-'+sv.k,style:'--cc:'+(CAT_COLOR[sv.cat]||'#5B6B8C')},aico(sv.k,48),h('div',{class:'sc-t'},h('b',{text:sv.name}),h('small',{text:sv.tagline})),n?h('span',{class:'sc-n',title:T('{n} leçon(s)',{n}),text:n}):null);
}
function servicesView(){
  const p=pageEl; p.innerHTML=''; p.className='page wide';
  p.append(h('header',{class:'ph'},h('h1',{class:'l-title',text:T('Les services AWS du cours')}),
    h('p',{class:'lead',text:T('Pour chaque service : son rôle, pourquoi l\'utiliser, quand, la différence avec ses voisins, et ce qui tombe à l\'examen.')})));
  const bar=h('div',{class:'sv-bar'}); const grid=h('div',{class:'sv-grid-wrap'});
  const inp=h('input',{type:'search',placeholder:T('Chercher un service (KMS, GuardDuty, Lambda…)'),'aria-label':T('Chercher un service'),value:svcFilter.q});
  const chips=h('div',{class:'chips'});
  function draw(){
    chips.innerHTML=''; ['all',...CAT_ORDER.filter(c=>SERVICE_DATA.some(x=>x.cat===c))].forEach(c=>chips.append(h('button',{type:'button',class:'chip-btn','aria-pressed':String(svcFilter.cat===c),text:c==='all'?T('Tous ({n})',{n:SERVICE_DATA.length}):T(c),onclick:()=>{svcFilter.cat=c;draw();}})));
    grid.innerHTML=''; const q=norm(svcFilter.q); let any=false;
    CAT_ORDER.forEach(c=>{ if(svcFilter.cat!=='all'&&svcFilter.cat!==c) return;
      const items=SERVICE_DATA.filter(x=>x.cat===c&&(!q||norm(x.name+' '+(x.full||'')+' '+x.tagline+' '+(x.match||[]).join(' ')).includes(q))); if(!items.length) return; any=true;
      grid.append(h('section',{class:'sv-cat',style:'--cc:'+(CAT_COLOR[c]||'#5B6B8C')},h('h2',null,h('i'),T(c),h('small',{text:T('{n} fiches',{n:items.length})})),h('div',{class:'sv-grid'},items.map(svcCardIndex)))); });
    if(!any) grid.append(h('p',{class:'tnote',text:SERVICE_DATA.length?T('Aucun service ne correspond. Essaie un autre mot.'):T('Le catalogue est en cours de chargement.')}));
  }
  inp.addEventListener('input',()=>{svcFilter.q=inp.value;draw();});
  bar.append(inp,chips); p.append(bar,grid); draw();
}

/* ---- page d'un service ---- */
function serviceView(k){
  const p=pageEl; p.innerHTML=''; p.className='page'; const sv=SVC[k];
  if(!sv){ p.append(h('h1',{class:'l-title',text:svcName(k)}),aico(k,72),h('p',{text:T('Fiche non disponible.')}),h('a',{class:'btn',href:'#services',text:T('Tous les services')})); return; }
  const cc=CAT_COLOR[sv.cat]||'#5B6B8C'; const ls=svcLessons(k);
  p.append(h('div',{class:'crumb'},h('a',{href:'#home',text:T('Accueil')}),' / ',h('a',{href:'#services',text:T('Services')}),' / '+T(sv.cat)));
  p.append(h('header',{class:'sv-hero',style:'--cc:'+cc},aico(k,96),h('div',null,h('h1',{class:'l-title',text:sv.name}),sv.full&&sv.full!==sv.name?h('div',{class:'sv-full',text:sv.full}):null,h('p',{class:'lead',text:sv.tagline}),
    h('div',{class:'meta'},h('span',{class:'pill cat',text:T(sv.cat)}),ls.length?h('span',{class:'pill',text:ls.length>1?T('Dans {n} leçons',{n:ls.length}):T('Dans {n} leçon',{n:ls.length})}):null))));
  const main=h('div',{class:'sv-main'}), side=h('div',{class:'sv-side'});
  main.append(h('section',{class:'blk'},h('h3',{text:T('Son rôle')}),h('p',{class:'sv-role',html:im(sv.role)}),sv.how?h('p',{class:'sv-how',html:'<b>'+T('Comment ça marche.')+'</b> '+im(sv.how)}):null));
  main.append(h('section',{class:'blk'},h('h3',{text:T('Pourquoi l\'utiliser')}),h('ul',{class:'why'},(sv.why||[]).map(w=>h('li',{html:im(w)})))));
  if(sv.use&&sv.use.length) main.append(fig('pipeline',T('En pratique'),h('ol',{class:'pl'},sv.use.map((u,i)=>h('li',{class:'stg t-neutral'},h('span',{class:'n',text:i+1}),aico(u.k,48),h('b',{text:u.t})))),null));
  const wn=h('div',{class:'when'},h('div',{class:'w y'},h('b',{text:T('Quand l\'utiliser')}),h('ul',null,(sv.when||[]).map(x=>h('li',{html:im(x)})))),sv.notwhen?h('div',{class:'w n'},h('b',{text:T('Quand s\'en passer')}),h('p',{html:im(sv.notwhen)})):null);
  main.append(h('section',{class:'blk'},wn));
  if(sv.vs&&sv.vs.length) main.append(h('section',{class:'blk'},h('h3',{text:T('À ne pas confondre avec')}),h('div',{class:'vsl'},sv.vs.map(v=>h('a',{class:'vs',href:'#service-'+v.k},aico(v.k,40),h('div',null,h('b',{text:svcName(v.k)}),h('p',{html:im(v.d)})))))));
  if(sv.exam&&sv.exam.length) main.append(h('section',{class:'blk'},h('div',{class:'callout exam'},h('div',{class:'ic',text:T('Examen')}),h('div',{class:'md'},h('ul',null,sv.exam.map(x=>h('li',{html:im(x)})))))));
  if(sv.derja) side.append(h('div',{class:'derja'},h('span',{class:'lbl',text:T('DERJA · FHEM BEL DERJA')}),h('div',{class:'md',html:md(sv.derja)})));
  if(sv.related&&sv.related.length) side.append(h('div',{class:'side-box'},h('h4',{text:T('Services liés')}),h('div',{class:'rel'},sv.related.map(r=>h('a',{href:'#service-'+r,class:'rel-i'},aico(r,32),svcName(r))))));
  if(ls.length) side.append(h('div',{class:'side-box'},h('h4',{text:T('Où le voir dans le cours')}),h('ul',{class:'ls'},ls.slice(0,10).map(l=>h('li',null,h('a',{href:lessonHref(l.id),text:l.title}))))));
  p.append(h('div',{class:'sv-cols'},main,side));
}
