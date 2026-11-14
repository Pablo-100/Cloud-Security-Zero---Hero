/* ===== Widgets interactifs ===== */
const WIDGETS={};
BLOCKS.widget=b=>{ const f=WIDGETS[b.name]; return f? f(b) : h('div'); };

/* --- Responsabilité partagée --- */
WIDGETS.sharedResp=b=>{
  const root=h('div',{class:'wg'});
  root.append(h('div',{class:'wg-h',text:T('Qui est responsable ? · {title}',{title:b.title||T('Responsabilité partagée')})}));
  const body=h('div',{class:'wg-b'}); root.append(body);
  const MODEL={
    IaaS:{ex:'Amazon EC2',layers:[[T('Données'),'c',T('Classification, chiffrement, sauvegardes')],[T('Identités'),'c',T('IAM, MFA, rôles, revues')],[T('Application'),'c',T('Code, config, correctifs applicatifs')],[T('OS / Runtime'),'c',T('Patchs, durcissement, antivirus')],[T('Infrastructure'),'f',T('Datacenter, hôtes, hyperviseur, réseau physique')]]},
    PaaS:{ex:'AWS Elastic Beanstalk',layers:[[T('Données'),'c',T('Classification, chiffrement, sauvegardes')],[T('Identités'),'c',T('IAM, MFA, rôles, revues')],[T('Application'),'c',T('Ton code et ses paramètres')],[T('OS / Runtime'),'s',T('Plateforme gérée par AWS ; options/versions choisies par toi')],[T('Infrastructure'),'f',T('Datacenter, hôtes, hyperviseur, réseau physique')]]},
    SaaS:{ex:'Amazon WorkSpaces',layers:[[T('Données'),'c',T('Ce que tu y mets et qui y accède')],[T('Identités'),'c',T('Utilisateurs, MFA, droits')],[T('Application'),'f',T('Fournie et maintenue par le fournisseur')],[T('OS / Runtime'),'f',T('Géré par le fournisseur')],[T('Infrastructure'),'f',T('Géré par le fournisseur')]]}
  };
  let mode='IaaS';
  const tabs=h('div',{class:'tabs',role:'tablist'}); const stack=h('div',{class:'stack'}); const note=h('div',{class:'tnote'});
  function draw(){
    tabs.innerHTML=''; ['IaaS','PaaS','SaaS'].forEach(m=>tabs.append(h('button',{type:'button',class:m===mode?'on':'',text:m,onclick:()=>{mode=m;draw();}})));
    stack.innerHTML=''; MODEL[mode].layers.forEach(([n,o,d])=>stack.append(h('div',{class:'layer '+o},h('b',{text:n}),h('span',{text:d}),h('span',{class:'own '+o,style:'justify-self:start',text:o==='c'?T('Client'):o==='f'?T('Fournisseur'):T('Partagé')}))));
    note.innerHTML=T('Exemple AWS : <b>{ex}</b>. Même en SaaS, <b>données, identités et configuration</b> restent chez le client.',{ex:MODEL[mode].ex});
  }
  body.append(tabs,stack,note,h('div',{class:'sep'}));
  const CASES=[
    [T('Un bucket de stockage est public par erreur.'),'Client',T('Configuration d\'accès = côté client (« sécurité DANS le cloud »).')],
    [T('Un disque physique du datacenter tombe en panne.'),'Fournisseur',T('Matériel et datacenter = « sécurité DU cloud ».')],
    [T('L\'OS d\'une VM EC2 n\'est pas patché.'),'Client',T('En IaaS, l\'OS et au-dessus sont côté client.')],
    [T('Une application SaaS est mal paramétrée et partage des données.'),'Client',T('Paramètres, droits et usage restent au client même en SaaS.')],
    [T('Le fournisseur publie un rapport SOC 2.'),'Fournisseur',T('C\'est le fournisseur qui apporte la preuve sur ses contrôles.')],
    [T('Un Security Group laisse le port 22 ouvert à tout Internet.'),'Client',T('Règles de pare-feu réseau = configuration client.')],
    [T('Le correctif de l\'hyperviseur sous-jacent doit être appliqué.'),'Fournisseur',T('Couche basse gérée par AWS.')],
    [T('Le mot de passe admin d\'un compte n\'a pas de MFA.'),'Client',T('Identités et accès = toujours côté client.')]
  ];
  const q=h('div',{class:'sr-q'}), prog=h('div',{class:'sr-prog'}), fb=h('div',{class:'fb',style:'display:none'}), btns=h('div',{class:'sr-btns'}); let i=0,score=0,answered=false; let order=shuffle(CASES);
  const next=h('button',{class:'btn',type:'button',text:T('Cas suivant'),style:'display:none',onclick:()=>{ i++; showCase(); }});
  function showCase(){
    answered=false; fb.style.display='none'; next.style.display='none'; btns.innerHTML='';
    if(i>=order.length){ q.textContent=T('Terminé : {score} / {n} bonnes réponses.',{score,n:order.length}); prog.textContent=''; btns.append(h('button',{class:'btn pri',type:'button',text:T('Rejouer'),onclick:()=>{i=0;score=0;order=shuffle(CASES);showCase();}})); return; }
    const c=order[i]; q.textContent=c[0]; prog.textContent=T('Mini-cas {i} / {n} · score {score}',{i:i+1,n:order.length,score});
    ['Client','Fournisseur','Partagé'].forEach(a=>btns.append(h('button',{class:'btn',type:'button',text:T(a),onclick:()=>{ if(answered) return; answered=true; const ok=a===c[1]; if(ok) score++;
      fb.className='fb '+(ok?'ok':'ko'); fb.style.display=''; fb.innerHTML=(ok?T('✓ Juste.')+' ':T('✗ Réponse : <b>{a}</b>.',{a:T(c[1])})+' ')+im(c[2]); next.style.display=''; prog.textContent=T('Mini-cas {i} / {n} · score {score}',{i:i+1,n:order.length,score}); }})));
  }
  body.append(h('b',{text:T('Mini-cas : qui est responsable ?')}),prog,q,btns,fb,h('div',{style:'margin-top:8px'},next));
  draw(); showCase(); return h('section',{class:'blk'},root);
};

