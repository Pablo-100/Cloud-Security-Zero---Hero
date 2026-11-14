/* ===== Blocs visuels : cartouche de figure + pipeline, stack, hub, cycle, decision, matrix, tree, cards, facts, svc ===== */
const FIG={n:0};
const figTag=()=>{ FIG.n++; return h('span',{class:'figno',text:T('Fig. {n}',{n:FIG.n})}); };
const tc=t=>'t-'+(t||'neutral');
const KIND_LABEL={pipeline:TK('Chaîne'),stack:TK('Couches'),hub:TK('Carte'),cycle:TK('Cycle'),decision:TK('Arbre de décision'),matrix:TK('Matrice'),tree:TK('Hiérarchie'),cards:TK('Idées clés'),facts:TK('Repères'),svc:TK('Services')};
function fig(kind,title,body,foot){
  return h('section',{class:'blk fig-blk'},h('figure',{class:'fig f-'+kind},
    h('div',{class:'fig-head'},figTag(),h('span',{class:'fig-t',text:title||''}),h('span',{class:'fig-k',text:T(KIND_LABEL[kind]||'')})),
    h('div',{class:'fig-body'},body),foot?h('figcaption',{class:'fig-foot',html:im(foot)}):null));
}
const ic=(it,size)=>aico(resolveIcon(it.label||it.t||it.a||'',it.sub||it.d||'',it.icon,null),size);

/* pipeline */
BLOCKS.pipeline=b=>{
  const ol=h('ol',{class:'pl'});
  b.stages.forEach((st,i)=>ol.append(h('li',{class:'stg '+tc(st.tone)},h('span',{class:'n',text:i+1}),ic(st,48),h('b',{text:st.label}),st.sub?h('small',{text:st.sub}):null)));
  return fig('pipeline',b.title,ol,b.caption);
};

/* stack */
BLOCKS.stack=b=>{
  const box=h('div',{class:'stk'});
  b.layers.forEach((l,i)=>{
    const inset=b.nest===false?0:Math.min(i*16,64);
    box.append(h('div',{class:'lyr '+tc(l.tone),style:`margin-inline:${inset}px`},ic(l,42),
      h('div',{class:'lt'},h('b',{text:l.label}),l.sub?h('small',{text:l.sub}):null),
      l.tags&&l.tags.length?h('div',{class:'lg'},l.tags.map(t=>h('span',{text:t}))):null));
  });
  return fig('stack',b.title,h('div',{class:'stk-wrap'},b.side?h('div',{class:'stk-side',text:b.side}):null,box));
};

/* tuile SVG (hub / cycle) */
function svgTile(g,cx,cy,w,hh,it,tone){
  const x=cx-w/2,y=cy-hh/2; g.append(s('rect',{class:'tl-rect',x,y,width:w,height:hh,rx:13}));
  g.append(sico(resolveIcon(it.label,it.sub,it.icon,null),x+9,cy-18,36));
  const L=wrapText(it.label,Math.floor((w-62)/6.9),2), sub=it.sub?trunc(it.sub,Math.floor((w-58)/5.5)):'', t=L.length+(sub?1:0), y0=cy-(t*14)/2+11;
  L.forEach((ln,j)=>g.append(s('text',{class:'tl-t',x:x+52,y:y0+j*14,text:ln})));
  if(sub) g.append(s('text',{class:'tl-s',x:x+52,y:y0+L.length*14+1,text:sub}));
}
function rectBorder(cx,cy,w,hh,tx,ty,pad){ const dx=tx-cx,dy=ty-cy; if(!dx&&!dy) return [cx,cy]; const k=Math.min((w/2+pad)/Math.abs(dx||1e-6),(hh/2+pad)/Math.abs(dy||1e-6)); return [cx+dx*k,cy+dy*k]; }

