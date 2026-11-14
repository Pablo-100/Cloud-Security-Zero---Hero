/* ===== Vues & navigation ===== */
let sideEl, mainEl, pageEl, barEl, searchBox, resultsEl, topEl;
const openParts=new Set();
const VISTYPES=new Set(['flow','arch','decode','policy','widget','pipeline','stack','hub','cycle','decision','matrix','tree','cards','facts','svc','compare']);
const countDiag=l=>l.blocks.filter(b=>VISTYPES.has(b.type)).length;
const TOTAL={lessons:LESSONS.length,diag:LESSONS.reduce((a,l)=>a+countDiag(l),0),oral:LESSONS.reduce((a,l)=>a+(l.oral||[]).length,0),quiz:LESSONS.reduce((a,l)=>a+(l.quiz||[]).length,0),svc:SERVICE_DATA.length};
const doneCount=()=>LESSONS.filter(l=>store.d.done[l.id]).length;
const lessonHref=id=>'#lesson-'+id;
const nextLesson=()=>LESSONS.find(l=>!store.d.done[l.id])||LESSONS[0];
const SVG_X='<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg>';
const FAVICON="data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#2442F5"/><rect x="12" y="12" width="18" height="18" rx="4" fill="#ED7100"/><rect x="34" y="12" width="18" height="18" rx="4" fill="#DD344C"/><rect x="12" y="34" width="18" height="18" rx="4" fill="#7AA116"/><rect x="34" y="34" width="18" height="18" rx="4" fill="#8C4FFF"/></svg>');

function logoMark(){ const d=h('span',{class:'logo'}); d.innerHTML='<i style="--c:#ED7100"></i><i style="--c:#DD344C"></i><i style="--c:#7AA116"></i><i style="--c:#8C4FFF"></i>'; return d; }

