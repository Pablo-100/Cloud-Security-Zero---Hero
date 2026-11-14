/* ===== Blocs simples ===== */
const BLOCKS={};
function sec(title,node,cls){ const d=h('section',{class:'blk '+(cls||'')}); if(title) d.append(h('h3',{text:title})); d.append(node); return d; }

BLOCKS.derja=b=>h('section',{class:'blk'},h('div',{class:'derja'},h('span',{class:'lbl',text:T('DERJA · {t}',{t:String(b.title||T('Fhem bel derja')).toUpperCase()})}),h('div',{class:'md',html:md(b.text)})));
BLOCKS.text=b=>sec(b.title,h('div',{class:'md',html:md(b.md)}));
BLOCKS.callout=b=>{
  const lab={tip:T('Astuce'),warn:T('Attention'),exam:T('Examen'),info:T('Info')}[b.tone]||T('Info');
  return h('section',{class:'blk'},h('div',{class:'callout '+b.tone},h('div',{class:'ic',text:lab}),h('div',{class:'md',html:(b.title?'<b>'+esc(b.title)+'</b>':'')+md(b.text)})));
};
function cell(t){
  const v=String(t==null?'':t).trim();
  if(v==='Client'||v===T('Client')) return '<span class="own c">'+T('Client')+'</span>';
  if(v==='Fournisseur'||v===T('Fournisseur')) return '<span class="own f">'+T('Fournisseur')+'</span>';
  if(v==='Partagé'||v===T('Partagé')) return '<span class="own s">'+T('Partagé')+'</span>';
  return im(v).replace(/\n/g,'<br>');
}
BLOCKS.table=b=>{
  const t=h('table',null,h('thead',null,h('tr',null,b.head.map(x=>h('th',{html:im(x)})))),
    h('tbody',null,b.rows.map(r=>h('tr',null,r.map(c=>h('td',{html:cell(c)}))))));
  const w=h('div',null,h('div',{class:'tbl-wrap'},t)); if(b.note) w.append(h('div',{class:'tnote',html:im(b.note)}));
  return sec(b.title,w);
};
BLOCKS.compare=b=>sec(b.title,h('div',{class:'cmp'},b.cols.map(c=>h('div',{class:'col'},
  h('h4',null,c.icon?aico(c.icon,34):null,c.name),c.tag?h('div',{class:'tg',text:c.tag}):null,
  h('ul',null,c.points.map(p=>h('li',{html:im(p)}))),c.use?h('div',{class:'use',html:'<b>'+T('Usage :')+'</b> '+im(c.use)}):null))));
BLOCKS.steps=b=>sec(b.title,h('div',{class:'stp'},b.items.map(it=>h('div',{class:'it'},h('div',{class:'n'}),h('div',null,h('b',{text:it.t}),h('div',{class:'md',html:md(it.d)}))))));

/* scénario */
BLOCKS.scenario=b=>{
  const card=h('div',{class:'card scn'});
  card.append(h('span',{class:'tag',text:T('Scénario')}),h('b',{text:' '+(b.title||'')}),h('div',{class:'sit',style:'margin-top:8px',html:im(b.situation)}),h('div',{class:'qq',text:b.q}));
  const box=h('div',{class:'opts'}); let done=false; const btns=[];
  b.opts.forEach((o,i)=>{
    const bt=h('button',{class:'opt',type:'button'},h('span',{html:im(o.t)}));
    bt.addEventListener('click',()=>{ if(done) return; done=true;
      btns.forEach((x,j)=>{ x.disabled=true; const oo=b.opts[j];
        if(oo.ok){x.classList.add('ok');} else if(j===i){x.classList.add('ko');}
        if(oo.ok||j===i) x.append(h('span',{class:'why',html:(oo.ok?'✓ ':'✗ ')+im(oo.why)})); });
    });
    btns.push(bt); box.append(bt);
  });
  card.append(box); return sec(null,card);
};