/* hub */
BLOCKS.hub=b=>{
  const n=b.spokes.length, W=760, H=n<=4?340:n<=6?400:440, cx=W/2, cy=H/2, rx=n<=4?270:292, ry=n<=4?112:n<=6?150:164, NW=178, NH=64;
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':b.title||T('Carte')});
  const pts=b.spokes.map((sp,i)=>{ const a=-Math.PI/2+i*2*Math.PI/n; return {x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)}; });
  pts.forEach((p,i)=>{ const [sx,sy]=rectBorder(p.x,p.y,NW,NH,cx,cy,2); const ex=cx+(p.x-cx)*.26, ey=cy+(p.y-cy)*.26; svg.append(s('path',{class:'hub-line',d:`M${sx},${sy} L${ex},${ey}`})); });
  const nodes=[]; const note=h('div',{class:'hub-note'});
  const sel=i=>{ nodes.forEach((g,j)=>g.classList.toggle('on',i===j)); const sp=b.spokes[i]; note.innerHTML=''; note.append(h('b',{text:sp.label}),' ',h('span',{html:im(sp.note||sp.sub||'')})); note.className='hub-note '+tc(sp.tone); };
  b.spokes.forEach((sp,i)=>{ const g=s('g',{class:'spoke '+tc(sp.tone),tabindex:'0',role:'button','aria-label':sp.label}); svgTile(g,pts[i].x,pts[i].y,NW,NH,sp);
    g.addEventListener('click',()=>sel(i)); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(i);} }); svg.append(g); nodes.push(g); });
  const c=b.center, cg=s('g',{class:'hub-c'}); cg.append(s('circle',{cx,cy,r:66}),sico(resolveIcon(c.label,c.sub,c.icon,null),cx-22,cy-48,44),s('text',{class:'hc-t',x:cx,y:cy+20,'text-anchor':'middle',text:trunc(c.label,17)}));
  if(c.sub) cg.append(s('text',{class:'hc-s',x:cx,y:cy+37,'text-anchor':'middle',text:trunc(c.sub,20)}));
  svg.append(cg);
  note.append(h('span',{class:'hint',text:T('Clique une branche pour voir le détail.')}));
  const body=h('div',null,h('div',{class:'svg-scroll'},svg),note);
  return fig('hub',b.title,body);
};

/* cycle */
BLOCKS.cycle=b=>{
  const n=b.items.length, W=760, H=n<=4?360:430, cx=W/2, cy=H/2, rx=n<=4?270:290, ry=n<=4?120:158, NW=172, NH=62;
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':b.title||T('Cycle')});
  const P=b.items.map((it,i)=>{ const a=-Math.PI/2+i*2*Math.PI/n; return {x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)}; });
  P.forEach((p,i)=>{ const q=P[(i+1)%n]; const [sx,sy]=rectBorder(p.x,p.y,NW,NH,q.x,q.y,5), [ex,ey]=rectBorder(q.x,q.y,NW,NH,p.x,p.y,7);
    const mx=(sx+ex)/2,my=(sy+ey)/2, ox=mx-cx, oy=my-cy, ol=Math.hypot(ox,oy)||1, k=26; const qx=mx+ox/ol*k, qy=my+oy/ol*k;
    const vx=ex-qx, vy=ey-qy, vl=Math.hypot(vx,vy)||1, ux=vx/vl, uy=vy/vl, hs=10;
    svg.append(s('path',{class:'cy-line',d:`M${sx},${sy} Q${qx},${qy} ${ex-ux*hs*.6},${ey-uy*hs*.6}`}),
      s('path',{class:'cy-ah',d:`M${ex},${ey} L${ex-ux*hs*1.3+uy*hs*.6},${ey-uy*hs*1.3-ux*hs*.6} L${ex-ux*hs*1.3-uy*hs*.6},${ey-uy*hs*1.3+ux*hs*.6}Z`})); });
  b.items.forEach((it,i)=>{ const g=s('g',{class:'spoke t-neutral'}); svgTile(g,P[i].x,P[i].y,NW,NH,it); g.append(s('circle',{class:'cy-n',cx:P[i].x-NW/2+2,cy:P[i].y-NH/2+2,r:10}),s('text',{class:'cy-nt',x:P[i].x-NW/2+2,y:P[i].y-NH/2+6,'text-anchor':'middle',text:i+1})); svg.append(g); });
  if(b.center) svg.append(s('text',{class:'cy-c',x:cx,y:cy+6,'text-anchor':'middle',text:trunc(b.center,18)}));
  return fig('cycle',b.title,h('div',{class:'svg-scroll'},svg),b.caption);
};

/* arbre générique (decision + tree) */
function leafCard(n,size){
  return h('div',{class:'leaf '+tc(n.tone)},ic(n,size||38),h('div',{class:'lf'},h('b',{text:n.a||n.label}),(n.why||n.sub)?h('small',{text:n.why||n.sub}):null));
}
function decNode(n,branch){
  const kid=(c,lab)=>h('div',{class:'kid'},h('span',{class:'br '+(lab==='Oui'?'y':'n'),text:lab==='Oui'?T('Oui'):T('Non')}),decNode(c));
  if(n.q) return h('div',{class:'dn'},h('div',{class:'dq'},h('span',{class:'qm',text:'?'}),h('span',{text:n.q})),h('div',{class:'kids'},kid(n.yes,'Oui'),kid(n.no,'Non')));
  return h('div',{class:'dn'},leafCard(n));
}
function fitTree(box){ const run=()=>{ const inner=box.firstElementChild; if(!inner) return; inner.style.zoom=''; const w=inner.scrollWidth, c=box.clientWidth; if(c>0&&w>c+1) inner.style.zoom=Math.max(.55,(c-2)/w).toFixed(3); };
  if('ResizeObserver' in window) new ResizeObserver(run).observe(box); setTimeout(run,0); return box; }