function shell(){
  const app=document.getElementById('app'); app.innerHTML='';
  sideEl=h('aside',{id:'side','aria-label':T('Plan du cours')}); mainEl=h('div',{id:'main'});
  barEl=h('i'); resultsEl=h('div',{class:'results'});
  const inp=h('input',{type:'search',placeholder:T('Chercher un service, une notion…'),'aria-label':T('Recherche'),autocomplete:'off'});
  inp.addEventListener('input',()=>doSearch(inp.value)); inp.addEventListener('focus',()=>doSearch(inp.value));
  document.addEventListener('click',e=>{ if(!searchBox.contains(e.target)) resultsEl.style.display='none'; });
  document.addEventListener('keydown',e=>{ if(e.key==='/'&&!/input|textarea|select/i.test((document.activeElement||{}).tagName||'')){ e.preventDefault(); inp.focus(); } });
  searchBox=h('div',{class:'search'}); searchBox.innerHTML='<svg viewBox="0 0 24 24" class="ic"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>'; searchBox.append(inp,resultsEl);
  const burger=h('button',{class:'burger',type:'button','aria-label':T('Ouvrir le menu'),onclick:()=>document.body.classList.toggle('nav-open'),html:'<svg viewBox="0 0 20 20"><path d="M3 6h14M3 10h14M3 14h14"/></svg>'});
  const bDerja=h('button',{class:'chip-btn',type:'button','aria-pressed':'true',title:T('Afficher ou masquer les explications en derja'),onclick:()=>{ const hide=document.body.classList.toggle('hide-derja'); bDerja.setAttribute('aria-pressed',String(!hide)); setPref('cloudsec-derja',hide?'0':'1'); }},T('Derja'));
  const bTheme=h('button',{class:'chip-btn',type:'button',title:T('Changer de thème'),'aria-label':T('Changer de thème'),onclick:()=>{ const cur=document.documentElement.dataset.theme||'light'; const nx=cur==='dark'?'light':'dark'; document.documentElement.dataset.theme=nx; setPref('cloudsec-theme2',nx); }},T('Thème'));
  if(getPref('cloudsec-derja')==='0'){document.body.classList.add('hide-derja'); bDerja.setAttribute('aria-pressed','false');}
  document.documentElement.dataset.theme=getPref('cloudsec-theme2')||'light';
  const nav=h('nav',{class:'topnav','aria-label':T('Navigation principale')},
    h('a',{href:'#cours','data-r':'cours',text:T('Cours')}),h('a',{href:'#services','data-r':'services',text:T('Services')}),h('a',{href:'#oral','data-r':'oral',text:T('Oral')}),h('a',{href:'#quiz','data-r':'quiz',text:T('Examen blanc')}),h('a',{href:'#fiches','data-r':'fiches',text:T('Fiches')}),h('a',{href:'#glossaire','data-r':'glossaire',text:T('Glossaire')}));
  topEl=h('header',{class:'top'},h('div',{class:'top-in'},burger,h('a',{class:'brand',href:'#home'},logoMark(),h('b',{text:'Cloud Security'}),h('span',{text:'0→Hero'})),nav,searchBox,h('div',{class:'tb-right'},LANG==='fr'?bDerja:null,langPicker(),bTheme)),h('div',{class:'progress-line'},barEl));
  pageEl=h('main',{class:'page',id:'page'});
  mainEl.append(pageEl,h('footer',{class:'foot'},h('div',{class:'foot-in'},
    h('div',null,h('b',{text:'Cloud Security 0→Hero'}),h('p',{text:T('Support d\'étude indépendant pour le cours de sécurité cloud (TEK-UP, ING5-SSIR). Dérivé des supports de cours fournis : chapitres 1, 2 et référentiel AWS Security Specialty.')})),
    h('p',{class:'disc',text:T('AWS et les icônes de services sont des marques d\'Amazon Web Services, Inc. ; elles servent ici uniquement à illustrer des schémas pédagogiques. Ce site n\'est ni affilié à AWS ni approuvé par AWS. Vérifie toujours la documentation officielle avant une mise en production.')}))));
  app.append(topEl,h('div',{class:'wrap'},sideEl,mainEl));
}
function renderSide(route){
  sideEl.innerHTML='';
  const activeLesson=route.startsWith('lesson-')?BYID[route.slice(7)]:null;
  if(activeLesson) openParts.add(activeLesson.part); if(!openParts.size) openParts.add('ch1');
  sideEl.append(h('div',{class:'side-mobnav'},[['home',T('Accueil')],['cours',T('Cours')],['services',T('Services')],['oral',T('Oral')],['quiz',T('Examen blanc')],['fiches',T('Fiches')],['glossaire',T('Glossaire')]].map(([k,t])=>h('a',{href:'#'+k,text:t}))));
  PARTS.forEach(p=>{
    const ls=PARTLESSONS[p.id]; if(!ls.length) return; const dn=ls.filter(l=>store.d.done[l.id]).length;
    const list=h('div',{class:'lessons'+(openParts.has(p.id)?'':' closed')},ls.map((l,i)=>h('a',{class:'l-item'+(activeLesson&&activeLesson.id===l.id?' on':'')+(store.d.done[l.id]?' done':''),href:lessonHref(l.id),onclick:()=>document.body.classList.remove('nav-open')},
      h('span',{class:'dot',text:store.d.done[l.id]?'✓':''}),h('span',{text:(i+1)+'. '+l.title}))));
    sideEl.append(h('div',{class:'part',style:'--pc:'+p.color},h('button',{class:'part-t',type:'button','aria-expanded':String(openParts.has(p.id)),onclick:()=>{ openParts.has(p.id)?openParts.delete(p.id):openParts.add(p.id); renderSide(route); }},
      aico(p.icon,30),h('span',{class:'pt'},T(p.title),h('small',{text:p.num+' · '+dn+'/'+ls.length}))),list));
  });
}
function setProgressBar(){ barEl.style.width=(TOTAL.lessons?100*doneCount()/TOTAL.lessons:0)+'%'; }
function markNav(r){ topEl.querySelectorAll('.topnav a').forEach(a=>{ const k=a.dataset.r; a.classList.toggle('on',k===r||(k==='cours'&&r.startsWith('lesson-'))||(k==='services'&&r.startsWith('service-'))); }); }

