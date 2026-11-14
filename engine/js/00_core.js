'use strict';
/* ===== i18n : dictionnaires { langue: { hash53(texte français): traduction } } ===== */
const I18N = window.I18N_DATA || {};
function h53(str){ let h1=0xdeadbeef, h2=0x41c6ce57; for(let i=0,ch;i<str.length;i++){ ch=str.charCodeAt(i); h1=Math.imul(h1^ch,2654435761); h2=Math.imul(h2^ch,1597334677); }
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909); h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909); return 4294967296*(2097151&h2)+(h1>>>0); }
const _K=new Map(); const i18nKey=s=>{ let k=_K.get(s); if(k===undefined){ k=h53(s).toString(36); _K.set(s,k); } return k; };
function detectLang(){
  let c=null; try{ c=localStorage.getItem('cloudsec-lang'); }catch(e){} if(!c){ try{ c=sessionStorage.getItem('cloudsec-lang'); }catch(e){} } if(!c){ const m=/cloudsec-lang:([\w-]+)/.exec(window.name||''); if(m) c=m[1]; }
  if(!c){ const nl=((navigator.languages&&navigator.languages[0])||navigator.language||'en').replace('_','-'); const lc=nl.toLowerCase();
    c = lc.startsWith('zh') ? (/tw|hk|mo|hant/.test(lc)?'zh-TW':'zh-CN') : lc.slice(0,2); if(c==='iw') c='he'; if(c==='in') c='id'; }
  return (c==='fr'||I18N[c])?c:'en';
}
let LANG = detectLang();
document.documentElement.lang = LANG; document.documentElement.dir = (LANG==='ar')?'rtl':'ltr';
const T=(s,p)=>{ let r=s; if(LANG!=='fr'){ const k=i18nKey(s), d=I18N[LANG], e=I18N.en; r=(d&&d[k])||(e&&e[k])||s; } if(p) r=r.replace(/\{(\w+)\}/g,(m,k)=>p[k]!=null?p[k]:m); return r; };
/* traduit le contenu (leçons, services) : mêmes règles que tools/i18n_extract.py */
const I18N_KEEP=new Set(['derja','icon','id','type','kind','from','to','nodes','edges','style','services','part','emoji','lines','raw','tone','col','row','match','cat','related','level','minutes','core','center_icon','hint','corr','ans','answer','correct','d_icon','lang','bold']);
function l10n(o){
  if(LANG==='fr') return o;
  const d=I18N[LANG], e=I18N.en;
  const tr=s=>{ const k=i18nKey(s); return (d&&d[k])||(e&&e[k])||s; };
  const walk=x=>{ if(Array.isArray(x)) return x.map(walk); if(x&&typeof x==='object'){ if(x.type==='derja') return x; const r={}; for(const k in x){ const v=x[k]; r[k]=(I18N_KEEP.has(k)&&!(v&&typeof v==='object'&&(!Array.isArray(v)||v.some(q=>q&&typeof q==='object'&&!Array.isArray(q)))))?v:walk(v); } return r; } return typeof x==='string'?tr(x):x; };
  return walk(o);
}
/* ===== Données ===== */
/* TK : marqueur de clé i18n pour les constantes de niveau module (valeur française conservée ; T() appliqué à l'affichage) */
function TK(s){ return s; }
const DATA = l10n(window.COURSE_DATA || []);
const SERVICE_DATA = l10n(window.SERVICE_DATA || []);
const PARTS = [
  {id:'ch1', num:'CH1', color:'#ED7100', icon:'cloudformation', title:TK('Introduction à la sécurité cloud'), sub:TK('Cloud, risques, responsabilité partagée, conformité'), core:true,
   desc:TK('Les fondations : ce qu\'est le cloud, ce qu\'on protège, qui est responsable de quoi.')},
  {id:'ch2a', num:'CH2·A', color:'#8C4FFF', icon:'saml', title:TK('IAM : identité, fédération, standards'), sub:TK('SAML, SCIM, OAuth, OIDC, RBAC/ABAC, Zero Trust'), core:true,
   desc:TK('Les concepts et protocoles qui disent QUI a le droit de faire QUOI, indépendamment d\'AWS.')},
  {id:'ch2b', num:'CH2·B', color:'#DD344C', icon:'iam', title:TK('AWS IAM, STS & fédération'), sub:TK('Policies, SCP, AssumeRole, Identity Center, Cognito'), core:true,
   desc:TK('Les mêmes idées appliquées à AWS : policies, évaluation, rôles, fédération.')},
  {id:'d1', num:'SCS·1', color:'#E7157B', icon:'guardduty', title:TK('AWS Security : Détection'), sub:TK('GuardDuty, CloudTrail, CloudWatch, Macie…'), core:false, desc:TK('Voir ce qui se passe : logs, alertes, détection de menaces.')},
  {id:'d2', num:'SCS·2', color:'#ED7100', icon:'incidentmgr', title:TK('AWS Security : Réponse aux incidents'), sub:TK('Playbooks, Systems Manager, EC2 compromises'), core:false, desc:TK('Quand ça casse : contenir, investiguer, restaurer.')},
  {id:'d3', num:'SCS·3', color:'#8C4FFF', icon:'waf', title:TK('AWS Security : Infrastructure & réseau'), sub:TK('VPC, endpoints, WAF, Shield, CloudFront…'), core:false, desc:TK('Protéger le réseau et les points d\'entrée.')},
  {id:'d4', num:'SCS·4', color:'#DD344C', icon:'sts', title:TK('AWS Security : Identité & accès (approfondi)'), sub:TK('Conditions, STS, IMDS, S3, Cognito, AD'), core:false, desc:TK('IAM en profondeur : le gros morceau de l\'examen AWS.')},
  {id:'d5', num:'SCS·5', color:'#7AA116', icon:'kms', title:TK('AWS Security : Protection des données'), sub:TK('KMS, CloudHSM, Secrets Manager, S3, ACM…'), core:false, desc:TK('Chiffrer, gérer les clés, protéger les données.')},
  {id:'d6', num:'SCS·6', color:'#E7157B', icon:'controltower', title:TK('AWS Security : Gouvernance & fondations'), sub:TK('Organizations, Config, Control Tower, CloudFormation…'), core:false, desc:TK('Gouverner un environnement multi-comptes.')}
];
const nat = (a,b)=>a.id.localeCompare(b.id,'en',{numeric:true});
const LESSONS = DATA.slice().sort((a,b)=>{
  const pa=PARTS.findIndex(p=>p.id===a.part), pb=PARTS.findIndex(p=>p.id===b.part);
  return pa-pb || nat(a,b);
});
const BYID = {}; LESSONS.forEach((l,i)=>{l._i=i; BYID[l.id]=l;});
const PARTLESSONS = {}; PARTS.forEach(p=>PARTLESSONS[p.id]=LESSONS.filter(l=>l.part===p.id));

