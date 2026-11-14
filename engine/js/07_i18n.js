/* ===== Langues : liste, sélecteur, polices, RTL ===== */
const LANGS=[
  {c:'en',b:'EN',n:'English',e:'English'},{c:'el',b:'EL',n:'Ελληνικά',e:'Greek'},
  {c:'es',b:'ES',n:'Español',e:'Spanish'},{c:'uk',b:'UA',n:'Українська',e:'Ukrainian'},
  {c:'pt',b:'PT',n:'Português',e:'Portuguese'},{c:'ru',b:'RU',n:'Русский',e:'Russian'},
  {c:'fr',b:'FR',n:'Français',e:'French'},{c:'zh-CN',b:'简',n:'简体中文',e:'Chinese (Simplified)'},
  {c:'it',b:'IT',n:'Italiano',e:'Italian'},{c:'zh-TW',b:'繁',n:'繁體中文',e:'Chinese (Traditional)'},
  {c:'de',b:'DE',n:'Deutsch',e:'German'},{c:'ja',b:'JA',n:'日本語',e:'Japanese'},
  {c:'nl',b:'NL',n:'Nederlands',e:'Dutch'},{c:'ko',b:'KO',n:'한국어',e:'Korean'},
  {c:'pl',b:'PL',n:'Polski',e:'Polish'},{c:'hi',b:'HI',n:'हिन्दी',e:'Hindi'},
  {c:'tr',b:'TR',n:'Türkçe',e:'Turkish'},{c:'ar',b:'AR',n:'العربية',e:'Arabic'},
  {c:'id',b:'ID',n:'Bahasa Indonesia',e:'Indonesian'},{c:'vi',b:'VI',n:'Tiếng Việt',e:'Vietnamese'}
];
const LANG_BY=Object.fromEntries(LANGS.map(l=>[l.c,l]));
const RTL_LANGS=new Set(['ar']);
/* langues dont le contenu des leçons est traduit (les autres : interface traduite, contenu en anglais) */
const CONTENT_LANGS=new Set(window.I18N_CONTENT||['fr','en']);
function setLang(c){
  try{ localStorage.setItem('cloudsec-lang',c); }catch(e){}
  try{ sessionStorage.setItem('cloudsec-lang',c); }catch(e){}
  try{ window.name='cloudsec-lang:'+c; }catch(e){}
  location.reload();
}
function langPicker(){
  const cur=LANG_BY[LANG]||LANG_BY.en;
  const btn=h('button',{class:'chip-btn lang-btn',type:'button','aria-haspopup':'dialog','aria-expanded':'false','aria-label':T('Langue')+' : '+cur.n});
  btn.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/></svg><span>'+esc(cur.b)+'</span>';
  const panel=h('div',{class:'lang-panel',role:'dialog','aria-label':T('Langue'),hidden:''},h('div',{class:'lang-h',text:T('Langue')}),
    h('div',{class:'lang-grid'},LANGS.map(l=>{ const b=h('button',{type:'button',class:'lang-opt'+(l.c===LANG?' on':''),lang:l.c,onclick:()=>{ if(l.c===LANG){close();return;} setLang(l.c); }});
      b.innerHTML='<span class="lb">'+(l.c===LANG?'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg>':esc(l.b))+'</span><span class="ln"><b>'+esc(l.n)+'</b><i>'+esc(l.e)+'</i></span>'; return b; })),
    !CONTENT_LANGS.has(LANG)?h('p',{class:'lang-note',text:T('Interface traduite. Les leçons s\'affichent en anglais en attendant leur traduction.')}):null);
  const wrap=h('div',{class:'lang-wrap'},btn,panel);
  function open(){ panel.hidden=false; btn.setAttribute('aria-expanded','true'); setTimeout(()=>document.addEventListener('click',away,true),0); document.addEventListener('keydown',esc_); }
  function close(){ panel.hidden=true; btn.setAttribute('aria-expanded','false'); document.removeEventListener('click',away,true); document.removeEventListener('keydown',esc_); }
  const away=e=>{ if(!wrap.contains(e.target)) close(); }, esc_=e=>{ if(e.key==='Escape'){ close(); btn.focus(); } };
  btn.addEventListener('click',()=>panel.hidden?open():close());
  return wrap;
}
/* polices pour les écritures non latines (chargées à la demande) */
function loadLangFonts(){
  const FONT={ar:'Noto+Sans+Arabic:wght@400;600;700',hi:'Noto+Sans+Devanagari:wght@400;600;700',ja:'Noto+Sans+JP:wght@400;600;700',ko:'Noto+Sans+KR:wght@400;600;700','zh-CN':'Noto+Sans+SC:wght@400;600;700','zh-TW':'Noto+Sans+TC:wght@400;600;700',el:'Noto+Sans:wght@400;600;700',uk:'Noto+Sans:wght@400;600;700',ru:'Noto+Sans:wght@400;600;700',vi:'Noto+Sans:wght@400;600;700'};
  const f=FONT[LANG]; if(!f) return;
  const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://fonts.googleapis.com/css2?family='+f+'&display=swap'; document.head.appendChild(l);
}

/* RTL + contenu non traduit (anglais) : chaque bloc de texte prend la direction de sa propre langue */
if(RTL_LANGS.has(LANG) && !CONTENT_LANGS.has(LANG)){
  const INL=/^(B|I|CODE|EM|STRONG|SPAN|A|BR|SMALL|SUB|SUP)$/; let q=false;
  const run=()=>{ q=false; document.querySelectorAll('body *:not([dir])').forEach(el=>{ const t=el.tagName; if(t==='SVG'||t==='svg'||t==='SCRIPT'||t==='STYLE'||el.closest('svg')||el.closest('pre,code,.codeblk')) return;
      if(!el.textContent.trim()) return; if([...el.children].every(c=>INL.test(c.tagName))){ const cs=getComputedStyle(el); if(cs.display.indexOf('flex')<0&&cs.display.indexOf('grid')<0) el.setAttribute('dir','auto'); } }); };
  new MutationObserver(()=>{ if(!q){ q=true; requestAnimationFrame(run); } }).observe(document.documentElement,{childList:true,subtree:true});
}
