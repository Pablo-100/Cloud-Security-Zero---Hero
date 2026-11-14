/* ===== Vue « Réseau » isométrique (comme protocol-explorer) =====
   isoScene({nodes:[{id,label,sub,icon,gx,gy}], groups:[{label,kind,gx,gy,size}], edges:[{id,from,to,label,style}]})
   -> {el, show(edgeIds, nodeIds, label, anim)} */
const ISO={TW:132,TH:66};
const isoP=(gx,gy)=>[(gx-gy)*ISO.TW/2,(gx+gy)*ISO.TH/2];
function isoDiamond(cx,cy,hw,hh){ return `M${cx},${cy-hh} L${cx+hw},${cy} L${cx},${cy+hh} L${cx-hw},${cy}Z`; }
function isoScene(o){
  const nodes=o.nodes, groups=o.groups||[], edges=o.edges;
  const byId={}; nodes.forEach(n=>{ const [x,y]=isoP(n.gx,n.gy); n.x=x; n.y=y; byId[n.id]=n; });
  groups.forEach(g=>{ const [x,y]=isoP(g.gx+g.size/2,g.gy+g.size/2); g.x=x; g.y=y; });
  /* limites */
  let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
  const grow=(a,b,c,d)=>{x0=Math.min(x0,a);x1=Math.max(x1,b);y0=Math.min(y0,c);y1=Math.max(y1,d);};
  nodes.forEach(n=>grow(n.x-78,n.x+78,n.y-82,n.y+62));
  groups.forEach(g=>grow(g.x-g.size*ISO.TW/2-8,g.x+g.size*ISO.TW/2+8,g.y-g.size*ISO.TH/2-8,g.y+g.size*ISO.TH/2+26));
  const M=24, W=x1-x0+2*M, H=y1-y0+2*M, ox=-x0+M, oy=-y0+M;
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':o.title||T('Réseau'),class:'iso-svg'});
  const defs=s('defs'); defs.append(
    s('marker',{id:'iso-ah',viewBox:'0 0 10 10',refX:'9',refY:'5',markerWidth:'7',markerHeight:'7',orient:'auto-start-reverse'},s('path',{d:'M0,0 L10,5 L0,10z',class:'iso-ahp'}))); svg.append(defs);
  const G=s('g',{transform:`translate(${ox},${oy})`}); svg.append(G);
  /* zones */
  groups.slice().sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy)).forEach(g=>{
    const hw=g.size*ISO.TW/2, hh=g.size*ISO.TH/2, k=g.kind||'generic';
    const gg=s('g',{class:'iso-zone z-'+k});
    gg.append(s('path',{class:'iso-zone-top',d:isoDiamond(g.x,g.y,hw,hh)}), s('path',{class:'iso-zone-edge',d:`M${g.x-hw},${g.y} L${g.x},${g.y+hh} L${g.x+hw},${g.y}`,transform:'translate(0,7)'}));
    const lbl=wrapText(g.label,24,1)[0]; gg.append(s('text',{class:'iso-zone-t',x:g.x,y:g.y+hh+20,'text-anchor':'middle',text:lbl}));
    G.append(gg); });
  /* plateformes (ordre de profondeur) */
  const order=nodes.slice().sort((a,b)=>(a.gx+a.gy)-(b.gx+b.gy));
  const plat={};
  order.forEach(n=>{ const hw=ISO.TW*.4, hh=ISO.TH*.4, d=9, g=s('g',{class:'iso-node'});
    g.append(s('title',{text:n.label+(n.sub?' · '+n.sub:'')}),
      s('path',{class:'iso-side l',d:`M${n.x-hw},${n.y} L${n.x},${n.y+hh} L${n.x},${n.y+hh+d} L${n.x-hw},${n.y+d}Z`}),
      s('path',{class:'iso-side r',d:`M${n.x+hw},${n.y} L${n.x},${n.y+hh} L${n.x},${n.y+hh+d} L${n.x+hw},${n.y+d}Z`}),
      s('path',{class:'iso-top',d:isoDiamond(n.x,n.y,hw,hh)}),
      s('line',{class:'iso-stem',x1:n.x,y1:n.y-2,x2:n.x,y2:n.y-26}));
    G.append(g); plat[n.id]=g; });
  /* liens */
  const eg={}, pairN={}, pairI={};
  edges.forEach(e=>{ const k=[e.from,e.to].sort().join('|'); pairN[k]=(pairN[k]||0)+1; });
  edges.forEach(e=>{
    const A=byId[e.from], B=byId[e.to]; if(!A||!B) return;
    const k=[e.from,e.to].sort().join('|'), i=(pairI[k]=(pairI[k]||0)+1)-1, m=pairN[k];
    let dx=B.x-A.x, dy=B.y-A.y, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L, px=-uy, py=ux;
    const off=(i-(m-1)/2)*16 + (e.from>e.to?0:0);
    const sx=A.x+ux*34+px*off, sy=A.y+uy*20+py*off*.5, ex=B.x-ux*38+px*off, ey=B.y-uy*22+py*off*.5;
    const self=e.from===e.to;
    const g=s('g',{class:'iso-edge'+(e.style==='dashed'?' dashed':'')+(e.style==='deny'?' deny':''),'data-id':e.id});
    let d;
    if(self){ d=`M${A.x+26},${A.y-6} C${A.x+90},${A.y-44} ${A.x+90},${A.y+30} ${A.x+30},${A.y+8}`; }
    else { const mx=(sx+ex)/2+px*(m>1?0:L*.04), my=(sy+ey)/2+py*(m>1?0:L*.04)-L*.03; d=`M${sx},${sy} Q${mx},${my} ${ex},${ey}`; }
    const path=s('path',{class:'iso-line',d,'marker-end':'url(#iso-ah)'}); g.append(path);
    G.append(g); eg[e.id]={g,path,e,A,B};
  });
  /* icônes + libellés (au-dessus) */
  order.forEach(n=>{
    const g=s('g',{class:'iso-icon'}), L=wrapText(n.label,17,2);
    g.append(s('rect',{class:'iso-halo',x:n.x-27,y:n.y-76,width:54,height:54,rx:14}), sico(resolveIcon(n.label,n.sub,n.icon,null),n.x-22,n.y-72,44));
    L.forEach((t,j)=>g.append(s('text',{class:'iso-t',x:n.x,y:n.y+hhOff()+16+j*13,'text-anchor':'middle',text:t})));
    if(n.sub) g.append(s('text',{class:'iso-s',x:n.x,y:n.y+hhOff()+16+L.length*13,'text-anchor':'middle',text:trunc(n.sub,24)}));
    G.append(g); n._g=g; });
  function hhOff(){ return ISO.TH*.4+8; }
  /* étiquette de l'étape courante + paquet */
  const lab=s('g',{class:'iso-lab',opacity:0}); const labR=s('rect',{rx:9,height:24}), labT=s('text',{'text-anchor':'middle'}); lab.append(labR,labT); G.append(lab);
  const pkt=s('circle',{class:'iso-pkt',r:6,cx:-30,cy:-30,opacity:0}); G.append(pkt);
  let raf=null;
  function show(edgeIds,nodeIds,label,anim){
    const on=new Set(edgeIds||[]), nl=new Set(nodeIds||[]);
    on.forEach(id=>{ const x=eg[id]; if(x){nl.add(x.e.from);nl.add(x.e.to);} });
    const any=on.size>0;
    Object.keys(eg).forEach(id=>{ const x=eg[id]; x.g.classList.toggle('hl',on.has(id)); x.g.classList.toggle('dim',any&&!on.has(id)); });
    nodes.forEach(n=>{ const hl=nl.has(n.id), dim=any&&!hl; n._g.classList.toggle('dim',dim); n._g.classList.toggle('hl',hl); plat[n.id].classList.toggle('dim',dim); plat[n.id].classList.toggle('hl',hl); });
    if(raf) cancelAnimationFrame(raf);
    pkt.setAttribute('opacity',0); lab.setAttribute('opacity',0);
    const first=[...on][0]; if(!first||!eg[first]) return; const x=eg[first], path=x.path, len=path.getTotalLength();
    if(label){ const t=trunc(label,44); labT.textContent=t; const w=t.length*6.6+22; 
      labR.setAttribute('width',w); labR.setAttribute('x',-w/2); labR.setAttribute('y',-17); labT.setAttribute('y',0); labT.setAttribute('dy','.32em');
      lab.setAttribute('transform',`translate(${(x0+x1)/2},${y0-6})`); lab.setAttribute('opacity',1); }
    if(!anim||REDUCED||!len) return;
    const t0=performance.now(), D=900; pkt.setAttribute('opacity',1);
    const tick=t=>{ const p=Math.min(1,(t-t0)/D), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2, pt=path.getPointAtLength(len*e); pkt.setAttribute('cx',pt.x); pkt.setAttribute('cy',pt.y);
      if(p<1) raf=requestAnimationFrame(tick); else pkt.setAttribute('opacity',0); };
    raf=requestAnimationFrame(tick);
  }
  const el=h('div',{class:'iso-wrap'},svg);
  return {el,show};
}