/* policy */
function hlJson(line){
  let out='',last=0,m; const re=/("(?:[^"\\]|\\.)*")(\s*:)?|([{}\[\],])|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g;
  while((m=re.exec(line))){ out+=esc(line.slice(last,m.index));
    if(m[1]) out+= m[2]? '<span class="tk-k">'+esc(m[1])+'</span>'+esc(m[2]) : '<span class="tk-s">'+esc(m[1])+'</span>';
    else if(m[3]) out+='<span class="tk-p">'+m[3]+'</span>'; else out+='<span class="tk-b">'+esc(m[0])+'</span>';
    last=re.lastIndex; }
  return out+esc(line.slice(last));
}
function noteLines(n){ const r=n.lines||[]; if(r.length===2&&r[1]>=r[0]){const a=[];for(let i=r[0];i<=r[1];i++)a.push(i);return a;} return r; }
BLOCKS.policy=b=>{
  const wrap=h('div',null);
  const code=h('div',{class:'code',role:'region','aria-label':T('Code de la politique')}); const lns=[];
  b.lines.forEach((ln,i)=>{ const row=h('div',{class:'ln'},h('i',{text:i+1}),h('span',{html:hlJson(ln)||' '})); lns.push(row); code.append(row); });
  const notes=h('div',{class:'notes'}); const nbs=[]; let sel=-1;
  const covers=lines=>lines.map(n=>n-1);
  function paint(){
    lns.forEach(r=>{r.className='ln';});
    (b.notes||[]).forEach((n,i)=>{ noteLines(n).forEach(l=>{ const r=lns[l-1]; if(r) r.classList.add('t-'+(n.tone||'info')); }); });
    nbs.forEach((x,i)=>x.classList.toggle('on',i===sel));
    if(sel>=0) noteLines(b.notes[sel]).forEach(l=>{const r=lns[l-1]; if(r) r.classList.add('sel');});
  }
  (b.notes||[]).forEach((n,i)=>{
    const L=noteLines(n); const lab=L.length>1?('L'+L[0]+(L.length===2||L[L.length-1]-L[0]===L.length-1?'–':'+')+L[L.length-1]):('L'+L[0]);
    const nb=h('button',{type:'button',class:'note t-'+(n.tone||'info')},h('small',{text:lab}),h('span',{html:im(n.text)}));
    nb.addEventListener('click',()=>{ sel=(sel===i?-1:i); paint(); }); nbs.push(nb); notes.append(nb);
  });
  lns.forEach((r,idx)=>r.addEventListener('click',()=>{ const k=(b.notes||[]).findIndex(n=>noteLines(n).includes(idx+1)); if(k>=0){sel=k;paint();nbs[k].scrollIntoView({block:'nearest'});} }));
  paint();
  wrap.append(h('div',{class:'pol'},code,(b.notes&&b.notes.length)?h('div',null,h('div',{class:'tnote',style:'margin:0 0 8px',text:T('Clique une note (ou une ligne) pour la relier au code.')}),notes):h('div')));
  if(b.tryit&&b.tryit.length){
    const t=h('div',{class:'try'},h('div',{class:'tnote',style:'margin:10px 0 0',text:T('À toi : lis la politique ci-dessus, puis réponds.')}));
    b.tryit.forEach(q=>{ const row=h('div',{class:'q'},h('div',{class:'qt',html:im(q.q)}));
      const yn=h('div',{class:'yn'}); let done=false;
      [[T('Oui'),true],[T('Non'),false]].forEach(([lab,val])=>{ yn.append(h('button',{type:'button',text:lab,onclick:()=>{ if(done) return; done=true; const ok=(val===q.ans);
        row.append(h('div',{class:'fb '+(ok?'ok':'ko'),html:(ok?T('✓ Correct.'):T('✗ Pas tout à fait.'))+' '+im(q.why||'')})); yn.querySelectorAll('button').forEach(x=>x.disabled=true);} })); });
      row.append(yn); t.append(row); });
    wrap.append(t);
  }
  return sec(b.title,wrap);
};

/* decode */
BLOCKS.decode=b=>{
  const raw=b.raw||''; const parts=[]; let pos=0;
  (b.parts||[]).forEach((p,i)=>{ const k=raw.indexOf(p.s,pos); if(k>=0){ parts.push({i,k,e:k+p.s.length,p}); pos=k+p.s.length; } });
  const box=h('div',{class:'dec-raw'}); let at=0; const spans=[];
  parts.forEach((x,i)=>{ if(x.k>at) box.append(document.createTextNode(raw.slice(at,x.k)));
    const sp=h('span',{class:'p',style:'--pc:var(--k'+((i%8)+1)+')',tabindex:'0','data-i':i,text:raw.slice(x.k,x.e)}); spans.push(sp); box.append(sp); at=x.e; });
  if(at<raw.length) box.append(document.createTextNode(raw.slice(at)));
  const info=h('div',{class:'dec-info'}); const leg=h('div',{class:'dec-legend'}); const lbs=[];
  function pick(i){ spans.forEach((x,j)=>x.classList.toggle('on',i===j)); lbs.forEach((x,j)=>x.classList.toggle('on',i===j));
    const p=parts[i]; if(!p) return; info.style.setProperty('--pc','var(--k'+((i%8)+1)+')');
    info.innerHTML='<b>'+esc(p.p.label||'')+'</b> <code>'+esc(trunc(p.p.s,60))+'</code><div style="margin-top:4px">'+im(p.p.note||'')+'</div>'; }
  parts.forEach((x,i)=>{ const lb=h('button',{type:'button',style:'--pc:var(--k'+((i%8)+1)+')',text:x.p.label||x.p.s}); lb.addEventListener('click',()=>pick(i)); lbs.push(lb); leg.append(lb);
    spans[i].addEventListener('click',()=>pick(i)); spans[i].addEventListener('mouseenter',()=>pick(i)); spans[i].addEventListener('focus',()=>pick(i)); });
  const w=h('div',null,box,leg,info); if(parts.length) pick(0);
  return sec(b.title||T('Décodage'),w);
};