/* ===== Helpers DOM ===== */
const NS='http://www.w3.org/2000/svg';
function h(tag,p,...kids){
  const e=document.createElement(tag);
  if(p) for(const k in p){const v=p[k]; if(v==null||v===false) continue;
    if(k==='class') e.className=v; else if(k==='html') e.innerHTML=v; else if(k==='text') e.textContent=v;
    else if(k.startsWith('on')) e.addEventListener(k.slice(2),v); else e.setAttribute(k,v===true?'':v);}
  for(const c of kids.flat(3)){ if(c==null||c===false) continue; e.append(c.nodeType?c:document.createTextNode(String(c))); }
  return e;
}
function s(tag,p,...kids){
  const e=document.createElementNS(NS,tag);
  if(p) for(const k in p){const v=p[k]; if(v==null||v===false) continue;
    if(k==='class') e.setAttribute('class',v); else if(k==='text') e.textContent=v;
    else if(k.startsWith('on')) e.addEventListener(k.slice(2),v); else e.setAttribute(k,v);}
  for(const c of kids.flat(3)){ if(c==null||c===false) continue; e.append(c.nodeType?c:document.createTextNode(String(c))); }
  return e;
}
const esc = t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const im = t=>esc(t).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g,'$1<i>$2</i>');
function md(t){
  const lines=String(t==null?'':t).split('\n'); let out='',inl=false;
  for(const ln of lines){
    const m=ln.match(/^\s*[-•]\s+(.*)$/);
    if(m){ if(!inl){out+='<ul>';inl=true;} out+='<li>'+im(m[1])+'</li>'; }
    else { if(inl){out+='</ul>';inl=false;} if(ln.trim()) out+='<p>'+im(ln)+'</p>'; }
  }
  if(inl) out+='</ul>'; return out;
}
const trunc=(t,n)=>{t=String(t==null?'':t); return t.length>n? t.slice(0,Math.max(1,n-1))+'…':t;};
function wrapText(t,max,maxLines){
  const words=String(t).split(/\s+/), lines=[]; let cur='';
  for(const w of words){ if((cur+' '+w).trim().length<=max) cur=(cur+' '+w).trim(); else { if(cur) lines.push(cur); cur=w; } }
  if(cur) lines.push(cur);
  if(lines.length>maxLines){ const keep=lines.slice(0,maxLines); keep[maxLines-1]=trunc(lines.slice(maxLines-1).join(' '),max); return keep; }
  return lines;
}
const norm = t=>String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const shuffle = a=>{a=a.slice(); for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a;};