BLOCKS.decision=b=>fig('decision',b.title,fitTree(h('div',{class:'dtree'},decNode(b.root))),b.caption);
function treeNode(n){
  const me=h('div',{class:'tn '+tc(n.tone)},ic(n,34),h('div',{class:'lf'},h('b',{text:n.label}),n.sub?h('small',{text:n.sub}):null));
  const kids=n.children||[]; if(!kids.length) return h('div',{class:'dn'},me);
  return h('div',{class:'dn'},me,h('div',{class:'kids'},kids.map(c=>h('div',{class:'kid'},treeNode(c)))));
}
BLOCKS.tree=b=>fig('tree',b.title,fitTree(h('div',{class:'dtree'},treeNode(b.root))),b.caption);

/* matrix */
const MX_ICON={ok:'<svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg>',no:'<svg viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15"/></svg>',warn:'<svg viewBox="0 0 20 20"><path d="M10 5v6M10 14.5v.5"/></svg>',na:'<svg viewBox="0 0 20 20"><path d="M6 10h8"/></svg>'};
BLOCKS.matrix=b=>{
  const lg=Object.assign({ok:T('Autorisé / oui'),no:T('Refusé / non'),warn:T('Selon le cas'),na:T('Sans objet')},b.legend||{});
  const t=h('table',{class:'mx2'},h('thead',null,h('tr',null,h('th',null),b.cols.map(c=>h('th',{html:im(c)})))),
    h('tbody',null,b.rows.map((r,i)=>h('tr',null,h('th',{scope:'row',html:im(r)}),b.cells[i].map(v=>{ const k=String(v).toLowerCase();
      return MX_ICON[k]?h('td',null,h('span',{class:'mxc '+k,title:lg[k]||'',html:MX_ICON[k]})):h('td',null,h('span',{class:'mxc txt',html:im(v)})); })))));
  const used=new Set(); b.cells.flat().forEach(v=>{ if(MX_ICON[String(v).toLowerCase()]) used.add(String(v).toLowerCase()); });
  const leg=h('div',{class:'mx-leg'},[...used].map(k=>h('span',null,h('span',{class:'mxc '+k,html:MX_ICON[k]}),' '+(lg[k]||k))));
  return fig('matrix',b.title,h('div',null,h('div',{class:'tbl-wrap'},t),leg),b.caption);
};

/* cards */
BLOCKS.cards=b=>{
  const cols=Math.max(2,Math.min(4,b.cols||(b.items.length===4?2:3)));
  const g=h('div',{class:'cds c'+cols});
  b.items.forEach(it=>g.append(h('div',{class:'cd '+tc(it.tone)},aico(resolveIcon(it.t,it.d,it.icon,null),40),h('b',{text:it.t}),h('p',{html:im(it.d)}))));
  return fig('cards',b.title,g,b.caption);
};

/* facts */
BLOCKS.facts=b=>{
  const g=h('div',{class:'fcs f'+b.items.length});
  b.items.forEach(it=>g.append(h('div',{class:'fc'},aico(resolveIcon(it.label,it.sub,it.icon,null),36),h('div',{class:'big',text:it.big}),h('div',{class:'lb',text:it.label}),it.sub?h('small',{text:it.sub}):null)));
  return fig('facts',b.title,g,b.caption);
};

/* svc : services en jeu (rôle + pourquoi dans cette leçon) */
function svcCard(it,onlyOpen){
  const k=it.k, S=SVC[k]; const name=(S&&S.name)||T(KEYNAMES[k]||k);
  const card=h('button',{type:'button',class:'svc','aria-label':T('{name} : voir la fiche',{name})},aico(k,46),
    h('div',{class:'sv-t'},h('b',{text:name}),S&&S.tagline?h('small',{text:S.tagline}):null),
    it.ctx?h('p',{class:'sv-ctx'},h('span',{class:'ctx-l',text:T('Ici :')+' '}),it.ctx):null);
  card.addEventListener('click',()=>openService(k,it.ctx));
  return card;
}
BLOCKS.svc=b=>fig('svc',b.title||T('Services AWS en jeu dans cette leçon'),h('div',{class:'svcs'},b.items.map(it=>svcCard(it))),T('Clique un service pour sa fiche : rôle, pourquoi l\'utiliser, quand, et pièges d\'examen.'));