/* --- Simulateur d'évaluation IAM --- */
WIDGETS.evalLogic=b=>{
  const root=h('div',{class:'wg'}); root.append(h('div',{class:'wg-h',text:b.title||T('Simulateur d\'évaluation des politiques')},h('span',{class:'sp tag',text:T('modèle simplifié du cours')})));
  const body=h('div',{class:'wg-b'}); root.append(body);
  const S={account:'same',identity:'allow',resource:'none',scp:'na',boundary:'na',session:'na'};
  const OPT={
    account:[['same',T('Même compte AWS')],['cross',T('Compte différent (cross-account)')]],
    identity:[['none',T('Aucune policy ne le mentionne')],['allow',T('Allow explicite')],['deny',T('Deny explicite')]],
    resource:[['none',T('Pas de resource policy / rien')],['allow',T('Allow pour ce principal')],['deny',T('Deny explicite')]],
    scp:[['na',T('Pas de SCP (hors Organizations)')],['allow',T('La SCP autorise l\'action')],['notAllow',T('L\'action n\'est pas dans la SCP')],['deny',T('SCP avec Deny explicite')]],
    boundary:[['na',T('Pas de permissions boundary')],['allow',T('Le boundary autorise l\'action')],['notAllow',T('Hors du boundary')],['deny',T('Boundary avec Deny explicite')]],
    session:[['na',T('Pas de session policy')],['allow',T('La session policy autorise')],['notAllow',T('Hors session policy')],['deny',T('Session policy avec Deny')]]
  };
  const LAB={account:T('Où est la ressource ?'),identity:T('Identity-based policy'),resource:T('Resource-based policy'),scp:T('SCP (Organizations)'),boundary:T('Permissions boundary'),session:T('Session policy')};
  const form=h('div',{class:'ev-form'}); const sels={};
  Object.keys(OPT).forEach(k=>{ const sel=h('select',{id:'ev-'+k,'aria-label':LAB[k]},OPT[k].map(([v,t])=>h('option',{value:v,text:t})));
    sel.value=S[k]; sel.addEventListener('change',()=>{S[k]=sel.value;calc();}); sels[k]=sel; form.append(h('label',{for:'ev-'+k},h('span',{text:LAB[k]}),sel)); });
  const PRE=[
    [T('Slide 52 : Deny sqs:* + Allow DeleteQueue'),{account:'same',identity:'deny',resource:'none',scp:'na',boundary:'na',session:'na'}],
    [T('SCP « S3 seulement » vs action EC2'),{account:'same',identity:'allow',resource:'none',scp:'notAllow',boundary:'na',session:'na'}],
    [T('Boundary S3+EC2 vs DynamoDB'),{account:'same',identity:'allow',resource:'none',scp:'na',boundary:'notAllow',session:'na'}],
    [T('Session policy « S3 only »'),{account:'same',identity:'allow',resource:'none',scp:'na',boundary:'na',session:'notAllow'}],
    [T('Cross-account : un seul côté autorise'),{account:'cross',identity:'allow',resource:'none',scp:'na',boundary:'na',session:'na'}],
    [T('Cross-account : les deux côtés autorisent'),{account:'cross',identity:'allow',resource:'allow',scp:'na',boundary:'na',session:'na'}],
    [T('Même compte : seule la resource policy autorise'),{account:'same',identity:'none',resource:'allow',scp:'na',boundary:'na',session:'na'}]
  ];
  const pres=h('div',{class:'presets'}); PRE.forEach(([t,v])=>pres.append(h('button',{class:'btn',type:'button',text:t,onclick:()=>{Object.assign(S,v);Object.keys(sels).forEach(k=>sels[k].value=S[k]);calc();}})));
  const pipe=h('div',{class:'ev-pipe'}), verdict=h('div',{class:'verdict'});
  function calc(){
    const st=[]; let denied=false, why='';
    const denyList=[]; if(S.identity==='deny') denyList.push('identity-based policy'); if(S.resource==='deny') denyList.push('resource-based policy'); if(S.scp==='deny') denyList.push('SCP'); if(S.boundary==='deny') denyList.push('permissions boundary'); if(S.session==='deny') denyList.push('session policy');
    st.push(denyList.length?{s:'fail',t:T('1. Deny explicite ?'),d:T('OUI : un Deny dans {list}. Il l\'emporte sur tous les Allow.',{list:denyList.join(' + ')})}:{s:'pass',t:T('1. Deny explicite ?'),d:T('Non : aucun Deny trouvé, on continue.')});
    if(denyList.length){ denied=true; why=T('Deny explicite'); }
    const gate=(key,name,badMsg,okMsg,naMsg)=>{ if(denied){ st.push({s:'skip',t:name,d:T('Non évalué : déjà refusé.')}); return; }
      if(S[key]==='na') st.push({s:'na',t:name,d:naMsg}); else if(S[key]==='allow') st.push({s:'pass',t:name,d:okMsg}); else { st.push({s:'fail',t:name,d:badMsg}); denied=true; why=name; } };
    gate('scp',T('2. SCP (plafond du compte)'),T('L\'action n\'est pas autorisée par la SCP : refus implicite. Une SCP ne donne rien, elle limite.'),T('La SCP laisse passer (elle ne donne toujours aucun droit).'),T('Pas de SCP applicable : étape ignorée.'));
    gate('boundary',T('3. Permissions boundary'),T('L\'action sort du plafond du boundary : refus implicite.'),T('Le boundary laisse passer (il ne donne aucun droit).'),T('Pas de boundary : étape ignorée.'));
    gate('session',T('4. Session policy'),T('L\'action sort de la session policy : refus implicite.'),T('La session policy laisse passer (intersection avec le rôle).'),T('Pas de session policy : étape ignorée.'));
    let allow=false;
    if(denied) st.push({s:'skip',t:T('5. Il faut un Allow'),d:T('Non évalué : déjà refusé.')});
    else { const idA=S.identity==='allow', reA=S.resource==='allow';
      if(S.account==='same'){ allow=idA||reA; st.push(allow?{s:'pass',t:T('5. Allow (même compte)'),d:T('Même compte : un Allow dans l\'identity policy OU dans la resource policy suffit.')}:{s:'fail',t:T('5. Allow (même compte)'),d:T('Aucun Allow : refus implicite (deny par défaut).')}); }
      else { allow=idA&&reA; st.push(allow?{s:'pass',t:T('5. Allow (cross-account)'),d:T('Cross-account : les DEUX comptes doivent autoriser (identity policy côté A + resource policy côté B). C\'est le cas.')}:{s:'fail',t:T('5. Allow (cross-account)'),d:idA?T('Cross-account : il faut un Allow côté appelant ET côté ressource. Ici la resource policy du compte B manque.'):reA?T('Cross-account : il faut un Allow côté appelant ET côté ressource. Ici l\'identity policy du compte A manque.'):T('Cross-account : il faut un Allow côté appelant ET côté ressource. Ici les deux manquent.')}); }
      if(!allow){denied=true;why=T('Pas d\'Allow');} }
    pipe.innerHTML=''; st.forEach(x=>pipe.append(h('div',{class:'stage '+x.s},h('div',{class:'si',text:x.s==='pass'?'✓':x.s==='fail'?'✗':x.s==='na'?'–':'·'}),h('div',null,h('b',{text:x.t}),h('div',{text:x.d})))));
    verdict.className='verdict '+(denied?'deny':'allow'); verdict.textContent=denied?T('REFUSÉ ({why})',{why}):T('AUTORISÉ');
  }
  body.append(pres,h('div',{class:'ev'},h('div',null,form),h('div',null,pipe,h('div',{style:'height:10px'}),verdict)),
    h('div',{class:'tnote',html:T('Ordre à retenir : <b>Deny explicite → SCP → boundary → session → Allow</b>. Simplification pédagogique : des cas particuliers existent (par exemple une resource policy qui cible directement l\'ARN d\'un utilisateur dans le même compte).')}));
  calc(); return h('section',{class:'blk'},root);
};

