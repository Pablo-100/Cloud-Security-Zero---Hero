/* ===== Flow : diagramme de séquence animé ===== */
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
BLOCKS.flow=b=>{
  const actors=b.actors, n=actors.length, steps=b.steps;
  const W=Math.max(780,n*225), cw=W/n, ax=i=>cw*(i+.5);
  const idx={}; actors.forEach((a,i)=>idx[a.id]=i);
  const STEP=88, TOP=98, H=TOP+steps.length*STEP+20;
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':b.title||T('Flux')});
  /* lifelines */
  actors.forEach((a,i)=>svg.append(s('line',{class:'sv-life',x1:ax(i),x2:ax(i),y1:70,y2:H-6})));
  /* acteurs */
  actors.forEach((a,i)=>{
    const bw=Math.min(cw-24,215), x=ax(i)-bw/2, kind=KIND_ICON[a.kind]?a.kind:'generic';
    const g=s('g',{class:'sv-actor k-'+kind});
    g.append(s('rect',{x,y:8,width:bw,height:62,rx:12}),s('rect',{class:'kbar',x:x+10,y:8,width:bw-20,height:3,rx:1.5}),
      sico(resolveIcon(a.label,a.sub,a.icon,kind),x+10,21,36),
      s('text',{x:x+54,y:37,text:trunc(a.label,Math.floor((bw-62)/7.2))}),
      s('text',{class:'sub',x:x+54,y:55,text:trunc(a.sub||'',Math.floor((bw-62)/5.8))}));
    svg.append(g);
  });
  /* étapes */
  const gs=[];
  steps.forEach((st,k)=>{
    const y=TOP+k*STEP+40, i1=idx[st.from], i2=idx[st.to], x1=ax(i1), x2=ax(i2), self=i1===i2;
    const g=s('g',{class:'fstep'+(st.dashed?' dashed':'')+(st.tone?' '+st.tone:'')+' future','data-k':k,tabindex:'0',role:'button','aria-label':T('Étape {n} : {label}',{n:k+1,label:st.label})});
    const lo=Math.min(x1,x2)-cw*.45, wd=Math.abs(x2-x1)+cw*.9;
    g.append(s('rect',{x:self?x1-cw*.4:lo,y:y-44,width:self?cw*.9:wd,height:STEP-6,fill:'transparent'}));
    let label, ahp, line, lblNodes=[];
    if(!self){
      const dir=x2>x1?1:-1, xs=x1+dir*12, xe=x2-dir*2;
      line=s('line',{class:'sv-arrow',x1:xs,x2:xe-dir*8,y1:y,y2:y});
      ahp=s('path',{class:'ahp',d:`M${xe},${y} L${xe-dir*11},${y-5.5} L${xe-dir*11},${y+5.5}Z`});
      const max=Math.max(14,Math.floor((Math.abs(x2-x1)-8)/6.3)); const L=wrapText(st.label.replace(/^\s*\d+[.)]\s*/,''),max,2);
      L.forEach((t,j)=>lblNodes.push(s('text',{class:'sv-lbl',x:(x1+x2)/2,y:y-10-(L.length-1-j)*15,'text-anchor':'middle',text:t})));
    } else {
      const left=i1===n-1&&n>1, d=left?-1:1;
      line=s('path',{class:'sv-arrow',d:`M${x1+d*12},${y-7} C${x1+d*78},${y-24} ${x1+d*78},${y+24} ${x1+d*22},${y+8}`});
      ahp=s('path',{class:'ahp',d:`M${x1+d*12},${y+8} L${x1+d*23},${y+3} L${x1+d*23},${y+14}Z`});
      const room=left?x1-86:W-(x1+86); const max=Math.max(14,Math.floor(room/6.3)); const L=wrapText(st.label.replace(/^\s*\d+[.)]\s*/,''),max,3);
      L.forEach((t,j)=>lblNodes.push(s('text',{class:'sv-lbl',x:x1+d*84,y:y-2+(j-(L.length-1)/2)*15+4,'text-anchor':left?'end':'start',text:t})));
    }
    g.append(line,ahp,...lblNodes,s('circle',{class:'sv-num',cx:x1,cy:y,r:11}),s('text',{class:'sv-numt',x:x1,y:y+4,text:k+1}));
    svg.append(g); gs.push(g);
  });
  const pkt=s('circle',{class:'pkt',r:7,cx:-20,cy:-20,opacity:0}); svg.append(pkt);

  /* UI */
  const bPrev=h('button',{type:'button',text:'◀','aria-label':T('Étape précédente')}), bNext=h('button',{type:'button',text:'▶','aria-label':T('Étape suivante')}),
        bPlay=h('button',{type:'button',class:'primary',text:T('Lecture')}), bReset=h('button',{type:'button',text:T('Début'),'aria-label':T('Revenir au début')}), cnt=h('span',{class:'cnt'});
  const head=h('div',{class:'diag-head'},h('span',{class:'dt'},figTag(),T('Flux animé · {title}',{title:b.title||''})),h('div',{class:'ctl'},bReset,bPrev,bPlay,bNext,cnt));
  const stepT=h('div',{class:'step-t'}), stepD=h('div',{class:'step-d'}), stepDj=h('div',{class:'derja',style:'margin-top:10px'});
  const plBox=h('div',{class:'payload'});
  const body=h('div',{class:'diag-body'},h('div',null,stepT,stepD,stepDj),plBox);
  /* vue Réseau isométrique (pairs d'acteurs fusionnés) */
  const pairs={}, pairList=[]; steps.forEach((st,k)=>{ if(st.from===st.to) return; const pk=st.from+'>'+st.to; if(!pairs[pk]){ pairs[pk]={id:'p'+pairList.length,from:st.from,to:st.to,style:st.dashed?'dashed':null}; pairList.push(pairs[pk]); } st._pid=pairs[pk].id; });
  const iso=isoScene({title:b.title,nodes:isoLayoutLine(actors),edges:pairList});
  const scroll=h('div',{class:'svg-scroll seq-view'},svg); let vIdx=b._seqOnly?1:0;
  const setView=i=>{ vIdx=i; scroll.style.display=i===1?'':'none'; iso.el.style.display=i===0?'':'none'; if(i===0) isoShow(false); };
  const tog=viewToggle([{label:T('Réseau'),icon:'net'},{label:T('Séquence'),icon:'seq'}],setView);
  if(!b._seqOnly) head.prepend(tog);
  const root=h('div',{class:'diag'},head,b.intro?h('div',{class:'diag-intro',html:im(b.intro)}):null,b._seqOnly?null:iso.el,scroll,body);
  function isoShow(anim){ const st=steps[cur]; iso.show(st._pid?[st._pid]:[],[st.from,st.to],st.label.replace(/^\s*\d+[.)]\s*/,''),anim); }

  let cur=0, timer=null, raf=null;
  function animate(k){
    if(raf) cancelAnimationFrame(raf); const st=steps[k], i1=idx[st.from], i2=idx[st.to]; const y=TOP+k*STEP+40;
    pkt.setAttribute('class','pkt '+(st.tone||'')); if(REDUCED||i1===i2){ pkt.setAttribute('opacity',0); return; }
    const x1=ax(i1)+(i2>i1?12:-12), x2=ax(i2)+(i2>i1?-14:14), t0=performance.now(), D=700; pkt.setAttribute('cy',y); pkt.setAttribute('opacity',1);
    const tick=t=>{ const p=Math.min(1,(t-t0)/D), e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2; pkt.setAttribute('cx',x1+(x2-x1)*e);
      if(p<1) raf=requestAnimationFrame(tick); else { pkt.setAttribute('opacity',0); } };
    raf=requestAnimationFrame(tick);
  }
  function render(anim){
    gs.forEach((g,i)=>{ const base=g.getAttribute('class').replace(/\b(cur|past|future)\b/g,'').trim(); g.setAttribute('class',base+' '+(i===cur?'cur':i<cur?'past':'future')); });
    const st=steps[cur]; stepT.textContent=(cur+1)+'. '+st.label.replace(/^\s*\d+[.)]\s*/,''); stepD.innerHTML=md(st.detail);
    stepDj.style.display=st.derja?'':'none'; stepDj.innerHTML=st.derja?'<span class="lbl">'+T('DERJA')+'</span><div>'+im(st.derja)+'</div>':'';
    plBox.innerHTML='';
    if(st.payload){ plBox.append(h('h5',{text:T('Décodage · {title}',{title:st.payload.title})}));
      st.payload.fields.forEach((f,fi)=>{ const row=h('div',{class:'row'+(fi===0?' on':'')},h('div',{class:'k',text:f.k}),h('div',{class:'v',text:f.v}),f.note?h('div',{class:'nt',html:im(f.note)}):null);
        row.addEventListener('click',()=>{ plBox.querySelectorAll('.row').forEach(r=>r.classList.remove('on')); row.classList.add('on'); }); plBox.append(row); });
    } else plBox.append(h('div',{class:'empty-pl',text:T('Pas de message détaillé à cette étape.')}));
    bPrev.disabled=cur===0; bNext.disabled=cur===steps.length-1; cnt.textContent=(cur+1)+' / '+steps.length;
    bPlay.textContent=timer?T('Pause'):(cur===steps.length-1?T('Rejouer'):T('Lecture'));
    if(anim) animate(cur);
    if(vIdx===0) isoShow(anim);
  }
  function stop(){ if(timer){clearInterval(timer);timer=null;} }
  function go(k,anim){ cur=Math.max(0,Math.min(steps.length-1,k)); render(anim!==false); }
  bNext.addEventListener('click',()=>{stop();go(cur+1);}); bPrev.addEventListener('click',()=>{stop();go(cur-1);});
  bReset.addEventListener('click',()=>{stop();go(0,false);});
  bPlay.addEventListener('click',()=>{ if(timer){stop();render(false);return;} if(cur===steps.length-1) go(0);
    timer=setInterval(()=>{ if(cur>=steps.length-1){stop();render(false);return;} go(cur+1); },3000); render(true); });
  gs.forEach((g,i)=>{ g.addEventListener('click',()=>{stop();go(i);}); g.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();stop();go(i);} }); });
  scroll.style.display=b._seqOnly?'':'none'; render(false);
  return sec(null,root);
};