/* ---- Schéma héros : une requête web protégée de bout en bout ---- */
function heroArt(){
  const LBL={user:T('Utilisateur'),cloudfront:'CloudFront',waf:'WAF',elb:T('Load balancer'),ec2:'EC2',rds:'RDS',role:T('Rôle IAM'),guardduty:'GuardDuty',cloudtrail:'CloudTrail',kms:'KMS'};
  const N=[['user',64,238],['cloudfront',184,238],['waf',304,238],['elb',432,238],['ec2',558,238],['rds',684,238],['role',558,92],['guardduty',432,376],['cloudtrail',558,376],['kms',684,376]];
  const pos={}; N.forEach(n=>pos[n[0]]=n);
  const svg=s('svg',{viewBox:'0 0 760 450',role:'img','aria-label':T('Schéma : une requête web traverse CloudFront, WAF, un load balancer, EC2 et RDS, protégée par IAM, KMS, CloudTrail et GuardDuty')});
  svg.append(s('rect',{class:'ha-vpc',x:368,y:166,width:384,height:146,rx:14}),s('text',{class:'ha-vpct',x:384,y:188,text:T('VPC · réseau privé')}));
  const edge=(a,b,cls,lbl,side)=>{ const A=pos[a],B=pos[b]; svg.append(s('path',{class:'ha-e '+cls,d:`M${A[1]},${A[2]} L${B[1]},${B[2]}`})); if(lbl){ svg.append(s('text',{class:'ha-l',x:side?(A[1]+B[1])/2+10:(A[1]+B[1])/2,y:side?(A[2]+B[2])/2+4:(A[2]+B[2])/2-9,'text-anchor':side?'start':'middle',text:lbl})); } };
  ['user>cloudfront','cloudfront>waf','waf>elb','elb>ec2','ec2>rds'].forEach(e=>{ const [a,b]=e.split('>'); edge(a,b,'main'); });
  edge('role','ec2','dash',T('rôle attaché'),1); edge('kms','rds','dash',T('chiffre'),1); edge('cloudtrail','ec2','dash',T('journalise'),1); edge('guardduty','cloudtrail','dash',T('lit les logs'));
  N.forEach(([k,x,y])=>{ const g=s('g',{class:'ha-n',tabindex:'0',role:'button','aria-label':T('{name} : ouvrir la fiche',{name:LBL[k]})});
    g.append(s('rect',{class:'ha-hit',x:x-44,y:y-42,width:88,height:96,rx:12}),sico(k,x-34,y-34,68),s('text',{class:'ha-nt',x,y:y+54,'text-anchor':'middle',text:LBL[k]}));
    g.addEventListener('click',()=>openService(k)); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();openService(k);} }); svg.append(g); });
  if(!REDUCED){ ['0','-3'].forEach(b=>{ const c=s('circle',{class:'ha-pk',r:6.5}); c.append(s('animateMotion',{dur:'6s',begin:b+'s',repeatCount:'indefinite',path:'M64,238 L184,238 L304,238 L432,238 L558,238 L684,238'})); svg.append(c); }); }
  svg.append(s('g',{class:'ha-tb'},s('rect',{x:8,y:8,width:268,height:64,rx:4}),s('line',{x1:8,x2:276,y1:32,y2:32}),s('text',{x:18,y:25,class:'a',text:T('FEUILLE 01')}),s('text',{x:18,y:50,class:'b',text:T('Une requête web, protégée')}),s('text',{x:18,y:65,class:'b',text:T('de bout en bout')})));
  return svg;
}

