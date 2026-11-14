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
idata=json.dumps(i18n,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
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
<script>window.I18N_DATA={idata};window.I18N_CONTENT=['fr','en'];window.COURSE_DATA={data};window.SERVICE_DATA={sdata};</script>
<script>(function(){{
{js}
}})();</script>
</body>
</html>'''
out=sys.argv[1] if len(sys.argv)>1 else f'{W}/index.html'
open(out,'w',encoding='utf-8').write(html)
print('lessons',len(lessons),'size KB',len(html)//1024,'->',out)