/* ===== Arch : architecture groupée, pas-à-pas ===== */
BLOCKS.arch=b=>{
  const MC=Math.max(...b.groups.map(g=>g.col));
  const GW=MC>=3?215:MC===2?250:268, NW=GW-(MC>=3?27:32), NH=60,NG=12,HEAD=40,PADB=14,GX=MC>=3?62:60,GY=38,M=14;
  const groups=b.groups.map(g=>Object.assign({},g)); const nodes={}, nOrder=[];
  let maxCol=0,maxRow=0; groups.forEach(g=>{maxCol=Math.max(maxCol,g.col);maxRow=Math.max(maxRow,g.row); g.h=HEAD+g.nodes.length*NH+(g.nodes.length-1)*NG+PADB;});
  const rowH=[]; for(let r=0;r<=maxRow;r++) rowH[r]=Math.max(0,...groups.filter(g=>g.row===r).map(g=>g.h));
  const rowY=[]; let yy=M; for(let r=0;r<=maxRow;r++){rowY[r]=yy; yy+=rowH[r]+GY;}
  const W=M*2+(maxCol+1)*GW+maxCol*GX, H=yy-GY+M;
  groups.forEach(g=>{ g.x=M+g.col*(GW+GX); g.y=rowY[g.row]; g.nodes.forEach((n,i)=>{ n._g=g; n.x=g.x+(GW-NW)/2; n.y=g.y+HEAD+i*(NH+NG); n.cx=n.x+NW/2; n.cy=n.y+NH/2; nodes[n.id]=n; nOrder.push(n); }); });
  const svg=s('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':b.title||T('Architecture'),style:'min-width:'+Math.min(W,900)+'px'});
  groups.forEach(g=>{ const k=g.kind||'generic'; const gg=s('g',{class:'g-'+k});
    gg.append(s('rect',{class:'g-rect',x:g.x,y:g.y,width:GW,height:g.h,rx:14}),s('text',{class:'g-title',x:g.x+14,y:g.y+25,text:trunc(g.label,Math.floor((GW-24)/7))})); svg.append(gg); });
  /* edges */
  const pairCount={}, pairSeen={}; b.edges.forEach(e=>{const k=[e.from,e.to].sort().join('|'); pairCount[k]=(pairCount[k]||0)+1;});
  function border(n,tx,ty){ const dx=tx-n.cx, dy=ty-n.cy; if(!dx&&!dy) return [n.cx,n.cy]; const sc=Math.min((NW/2+3)/Math.abs(dx||1e-6),(NH/2+3)/Math.abs(dy||1e-6)); return [n.cx+dx*sc,n.cy+dy*sc]; }
  const eg=[], edgeMap={};
  b.edges.forEach((e,ei)=>{
    const A=nodes[e.from], B=nodes[e.to]; const key=[e.from,e.to].sort().join('|'); const k=(pairSeen[key]=(pairSeen[key]||0)+1)-1, m=pairCount[key];
    let cx,cy; const dx=B.cx-A.cx, dy=B.cy-A.cy, len=Math.hypot(dx,dy)||1;
    if(Math.abs(dx)<20){ const adj=Math.abs(dy)<=NH+NG+4; const side=(A._g.col===maxCol&&maxCol>0)?-1:1;
      if(adj&&m===1){ cx=(A.cx+B.cx)/2; cy=(A.cy+B.cy)/2; } else { cx=A.cx+side*(NW/2+34+k*26); cy=(A.cy+B.cy)/2; } }
    else { const off=(k-(m-1)/2)*60 + (Math.abs(dy)<8?0:Math.sign(dx)*8)+ (Math.abs(dy)<10&&m===1?0:0); const px=-dy/len, py=dx/len; cx=(A.cx+B.cx)/2+px*off; cy=(A.cy+B.cy)/2+py*off; if(m===1&&Math.abs(dy)>=10){cx+=px*.06*len;cy+=py*.06*len;} }
    const [sx,sy]=border(A,cx,cy), [ex0,ey0]=border(B,cx,cy);
    const vx=ex0-cx, vy=ey0-cy, vl=Math.hypot(vx,vy)||1, ux=vx/vl, uy=vy/vl;
    const ex=ex0-ux*9, ey=ey0-uy*9;
    const cls='edge'+(e.style==='dashed'?' dashed':'')+(e.style==='deny'?' deny':'');
    const g=s('g',{class:cls,'data-id':e.id});
    g.append(s('path',{class:'e-line',d:`M${sx},${sy} Q${cx},${cy} ${ex},${ey}`}));
    const hs=9; g.append(s('path',{class:e.style==='deny'?'ah-d':'ah-n',d:`M${ex0},${ey0} L${ex0-ux*hs*1.2+uy*hs*.55},${ey0-uy*hs*1.2-ux*hs*.55} L${ex0-ux*hs*1.2-uy*hs*.55},${ey0-uy*hs*1.2+ux*hs*.55}Z`,'data-ah':1}));
    const mx=.25*sx+.5*cx+.25*ex, my=.25*sy+.5*cy+.25*ey;
    if(e.style==='deny') g.append(s('path',{class:'x-mark',d:`M${mx-6},${my-6} L${mx+6},${my+6} M${mx+6},${my-6} L${mx-6},${my+6}`}));
    if(e.label){ const L=wrapText(e.label,GX<70?20:26,2); L.forEach((t,j)=>g.append(s('text',{class:'e-lbl','text-anchor':'middle',x:mx,y:(m>1&&k>=m/2)?my+16+j*13:my-(e.style==='deny'?12:6)-(L.length-1-j)*13,text:t}))); }
    svg.append(g); eg.push({e,g}); edgeMap[e.id]={e,g};
  });
  /* nodes */
  const ng={};
  nOrder.forEach(n=>{ const g=s('g',{class:'node'}); const cpl=Math.floor((NW-62)/6.7); const L=wrapText(n.label,cpl,2); const two=L.length>1;
    g.append(s('title',{text:n.label+(n.sub?' · '+n.sub:'')}),s('rect',{class:'n-rect',x:n.x,y:n.y,width:NW,height:NH,rx:10}),
      sico(resolveIcon(n.label,n.sub,n.icon,null),n.x+10,n.y+(NH-34)/2,34));
    L.forEach((ln,j)=>g.append(s('text',{class:'n-t',x:n.x+54,y:n.y+(n.sub?(two?20:25):(two?27:35))+j*14,text:ln})));
    if(n.sub) g.append(s('text',{class:'n-s',x:n.x+54,y:n.y+(two?52:44),text:trunc(n.sub,Math.floor((NW-64)/5.6))}));
    svg.append(g); ng[n.id]=g; });
  /* UI */
  const steps=b.steps||[]; let cur=-1,timer=null;
  const cap=h('div',{class:'step-d'}), capT=h('div',{class:'step-t'});
  const bPrev=h('button',{type:'button',text:'◀','aria-label':T('Étape précédente')}),bNext=h('button',{type:'button',text:'▶','aria-label':T('Étape suivante')}),
        bAll=h('button',{type:'button',text:T('Vue d\'ensemble')}),bPlay=h('button',{type:'button',class:'primary',text:T('Lecture')}),cnt=h('span',{class:'cnt'});
  const head=h('div',{class:'diag-head'},h('span',{class:'dt'},figTag(),T('Architecture · {title}',{title:b.title||''})),steps.length?h('div',{class:'ctl'},bAll,bPrev,bPlay,bNext,cnt):null);
  let render=function(){
    if(cur<0||!steps.length){ eg.forEach(x=>{x.g.classList.remove('dim','hl');}); Object.values(ng).forEach(g=>g.classList.remove('dim','hl'));
      capT.textContent=steps.length?T('Vue d\'ensemble'):''; cap.innerHTML=steps.length?'<span style="color:var(--mute)">'+T('Clique ▶ ou « Lecture » pour dérouler l\'architecture étape par étape.')+'</span>':''; }
    else { const st=steps[cur]; const el=new Set(st.edges||[]), nl=new Set(st.nodes||[]); el.forEach(id=>{const x=edgeMap[id]; if(x){nl.add(x.e.from);nl.add(x.e.to);}});
      eg.forEach(x=>{ const on=el.has(x.e.id); x.g.classList.toggle('hl',on); x.g.classList.toggle('dim',!on); const ah=x.g.querySelector('[data-ah]'); if(ah&&x.e.style!=='deny') ah.setAttribute('class',on?'ah-a':'ah-n'); });
      Object.keys(ng).forEach(id=>{ ng[id].classList.toggle('hl',nl.has(id)); ng[id].classList.toggle('dim',!nl.has(id)); });
      capT.textContent=T('Étape {n} / {m}',{n:cur+1,m:steps.length}); cap.innerHTML=md(st.caption); }
    bPrev.disabled=cur<0; bNext.disabled=cur>=steps.length-1; cnt.textContent=cur<0?'—':(cur+1)+' / '+steps.length;
    bPlay.textContent=timer?T('Pause'):(cur>=steps.length-1&&cur>=0?T('Rejouer'):T('Lecture'));
  }
  const stop=()=>{if(timer){clearInterval(timer);timer=null;}};
  bNext.addEventListener('click',()=>{stop();cur=Math.min(steps.length-1,cur+1);render();}); bPrev.addEventListener('click',()=>{stop();cur=Math.max(-1,cur-1);render();});
  bAll.addEventListener('click',()=>{stop();cur=-1;render();});
  bPlay.addEventListener('click',()=>{ if(timer){stop();render();return;} if(cur>=steps.length-1) cur=-1; cur++; render();
    timer=setInterval(()=>{ if(cur>=steps.length-1){stop();render();return;} cur++; render(); },3200); render(); });
  render();
  const lay=isoLayoutGroups(b.groups); const iso=isoScene({title:b.title,nodes:lay.nodes,groups:lay.groups,edges:b.edges});
  const scroll=h('div',{class:'svg-scroll'},svg); iso.el.style.display='none'; let vIdx=0;
  const setView=i=>{ vIdx=i; scroll.style.display=i===0?'':'none'; iso.el.style.display=i===1?'':'none'; if(seqEl) seqEl.style.display=i===2?'':'none'; const hd=head.querySelectorAll(':scope>.ctl'); hd.forEach(x=>x.style.display=i===2?'none':''); const bd=root.querySelector(':scope>.diag-body'); if(bd) bd.style.display=i===2?'none':''; isoRefresh(false); };
  /* séquence dérivée des étapes */
  let seqEl=null; const nById={}; b.groups.forEach(g=>g.nodes.forEach(n=>nById[n.id]=n));
  const seqSteps=[]; (b.steps||[]).forEach(st=>(st.edges||[]).forEach((id,j)=>{ const e=b.edges.find(x=>x.id===id); if(e&&e.from!==e.to) seqSteps.push({from:e.from,to:e.to,label:e.label||(nById[e.from].label+' → '+nById[e.to].label),detail:j===0?st.caption:'',tone:e.style==='deny'?'bad':null,dashed:e.style==='dashed'}); }));
  const views=[{label:T('Architecture'),icon:'arch'},{label:T('Réseau'),icon:'net'}];
  if(seqSteps.length>=2){ const used=[...new Set(seqSteps.flatMap(x=>[x.from,x.to]))]; const actors=used.map(id=>({id,label:nById[id].label,sub:nById[id].sub,kind:nById[id].kind,icon:nById[id].icon}));
    const keep=FIG.n; seqEl=BLOCKS.flow({actors,steps:seqSteps.map((x,i)=>Object.assign({},x,{detail:x.detail||' '})),title:b.title,_seqOnly:true}); FIG.n=keep; seqEl.style.display='none'; seqEl.classList.add('seq-embed'); views.push({label:T('Séquence'),icon:'seq'}); }
  const tog=viewToggle(views,i=>setView(i)); head.prepend(tog);
  function isoRefresh(anim){ if(vIdx!==1) return; if(cur<0||!steps.length){ iso.show([],[],'',false); return; } const st=steps[cur]; const ids=st.edges||[]; const e0=ids.length&&b.edges.find(x=>x.id===ids[0]); iso.show(ids,st.nodes||[],e0&&e0.label||'',anim); }
  const _render=render; render=function(){ _render(); isoRefresh(true); };
  render();
  const root=h('div',{class:'diag'},head,scroll,iso.el,seqEl,steps.length?h('div',{class:'diag-body',style:'grid-template-columns:1fr'},h('div',null,capT,cap)):null);
  return sec(null,root);
};