/* ---- Accueil ---- */
function homeView(){
  const p=pageEl; p.innerHTML=''; p.className='page home';
  const next=nextLesson();
  p.append(h('section',{class:'hero'},
    h('div',{class:'hero-t'},
      h('h1',null,T('Comprends la sécurité AWS en regardant les schémas bouger.')),
      h('p',{class:'lead',text:LANG==='fr'?T('Chaque notion du cours est expliquée en derja, précisée en français, dessinée avec les vrais logos AWS, puis testée comme le ferait le prof.'):T('Chaque notion du cours est expliquée simplement, dessinée avec les vrais logos AWS, puis testée comme le ferait un examinateur.')}),
      h('div',{class:'cta'},h('a',{class:'btn pri lg',href:lessonHref(next.id),text:doneCount()?T('Reprendre : {title}',{title:trunc(next.title,34)}):T('Commencer au chapitre 1')}),h('a',{class:'btn lg',href:'#services',text:T('Explorer les {n} services',{n:TOTAL.svc||''})})),
      h('dl',{class:'hstats'},[[TOTAL.lessons,T('leçons')],[TOTAL.diag,T('schémas')],[TOTAL.svc,T('fiches services')],[TOTAL.oral,T('questions d\'oral')]].map(([n,t])=>h('div',null,h('dt',{text:n}),h('dd',{text:t}))))),
    h('div',{class:'hero-a'},h('div',{class:'sheet'},heroArt()),h('p',{class:'hint',text:T('Clique une icône pour ouvrir la fiche du service.')}))));

  /* anatomie d'une leçon avec de vrais blocs */
  const demoL=LESSONS.find(l=>l.id==='ch1-06')||LESSONS[0]; FIG.n=0;
  p.append(h('section',{class:'sec'},h('h2',{class:'h-sec2',text:T('Une leçon, trois temps')}),
    h('div',{class:'anat'},
      h('div',null,h('h3',{text:T('1. Je comprends avec mes mots')}),h('div',{class:'derja keep'},h('span',{class:'lbl',text:LANG==='fr'?T('DERJA'):''}),h('div',{class:'md',html:md(LANG==='fr'?demoL.hook.derja:demoL.hook.fr)}))),
      h('div',null,h('h3',{text:T('2. Je vois le schéma')}),BLOCKS.stack({title:T('Défense en profondeur'),nest:true,layers:[{label:T('Identité'),sub:T('MFA, moindre privilège'),icon:'iam',tone:'info'},{label:T('Réseau'),sub:'VPC, WAF, Shield',icon:'vpc',tone:'good'},{label:T('Données'),sub:T('KMS, chiffrement'),icon:'kms',tone:'warn'},{label:T('Détection'),sub:'CloudTrail, GuardDuty',icon:'guardduty',tone:'bad'}]})),
      h('div',null,h('h3',{text:T('3. Je sais quoi répondre')}),(LESSONS.find(l=>l.oral&&l.oral.length)?oralCard(LESSONS.find(l=>l.oral&&l.oral.length).oral[0],{open:false}):null)))));

  /* parcours */
  p.append(h('section',{class:'sec'},h('h2',{class:'h-sec2',text:T('Le parcours, de zéro à l\'examen')}),
    h('div',{class:'route'},PARTS.filter(x=>PARTLESSONS[x.id].length).map(x=>{ const ls=PARTLESSONS[x.id], dn=ls.filter(l=>store.d.done[l.id]).length;
      return h('a',{class:'rt',href:lessonHref(ls[0].id),style:'--pc:'+x.color},aico(x.icon,52),h('div',{class:'rt-t'},h('b',{text:T(x.title)}),h('small',{text:T(x.sub)}),h('p',{text:T(x.desc)})),
        h('div',{class:'rt-m'},h('span',{class:'badge'+(x.core?' core':''),text:x.core?T('Au programme'):T('Approfondissement')}),h('span',{text:T('{n} leçons',{n:ls.length})}),h('div',{class:'bar'},h('i',{style:'width:'+(100*dn/ls.length)+'%'})))); }))));

  /* mur de services */
  const wallKeys=['iam','sts','kms','s3','ec2','lambda','vpc','guardduty','cloudtrail','waf','shield','cognito','sso','secrets','config','orgs','cloudwatch','securityhub','macie','inspector','rds','dynamodb','cloudfront','route53','sns','sqs','eventbridge','ssm','acm','cloudhsm','backup','ebs','eks','elb','apigw','cloudformation','controltower','detective','networkfw','directory'];
  p.append(h('section',{class:'sec'},h('h2',{class:'h-sec2',text:T('Chaque service a sa fiche')}),h('p',{class:'sec-lead',text:T('Son rôle, pourquoi on l\'utilise, quand, avec quoi on le confond, et le piège d\'examen.')}),
    h('div',{class:'wall'},wallKeys.map(k=>h('a',{href:'#service-'+k,class:'wl',title:svcName(k)},aico(k,56),h('span',{text:svcName(k).replace(/^(AWS|Amazon) /,'')})))),
    h('div',{style:'margin-top:16px'},h('a',{class:'btn',href:'#services',text:T('Voir tout le catalogue')}))));

  /* méthode orale */
  p.append(h('section',{class:'sec'},h('h2',{class:'h-sec2',text:T('Répondre à l\'oral en quatre phrases')}),
    h('ol',{class:'method'},[[T('Définir'),T('Une phrase claire : « X est… / X sert à… ». Pas de blabla.')],[T('Expliquer le mécanisme'),T('Qui fait quoi, dans quel ordre, qui vérifie quoi.')],[T('Donner un exemple AWS'),T('« Par exemple, un rôle EC2 qui lit un bucket S3. »')],[T('Poser la précaution'),T('Moindre privilège, MFA, chiffrement, logs : la limite ou le risque.')]].map(([t,d])=>h('li',null,h('b',{text:t}),h('span',{text:d}))))));
  p.append(h('div',{class:'callout info',style:'margin-top:34px'},h('div',{class:'ic',text:T('Note')}),h('div',{class:'md',html:T('**Numérotation.** Les « domaines » de la partie AWS Security suivent l\'ordre du support PDF (1 Détection, 2 Réponse aux incidents, 3 Infrastructure, 4 Identité, 5 Données, 6 Gouvernance). La slide 40 du chapitre 2 liste les mêmes thèmes avec la pondération de l\'examen officiel dans un autre ordre : IAM 20 %, Infrastructure 18 %, Données 18 %, Détection 16 %, Incidents 14 %, Gouvernance 14 %.')})));
}

