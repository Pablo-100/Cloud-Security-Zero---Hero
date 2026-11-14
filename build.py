#!/usr/bin/env python3
import json, glob, os, sys
W='/home/claude/work'
sys.path.insert(0,W+'/tools')
from lib import load_lessons,load_patches,apply_all,load_services
lessons=[]
lessons=apply_all(load_lessons(),load_patches()); services=load_services()
print('patches',len(load_patches()),'services',len(services))
css=open(f'{W}/engine/style.css',encoding='utf-8').read()
js=''.join(open(p,encoding='utf-8').read()+'\n' for p in sorted(glob.glob(f'{W}/engine/js/*.js')))
data=json.dumps(lessons,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
import i18n_build
LANGCODES=['en','es','pt','it','de','nl','pl','tr','id','vi','el','uk','ru','zh-CN','zh-TW','ja','ko','hi','ar']
i18n={}
for lc in LANGCODES:
    d=i18n_build.build(lc)
    if d: i18n[lc]=d
print('i18n langs',{k:len(v) for k,v in i18n.items()})
import glob as _g
nchunks=len(_g.glob(W+'/content/i18n/src/*.json'))
complete=[l for l in i18n if l!='en' and len(_g.glob(W+f'/content/i18n/out_{l}/*.json'))>=nchunks]
contentlangs=json.dumps(['fr','en']+complete)
import gzip,base64
packs=''
inline={}
ui_keys={i18n_build.key(s) for s in json.load(open(W+'/content/i18n/ui_keys.json'))}
for l,d in i18n.items():
    if l=='en' or l not in complete:
        inline[l]=d
    else:
        inline[l]={k:v for k,v in d.items() if k in ui_keys}
        raw=json.dumps(d,ensure_ascii=False,separators=(',',':')).encode('utf-8')
        packs+=f'<script type="text/plain" id="i18n-{l}">'+base64.b64encode(gzip.compress(raw,9)).decode()+'</script>\n'
        print('pack',l,len(raw)//1024,'KB ->',len(packs)//1024,'KB total')
idata=json.dumps(inline,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
sdata=json.dumps(services,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
html=f'''<!DOCTYPE html>
<html lang="fr" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Cloud Security 0→Hero · Cours illustré de sécurité AWS</title>
<meta name="description" content="Apprends la sécurité cloud AWS avec des schémas animés, les logos officiels, une fiche pour chaque service, du derja pour comprendre et un entraînement à l'oral.">
<meta property="og:title" content="Cloud Security 0→Hero">
<meta property="og:description" content="Cours illustré de sécurité AWS : schémas animés, fiches services, oral et examen blanc.">
<meta property="og:type" content="website">
<meta name="theme-color" content="#2442f5">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800&family=Instrument+Sans:wght@400..700&family=JetBrains+Mono:wght@400..600&display=swap" rel="stylesheet">
<style>{css}</style>
</head>
<body>
<div id="app"></div>
<script>window.I18N_DATA={idata};window.I18N_CONTENT={contentlangs};window.COURSE_DATA={data};window.SERVICE_DATA={sdata};</script>
{packs}<script type="text/plain" id="engine">(function(){{
{js}
}})();</script>
<script>(async function(){{
  var c=null; try{{c=localStorage.getItem('cloudsec-lang');}}catch(e){{}} if(!c){{try{{c=sessionStorage.getItem('cloudsec-lang');}}catch(e){{}}}}
  if(!c){{var m=/cloudsec-lang:([\\w-]+)/.exec(window.name||''); if(m) c=m[1];}}
  if(!c){{var nl=((navigator.languages&&navigator.languages[0])||navigator.language||'en').replace('_','-').toLowerCase(); c=nl.indexOf('zh')===0?(/tw|hk|mo|hant/.test(nl)?'zh-TW':'zh-CN'):nl.slice(0,2);}}
  try{{ var el=document.getElementById('i18n-'+c);
    if(el&&window.DecompressionStream){{ var b=atob(el.textContent), u=new Uint8Array(b.length); for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i);
      var txt=await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('gzip'))).text();
      window.I18N_DATA[c]=Object.assign(window.I18N_DATA[c]||{{}},JSON.parse(txt)); }} }}catch(e){{ console.warn('i18n pack',e); }}
  var s=document.createElement('script'); s.textContent=document.getElementById('engine').textContent; document.body.appendChild(s);
}})();</script>
</body>
</html>'''
out=sys.argv[1] if len(sys.argv)>1 else f'{W}/index.html'
open(out,'w',encoding='utf-8').write(html)
print('lessons',len(lessons),'size KB',len(html)//1024,'->',out)