/* Disposition automatique : acteurs d'un flux (zigzag horizontal) */
function isoLayoutLine(actors){
  return actors.map((a,i)=>{ const S=i*2.35, T=(i%2?1.9:0); return {id:a.id,label:a.label,sub:a.sub,icon:a.icon,kind:a.kind,gx:(S+T)/2,gy:(T-S)/2}; });
}
/* Disposition automatique : groupes d'une architecture */
function isoLayoutGroups(groups){
  const dims=g=>{ const m=g.nodes.length; return m===1?{size:2.6,slots:[[1.3,1.3]]}: m===2?{size:2.7,slots:[[2.0,.7],[.7,2.0]]}: m===3?{size:2.9,slots:[[.8,.8],[2.1,.8],[.8,2.1]].map(([a,b],i)=>i===0?[1.45,.7]:i===1?[2.2,1.45]:[.7,1.45])}:
    (()=>{ const k=Math.ceil(Math.sqrt(m)), p=1.55; return {size:k*p+.2,slots:Array.from({length:m},(_,i)=>[.85+(i%k)*p,.85+Math.floor(i/k)*p])}; })(); };
  const info=groups.map(g=>Object.assign({g},dims(g))); const cell=Math.max(...info.map(i=>i.size))+1.5;
  const nodes=[], zs=[];
  info.forEach(({g,size,slots})=>{ const gx=g.col*cell, gy=g.row*cell; zs.push({label:g.label,kind:g.kind,gx,gy,size});
    g.nodes.forEach((n,i)=>nodes.push({id:n.id,label:n.label,sub:n.sub,icon:n.icon,kind:n.kind,gx:gx+slots[i][0],gy:gy+slots[i][1]})); });
  return {nodes,groups:zs};
}

/* Bascule Réseau / Séquence (pastille comme dans l'exemple) */
function viewToggle(views,onPick){
  const wrap=h('div',{class:'vtoggle',role:'tablist'});
  const ICON={net:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/></svg>',
    seq:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5h14M5 12h14M5 19h14"/><path d="M8 5l-3 7 3 7M16 5l3 7-3 7" opacity=".0"/><circle cx="5" cy="5" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/><circle cx="5" cy="19" r="1.6" fill="currentColor"/></svg>',
    arch:'<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="8.5" y="14" width="7" height="7" rx="1.5"/></svg>'};
  const btns=views.map((v,i)=>{ const b=h('button',{type:'button',role:'tab','aria-selected':i===0?'true':'false',class:i===0?'on':''}); b.innerHTML=(ICON[v.icon]||'')+'<span>'+esc(v.label)+'</span>';
    b.addEventListener('click',()=>{ btns.forEach((x,j)=>{x.classList.toggle('on',j===i);x.setAttribute('aria-selected',j===i?'true':'false');}); onPick(i); }); wrap.append(b); return b; });
  return wrap;
}