/* ---- Leçon ---- */
function lessonView(l){
  const p=pageEl; p.innerHTML=''; p.className='page lesson'; FIG.n=0;
  const part=PARTS.find(x=>x.id===l.part); const idx=PARTLESSONS[l.part].indexOf(l); const toc=[];
  const art=h('article',{class:'l-main',style:'--pc:'+part.color});
  art.append(h('div',{class:'crumb'},h('a',{href:'#home',text:T('Accueil')}),' / ',part.num+' · '+T(part.title)));
  art.append(h('header',{class:'l-head'},
    h('div',{class:'l-ht'},h('h1',{class:'l-title',text:l.title}),
      h('div',{class:'meta'},h('span',{class:'pill '+(l.core?'core':''),text:l.core?T('Au programme du cours'):T('Approfondissement')}),h('span',{class:'pill',text:[T('Niveau 0 · bases'),T('Niveau 1 · intermédiaire'),T('Niveau 2 · avancé')][l.level]||T('Niveau 1')}),h('span',{class:'pill',text:T('~{n} min',{n:l.minutes})}))),
    h('dl',{class:'cart'},[[T('Partie'),part.num],[T('Leçon'),(idx+1)+' / '+PARTLESSONS[l.part].length],[T('Source'),l.src],[T('Schémas'),String(countDiag(l))]].map(([k,v])=>h('div',null,h('dt',{text:k}),h('dd',{text:v}))))));
  art.append(h('div',{class:'hook'},h('div',{class:'fr',text:l.hook.fr}),h('div',{class:'derja'},h('span',{class:'lbl',text:T('DERJA · L\'IDÉE EN DEUX MOTS')}),h('div',{class:'md',html:md(l.hook.derja)}))));
  const svcB=l.blocks.find(b=>b.type==='svc'); let fi=0;
  const mount=(node,title)=>{ node.id='s'+(fi++); node.dataset.t=title; toc.push([node.id,title]); art.append(node); };
  if(svcB) mount(BLOCKS.svc(svcB),T('Services en jeu'));
  l.blocks.forEach(b=>{ if(b===svcB) return; const f=BLOCKS[b.type]; if(!f) return;
    try{ const n=f(b); const t=b.title||({flow:T('Flux animé'),arch:T('Architecture'),decode:T('Décodage'),policy:T('Policy'),derja:T('Fhem bel derja'),scenario:T('Scénario'),callout:T('À retenir'),text:T('Explication'),table:T('Tableau'),steps:T('Étapes'),compare:T('Comparaison'),widget:T('Simulateur')}[b.type]||T('Schéma')); if(!['derja','callout'].includes(b.type)) mount(n,t); else art.append(n); }
    catch(e){ console.error('bloc',b.type,e); art.append(h('div',{class:'callout warn'},h('div',{class:'ic',text:T('Erreur')}),h('div',{text:T('Bloc « {type} » illisible.',{type:b.type})}))); } });
  const hsec=(tag,title,id)=>{ const e=h('h2',{class:'h-sec',id},h('span',{class:'tag',text:tag}),title); toc.push([id,title]); return e; };
  if(l.pitfalls&&l.pitfalls.length){ art.append(hsec(T('Examen'),T('Pièges à éviter'),'x-pit'),h('ul',{class:'pit'},l.pitfalls.map(x=>h('li',{html:im(x)})))); }
  if(l.oral&&l.oral.length){ art.append(hsec(T('Oral'),T('Quoi répondre si le prof demande…'),'x-oral')); l.oral.forEach((o,i)=>art.append(oralCard(o,{open:i===0}))); }
  if(l.quiz&&l.quiz.length){ art.append(hsec(T('Quiz'),T('Teste-toi'),'x-quiz'),quizBlock(l.quiz,l.id)); }
  if(l.recap&&l.recap.length){ art.append(hsec(T('Retenir'),T('L\'essentiel'),'x-rec'),h('ul',{class:'recap'},l.recap.map(x=>h('li',{html:im(x)})))); }
  if(l.terms&&l.terms.length){ art.append(hsec(T('Vocabulaire'),T('Termes à connaître'),'x-terms'),h('div',{class:'terms'},l.terms.map(t=>h('div',{class:'term'},h('b',{text:t.t}),h('div',{html:im(t.d)}),t.derja?h('div',{class:'derja'},h('span',{class:'lbl',text:T('DERJA')}),' '+t.derja):null)))); }
  const bDone=h('button',{class:'btn pri',type:'button',text:store.d.done[l.id]?T('Leçon terminée ✓ (cliquer pour annuler)'):T('Marquer comme comprise'),onclick:()=>{ store.d.done[l.id]=!store.d.done[l.id]; store.save(); bDone.textContent=store.d.done[l.id]?T('Leçon terminée ✓ (cliquer pour annuler)'):T('Marquer comme comprise'); renderSide('lesson-'+l.id); setProgressBar(); }});
  art.append(h('div',{style:'margin-top:30px'},bDone));
  const prev=LESSONS[l._i-1], nx=LESSONS[l._i+1];
  art.append(h('div',{class:'l-nav'},prev?h('a',{href:lessonHref(prev.id)},h('small',{text:T('Précédente')}),prev.title):h('span'),nx?h('a',{class:'next',href:lessonHref(nx.id)},h('small',{text:T('Suivante')}),nx.title):h('span')));
  const tocEl=h('nav',{class:'toc','aria-label':T('Dans cette leçon')},h('b',{text:T('Dans cette leçon')}),h('ol',null,toc.map(([id,t])=>h('li',null,h('a',{href:'javascript:void 0','data-id':id,text:trunc(t,34),onclick:e=>{ e.preventDefault(); const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:REDUCED?'auto':'smooth',block:'start'}); }})))));
  p.append(h('div',{class:'lesson-grid'},art,tocEl));
  if('IntersectionObserver' in window){ const links=[...tocEl.querySelectorAll('a')]; const io=new IntersectionObserver(es=>{ es.forEach(e=>{ if(e.isIntersecting){ links.forEach(a=>a.classList.toggle('on',a.dataset.id===e.target.id)); } }); },{rootMargin:'-30% 0px -60% 0px'}); toc.forEach(([id])=>{ const el=document.getElementById(id); if(el) io.observe(el); }); }
}