/* ===== Quiz ===== */
function quizBlock(qs,key){
  const wrap=h('div',null); let answered=0,good=0; const total=qs.length;
  const sumBox=h('div',{style:'margin-top:8px'});
  qs.forEach((q,qi)=>{
    const card=h('div',{class:'card quiz-q'},h('div',{class:'qn',text:T('Q{n} / {m}',{n:qi+1,m:total})}),h('div',{class:'qq',html:im(q.q)}));
    const box=h('div',{class:'opts'}); const btns=[]; let done=false;
    q.opts.forEach((o,oi)=>{ const bt=h('button',{class:'opt',type:'button',html:im(o)}); bt.addEventListener('click',()=>{ if(done) return; done=true; answered++;
      const ok=oi===q.ans; if(ok) good++;
      btns.forEach((x,j)=>{x.disabled=true; if(j===q.ans) x.classList.add('ok'); else if(j===oi) x.classList.add('ko');});
      card.append(h('div',{class:'explain',html:'<b>'+(ok?T('✓ Juste.'):T('✗ Raté.'))+'</b> '+im(q.why)}));
      if(answered===total){ const pct=Math.round(100*good/total); sumBox.innerHTML='';
        sumBox.append(h('div',{class:'score'},h('span',{text:good+' / '+total}),h('small',{text:pct>=75?T('Solide. Passe à la leçon suivante.'):T('À retravailler : relis les pièges, puis refais le quiz.')})));
        if(key){ store.d.quiz[key]=Math.max(store.d.quiz[key]||0,pct); store.save(); } }
    }); btns.push(bt); box.append(bt); });
    card.append(box); wrap.append(card);
  });
  wrap.append(sumBox); return wrap;
}

/* ===== Oral ===== */
function oralCard(o,opts){
  opts=opts||{};
  const card=h('div',{class:'oral-card'+(opts.open?' open':'')});
  const key=o.q; const known=()=>!!store.d.known[key];
  const head=h('div',{class:'oral-q',role:'button',tabindex:'0','aria-expanded':'false'},h('span',{class:'mic',text:T('ORAL')}),h('span',{html:im(o.q)}));
  if(opts.from) head.append(h('span',{class:'tag',style:'margin-left:auto;white-space:nowrap',text:opts.from}));
  const body=h('div',{class:'oral-b'});
  const ta=h('textarea',{placeholder:T('Écris ta réponse comme tu la dirais à l\'oral, puis vérifie les mots-clés…'),'aria-label':T('Ta réponse')});
  const keys=h('div',{class:'keys'},(o.keys||[]).map(k=>h('span',{text:k})));
  const ans=h('div',{class:'oral-a',style:'display:none',html:md(o.a)});
  const bCheck=h('button',{class:'btn',type:'button',text:T('Vérifier mes mots-clés'),onclick:()=>{
    const t=norm(ta.value); [...keys.children].forEach((sp,i)=>{ const k=norm(o.keys[i]); const words=k.split(/[^a-z0-9]+/).filter(w=>w.length>2);
      const hit=t.includes(k)||(words.length>1&&words.every(w=>t.includes(w))); sp.className=hit?'hit':'miss'; }); }});
  const bShow=h('button',{class:'btn',type:'button',text:T('Voir la réponse modèle'),onclick:()=>{ ans.style.display=ans.style.display==='none'?'block':'none'; }});
  const bKnown=h('button',{class:'btn'+(known()?' on':''),type:'button',text:known()?T('Maîtrisé ✓'):T('Je sais le dire'),onclick:e=>{ store.d.known[key]=!store.d.known[key]; store.save(); bKnown.className='btn'+(known()?' on':''); bKnown.textContent=known()?T('Maîtrisé ✓'):T('Je sais le dire'); opts.onChange&&opts.onChange(); }});
  body.append(ta,keys,h('div',{class:'row-btns'},bCheck,bShow,bKnown),h('div',{style:'height:8px'}),ans);
  const toggle=()=>{ const o2=card.classList.toggle('open'); head.setAttribute('aria-expanded',o2); };
  head.addEventListener('click',toggle); head.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle();} });
  card.append(head,body); return card;
}