/* ===== Stockage (léger, avec repli mémoire) ===== */
const store={ d:{done:{},quiz:{},known:{}},
  load(){try{const r=localStorage.getItem('cloudsec-progress-v1'); if(r){const o=JSON.parse(r); this.d=Object.assign({done:{},quiz:{},known:{}},o);}}catch(e){}},
  save(){try{localStorage.setItem('cloudsec-progress-v1',JSON.stringify(this.d));}catch(e){}} };
function getPref(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function setPref(k,v){try{localStorage.setItem(k,v);}catch(e){}}

/* ===== Icônes ===== */
const ICONS={
 user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/>',
 role:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="2.5"/><path d="M8 17c.6-2 2.2-3 4-3s3.4 1 4 3"/>',
 policy:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 16h7"/>',
 compute:'<rect x="6" y="6" width="12" height="12" rx="1.5"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',
 storage:'<path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z"/><path d="M4 7l2 12c.2 1.2 2.9 2 6 2s5.8-.8 6-2l2-12"/>',
 db:'<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M16 7l3 3M14 9l2 2"/>',
 network:'<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M11 7.3L6 16.7M13 7.3l5 9.4M7.5 19h9"/>',
 shield:'<path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z"/>',
 log:'<rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 13h8M8 17h5"/>',
 api:'<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 5l-4 14"/>',
 queue:'<rect x="3" y="7" width="5" height="10" rx="1"/><rect x="10" y="7" width="5" height="10" rx="1"/><path d="M17 12h4m-2-2l2 2-2 2"/>',
 idp:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M14 10h5M14 14h4"/>',
 org:'<rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/>',
 device:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 cloud:'<path d="M7 18a4 4 0 010-8 5.5 5.5 0 0110.5 1.5A3.3 3.3 0 0117 18z"/>',
 lock:'<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 skull:'<path d="M12 3a8 8 0 00-8 8c0 2.6 1.3 4.5 3 5.6V20h10v-3.4c1.7-1.1 3-3 3-5.6a8 8 0 00-8-8z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 20v-2M14 20v-2"/>',
 generic:'<rect x="5" y="5" width="14" height="14" rx="3"/>'
};
const KIND_ICON={user:'user',app:'api',idp:'idp',aws:'cloud',store:'storage',network:'network',key:'key',attacker:'skull',service:'compute',generic:'generic'};
function mountSprite(){
  const sp=document.createElementNS(NS,'svg'); sp.setAttribute('width','0'); sp.setAttribute('height','0'); sp.setAttribute('style','position:absolute');
  sp.setAttribute('aria-hidden','true');
  sp.innerHTML='<defs><clipPath id="aws-round" clipPathUnits="objectBoundingBox"><rect width="1" height="1" rx=".16"/></clipPath></defs>'+Object.keys(ICONS).map(k=>`<symbol id="ic-${k}" viewBox="0 0 24 24">${ICONS[k]}</symbol>`).join('')+AWS_SPRITE;
  document.body.prepend(sp);
}
function useIcon(name,x,y,size,cls){
  return s('use',{href:'#ic-'+(ICONS[name]?name:'generic'),x,y,width:size,height:size,class:'ic '+(cls||'')});
}