/* ---- Cours : redirige vers la prochaine leçon ---- */
/* ---- Oral ---- */
let oralState={part:'core',onlyNew:false,i:0,order:null};
function allOral(){ const out=[]; LESSONS.forEach(l=>(l.oral||[]).forEach(o=>out.push({o,l}))); return out; }
function oralView(){
  const p=pageEl; p.innerHTML=''; p.className='page narrow';
  p.append(h('h1',{class:'l-title',text:T('Entraînement oral')}),h('p',{class:'lead',text:T('Une question à la fois. Écris ta réponse, vérifie les mots-clés que le prof attend, puis compare avec la réponse modèle.')}));
  const pool=()=>{ let a=allOral(); if(oralState.part==='core') a=a.filter(x=>x.l.core); else if(oralState.part!=='all') a=a.filter(x=>x.l.part===oralState.part); if(oralState.onlyNew) a=a.filter(x=>!store.d.known[x.o.q]); return a; };
  const chips=h('div',{class:'row-btns',style:'margin:14px 0'}); const deck=h('div'); const info=h('div',{class:'sr-prog',style:'margin:8px 0'});
  let cur=pool(); if(!oralState.order||oralState.order.length!==cur.length) oralState.order=cur.map((_,i)=>i);
  function refresh(){ cur=pool(); oralState.order=cur.map((_,i)=>i); oralState.i=0; draw(); }
  function draw(){
    chips.innerHTML=''; [['core',T('Au programme')],['all',T('Tout')],...PARTS.filter(x=>PARTLESSONS[x.id].length).map(x=>[x.id,x.num])].forEach(([k,t])=>chips.append(h('button',{class:'chip-btn','aria-pressed':String(oralState.part===k),type:'button',text:t,onclick:()=>{oralState.part=k;refresh();}})));
    chips.append(h('button',{class:'chip-btn','aria-pressed':String(oralState.onlyNew),type:'button',text:T('Seulement non maîtrisées'),onclick:()=>{oralState.onlyNew=!oralState.onlyNew;refresh();}}));
    deck.innerHTML=''; const total=cur.length; const known=allOral().filter(x=>store.d.known[x.o.q]).length;
    info.textContent=total?T('Question {i} / {n} · maîtrisées au total : {k} / {t}',{i:oralState.i+1,n:total,k:known,t:allOral().length}):T('Plus rien à réviser ici. Bravo.');
    if(!total) return; const it=cur[oralState.order[oralState.i]];
    deck.append(oralCard(it.o,{open:true,from:it.l.title}));
    deck.append(h('div',{class:'row-btns'},h('button',{class:'btn',type:'button',text:T('Précédente'),onclick:()=>{oralState.i=(oralState.i-1+total)%total;draw();}}),
      h('button',{class:'btn pri',type:'button',text:T('Suivante'),onclick:()=>{oralState.i=(oralState.i+1)%total;draw();}}),
      h('button',{class:'btn',type:'button',text:T('Mélanger'),onclick:()=>{oralState.order=shuffle(oralState.order);oralState.i=0;draw();}}),
      h('a',{class:'btn',href:lessonHref(it.l.id),text:T('Revoir la leçon')})));
  }
  p.append(chips,info,deck); draw();
}