/* --- ABAC : jeu avec les tags --- */
WIDGETS.abacPlay=b=>{
  const root=h('div',{class:'wg'}); root.append(h('div',{class:'wg-h',text:b.title||T('ABAC : joue avec les tags')},h('span',{class:'sp tag',text:'Team = Team ?'})));
  const body=h('div',{class:'wg-b'}); root.append(body);
  const TEAMS=['Payments','Marketing','Engineering'];
  const users=[{n:'Alice',t:'Payments'},{n:'Bob',t:'Marketing'},{n:'Charlie',t:'Engineering'}];
  const bks=[{n:'payments-data',t:'Payments'},{n:'marketing-data',t:'Marketing'},{n:'engineering-data',t:'Engineering'}];
  let su=0, sb=0;
  const uL=h('div',{class:'ab-list'}), bL=h('div',{class:'ab-list'}), mx=h('div',{class:'tbl-wrap',style:'margin-top:12px'}), res=h('div',{class:'ab-res'});
  const polTxt=h('div',{class:'code',style:'margin-bottom:12px'});
  ['{','  "Effect": "Allow",','  "Action": "s3:*",','  "Resource": "*",','  "Condition": { "StringEquals": {','     "aws:PrincipalTag/Team": "${aws:ResourceTag/Team}" } }','}'].forEach((l,i)=>polTxt.append(h('div',{class:'ln'+(i>=4?' t-good':'')},h('i',{text:i+1}),h('span',{html:hlJson(l)||' '}))));
  const sel=(v,onc)=>{ const s1=h('select',{'aria-label':T('Tag Team')},TEAMS.map(t=>h('option',{value:t,text:t}))); s1.value=v; s1.addEventListener('click',e=>e.stopPropagation()); s1.addEventListener('change',()=>onc(s1.value)); return s1; };
  function draw(){
    uL.innerHTML=''; users.forEach((u,i)=>uL.append(h('div',{class:'ab-item'+(i===su?' sel':''),role:'button',tabindex:'0',onclick:()=>{su=i;draw();}},h('span',{html:'<b>'+u.n+'</b> (IAM user)'}),sel(u.t,v=>{u.t=v;draw();}))));
    bL.innerHTML=''; bks.forEach((k,i)=>bL.append(h('div',{class:'ab-item'+(i===sb?' sel':''),role:'button',tabindex:'0',onclick:()=>{sb=i;draw();}},h('span',{html:'<code>'+esc(k.n)+'</code>'}),sel(k.t,v=>{k.t=v;draw();}))));
    const t=h('table',{class:'mx'},h('thead',null,h('tr',null,h('th'),bks.map(k=>h('th',{text:k.n})))),
      h('tbody',null,users.map((u,i)=>h('tr',null,h('th',{text:u.n,style:'text-align:right'}),bks.map((k,j)=>{ const ok=u.t===k.t; return h('td',{class:(ok?'al':'de')+(i===su&&j===sb?' sel':''),text:ok?'ALLOW':'DENY'}); })))));
    mx.innerHTML=''; mx.append(t);
    const u=users[su], k=bks[sb], ok=u.t===k.t;
    res.className='ab-res '+(ok?'al':'de');
    res.innerHTML='<b>'+u.n+' → '+esc(k.n)+' : '+(ok?'ALLOW':'DENY')+'</b><br>'+(ok?T('Tag du principal <code>Team={u}</code> = tag de la ressource <code>Team={k}</code>. La condition est vraie : l\'action est autorisée.',{u:u.t,k:k.t}):T('Tag du principal <code>Team={u}</code> ≠ tag de la ressource <code>Team={k}</code>. La condition est fausse : pas d\'Allow, donc refus implicite.',{u:u.t,k:k.t}));
  }
  const addB=h('button',{class:'btn pri',type:'button',text:T('Créer un nouveau bucket « payments-new-data »'),onclick:()=>{ if(bks.find(x=>x.n==='payments-new-data')) return; bks.push({n:'payments-new-data',t:'Payments'}); sb=bks.length-1; addB.disabled=true; draw(); info.style.display=''; }});
  const info=h('div',{class:'callout tip',style:'display:none;margin-top:10px'},h('div',{class:'ic',text:'ABAC'}),h('div',{html:T('<b>Aucune nouvelle policy.</b> Il suffit de taguer le bucket <code>Team=Payments</code> : Alice y a déjà accès. En RBAC pur, il aurait fallu éditer ou créer une policy.')}));
  body.append(polTxt,h('div',{class:'abac'},h('div',null,h('b',{text:T('1. Choisis un utilisateur (change son tag !)')}),h('div',{style:'height:6px'}),uL),h('div',null,h('b',{text:T('2. Choisis une ressource')}),h('div',{style:'height:6px'}),bL)),res,mx,h('div',{style:'margin-top:10px'},addB),info);
  draw(); return h('section',{class:'blk'},root);
};