/* ---- Examen blanc ---- */
let examSel=new Set(['ch1','ch2a','ch2b']); let examN=15;
function quizView(){
  const p=pageEl; p.innerHTML=''; p.className='page narrow';
  p.append(h('h1',{class:'l-title',text:T('Examen blanc')}),h('p',{class:'lead',text:T('Questions tirées au hasard dans les quiz des leçons. Choisis le périmètre et le nombre de questions.')}));
  const box=h('div',null); p.append(box);
  function setup(){
    box.innerHTML='';
    const chips=h('div',{class:'row-btns',style:'margin:12px 0'}); PARTS.filter(x=>PARTLESSONS[x.id].length).forEach(x=>chips.append(h('button',{class:'chip-btn',type:'button','aria-pressed':String(examSel.has(x.id)),text:x.num+' · '+T(x.title),onclick:()=>{ examSel.has(x.id)?examSel.delete(x.id):examSel.add(x.id); setup(); }})));
    const ns=h('div',{class:'row-btns'}); [10,15,25,40].forEach(n=>ns.append(h('button',{class:'chip-btn',type:'button','aria-pressed':String(examN===n),text:T('{n} questions',{n}),onclick:()=>{examN=n;setup();}})));
    const pool=[]; LESSONS.filter(l=>examSel.has(l.part)).forEach(l=>(l.quiz||[]).forEach(q=>pool.push({q,l})));
    box.append(h('b',{text:T('Périmètre')}),chips,h('b',{text:T('Longueur')}),h('div',{style:'height:6px'}),ns,h('div',{style:'height:14px'}),h('div',{class:'tnote',text:T('{n} questions disponibles dans ce périmètre.',{n:pool.length})}),
      h('div',{style:'margin-top:12px'},h('button',{class:'btn pri',type:'button',text:T('Lancer l\'examen'),disabled:pool.length?null:true,onclick:()=>run(shuffle(pool).slice(0,Math.min(examN,pool.length)))})));
  }
  function run(list){
    let i=0,good=0; const wrong=[]; const draw=()=>{
      box.innerHTML='';
      if(i>=list.length){ const pct=Math.round(100*good/list.length);
        box.append(h('div',{class:'score'},h('span',{text:good+' / '+list.length+'  ('+pct+' %)'}),h('small',{text:pct>=75?T('Prêt pour cette zone.'):pct>=50?T('Presque. Retravaille les leçons ci-dessous.'):T('À reprendre calmement, leçon par leçon.')})));
        if(wrong.length){ box.append(h('h3',{class:'h-sec',style:'font-size:18px',text:T('À revoir')})); const seen=new Set(); wrong.forEach(w=>{ if(seen.has(w.l.id)) return; seen.add(w.l.id); box.append(h('div',null,h('a',{href:lessonHref(w.l.id),text:w.l.title}))); }); }
        box.append(h('div',{style:'margin-top:16px'},h('button',{class:'btn pri',type:'button',text:T('Recommencer'),onclick:setup}))); return; }
      const it=list[i], q=it.q; const card=h('div',{class:'card quiz-q'},h('div',{class:'qn',text:T('Question {i} / {n} · {title}',{i:i+1,n:list.length,title:it.l.title})}),h('div',{class:'qq',html:im(q.q)}));
      const opts=h('div',{class:'opts'}); const bs=[]; let done=false;
      q.opts.forEach((o,oi)=>{ const bt=h('button',{class:'opt',type:'button',html:im(o)}); bt.addEventListener('click',()=>{ if(done) return; done=true; const ok=oi===q.ans; if(ok) good++; else wrong.push(it);
        bs.forEach((x,j)=>{x.disabled=true; if(j===q.ans)x.classList.add('ok'); else if(j===oi)x.classList.add('ko');});
        card.append(h('div',{class:'explain',html:'<b>'+(ok?T('✓ Juste.'):T('✗ Raté.'))+'</b> '+im(q.why)}),h('div',{style:'margin-top:10px'},h('button',{class:'btn pri',type:'button',text:i+1<list.length?T('Question suivante'):T('Voir le résultat'),onclick:()=>{i++;draw();}}))); }); bs.push(bt); opts.append(bt); });
      card.append(opts); box.append(card); };
    draw();
  }
  setup();
}

/* ---- Glossaire ---- */
function glossView(){
  const p=pageEl; p.innerHTML=''; p.className='page wide'; p.append(h('h1',{class:'l-title',text:T('Glossaire')}));
  const map=new Map(); LESSONS.forEach(l=>(l.terms||[]).forEach(t=>{ const k=norm(t.t); if(!map.has(k)) map.set(k,{t:t.t,d:t.d,derja:t.derja,l}); }));
  const items=[...map.values()].sort((a,b)=>a.t.localeCompare(b.t,'en',{sensitivity:'base'}));
  const f=h('input',{type:'search',class:'gl-f',placeholder:T('Filtrer ({n} termes)…',{n:items.length}),'aria-label':T('Filtrer le glossaire')});
  const grid=h('div',{class:'terms'});
  const draw=()=>{ const q=norm(f.value); grid.innerHTML=''; items.filter(x=>!q||norm(x.t+' '+x.d).includes(q)).forEach(x=>grid.append(h('div',{class:'term'},h('b',{text:x.t}),h('div',{html:im(x.d)}),x.derja?h('div',{class:'derja'},h('span',{class:'lbl',text:T('DERJA')}),' '+x.derja):null,h('div',{class:'tnote'},h('a',{href:lessonHref(x.l.id),text:x.l.title}))))); };
  f.addEventListener('input',draw); p.append(f,grid); draw();
}

/* ---- Fiches ---- */
function fichesView(){
  const p=pageEl; p.innerHTML=''; p.className='page narrow'; p.append(h('h1',{class:'l-title',text:T('Fiches de révision')}),h('p',{class:'lead',text:T('L\'essentiel de chaque leçon, partie par partie. Idéal la veille de l\'examen.')}));
  PARTS.forEach(x=>{ const ls=PARTLESSONS[x.id]; if(!ls.length) return; p.append(h('h2',{class:'h-sec'},aico(x.icon,34),T(x.title)));
    ls.forEach(l=>p.append(h('div',{class:'card',style:'margin-bottom:12px'},h('h3',{style:'margin-bottom:8px'},h('a',{href:lessonHref(l.id),style:'color:inherit;text-decoration:none',text:l.title})),h('ul',{class:'recap'},(l.recap||[]).map(r=>h('li',{html:im(r)})))))); });
}

/* ---- Recherche ---- */
let INDEX=null;
function buildIndex(){ INDEX=[]; SERVICE_DATA.forEach(sv=>INDEX.push({k:'Service',t:sv.name,s:sv.tagline,h:'#service-'+sv.k,ic:sv.k,hay:norm(sv.name+' '+(sv.full||'')+' '+sv.tagline+' '+(sv.match||[]).join(' '))}));
  LESSONS.forEach(l=>{ INDEX.push({k:'Leçon',t:l.title,s:l.hook.fr,h:lessonHref(l.id),hay:norm(l.title+' '+l.hook.fr+' '+(l.terms||[]).map(t=>t.t).join(' '))});
  (l.terms||[]).forEach(t=>INDEX.push({k:'Terme',t:t.t,s:t.d,h:lessonHref(l.id),hay:norm(t.t+' '+t.d)})); (l.oral||[]).forEach(o=>INDEX.push({k:'Oral',t:o.q,s:l.title,h:lessonHref(l.id),hay:norm(o.q+' '+(o.keys||[]).join(' '))})); }); }
function doSearch(q){ q=norm(q.trim()); if(q.length<2){resultsEl.style.display='none';return;} if(!INDEX) buildIndex();
  const rank={Service:0,Leçon:1,Terme:2,Oral:3}; const toks=q.split(/\s+/);
  const res=INDEX.filter(x=>toks.every(t=>x.hay.includes(t))).sort((a,b)=>(norm(b.t).includes(q)?1:0)-(norm(a.t).includes(q)?1:0)||rank[a.k]-rank[b.k]).slice(0,14);
  resultsEl.innerHTML=''; if(!res.length) resultsEl.append(h('a',{href:'javascript:void 0',text:T('Aucun résultat.')})); res.forEach(x=>resultsEl.append(h('a',{href:x.h,onclick:()=>{resultsEl.style.display='none';}},x.ic?aico(x.ic,26):h('span',{class:'tag',text:({Service:T('Service'),Leçon:T('Leçon'),Terme:T('Terme'),Oral:T('Oral')}[x.k]||x.k)}),h('span',{class:'rs'},trunc(x.t,90),h('small',{text:trunc(x.s,110)})))));
  resultsEl.style.display='block'; }

/* ---- Routeur ---- */
function route(){
  const hash=(location.hash||'#home').slice(1); const r=hash||'home';
  document.body.classList.remove('nav-open'); closeDrawerQuiet();
  let title=T('Cloud Security 0→Hero · Cours illustré de sécurité AWS'), side=false;
  if(r==='cours'){ location.replace(lessonHref(nextLesson().id)); return; }
  if(r.startsWith('lesson-')){ const l=BYID[r.slice(7)]; if(l){ lessonView(l); side=true; title=l.title+' · Cloud Security 0→Hero'; renderSide(r); } else homeView(); }
  else if(r.startsWith('service-')){ serviceView(r.slice(8)); title=T('{name} : rôle et usage · Cloud Security 0→Hero',{name:svcName(r.slice(8))}); renderSide(r); }
  else { const v={home:homeView,oral:oralView,quiz:quizView,glossaire:glossView,fiches:fichesView,services:servicesView}[r]||homeView; v(); renderSide(v===homeView?'':r); }
  document.body.classList.toggle('has-side',side); markNav(r); window.scrollTo(0,0); document.title=title;
}
function closeDrawerQuiet(){ if(drawerEl){ drawerEl.classList.remove('open'); document.body.classList.remove('drawer-open'); } }
function boot(){
  store.load(); mountSprite(); shell(); setProgressBar();
  const lk=document.createElement('link'); lk.rel='icon'; lk.href=FAVICON; document.head.append(lk);
  window.addEventListener('hashchange',()=>{route();setProgressBar();}); route();
}
loadLangFonts(); boot();
