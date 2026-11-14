#!/usr/bin/env python3
"""python3 tools/check.py patch <fichier_patch.json>   |  python3 tools/check.py services <fichier_services.json>  |  python3 tools/check.py all"""
import sys, json, subprocess, tempfile, os, re
sys.path.insert(0,'/home/claude/work/tools')
from lib import *
def E(l,m): print('ERR ',f'[{l}] {m}'); return 1
def check_block(lid,i,b):
    e=0; t=b.get('type'); loc=f'bloc#{i+1}({t})'
    def err(m):
        nonlocal e; e+=1; print('ERR ',f'[{lid}] {loc}: {m}')
    def icon(x,what='icon'):
        if x is not None and x not in ICONALL: err(f'{what} inconnue {x!r} (voir tools/icon_keys.json)')
    def tone(x):
        if x is not None and x not in TONES: err(f'tone invalide {x!r}')
    if t=='svc':
        it=b.get('items',[])
        if not (1<=len(it)<=8): err('1 à 8 items')
        for x in it:
            if x.get('k') not in AWSK: err(f"k inconnu {x.get('k')!r}")
            if not x.get('ctx'): err('ctx requis (rôle/pourquoi dans CETTE leçon, ≤ 22 mots)')
            elif words(x['ctx'])>30: err('ctx trop long')
    elif t=='cards':
        it=b.get('items',[])
        if not (2<=len(it)<=6): err('2 à 6 items')
        for x in it:
            icon(x.get('icon')); tone(x.get('tone'))
            if not x.get('t') or not x.get('d'): err('t et d requis')
            elif words(x['d'])>22: err(f"d trop long ({words(x['d'])} mots, max 22)")
    elif t=='facts':
        it=b.get('items',[])
        if not (2<=len(it)<=5): err('2 à 5 items')
        for x in it:
            icon(x.get('icon'))
            if not x.get('big') or not x.get('label'): err('big et label requis')
    elif t=='pipeline':
        st=b.get('stages',[])
        if not (3<=len(st)<=8): err('3 à 8 stages')
        for x in st:
            icon(x.get('icon')); tone(x.get('tone'))
            if not x.get('label'): err('label requis')
    elif t=='stack':
        ly=b.get('layers',[])
        if not (3<=len(ly)<=7): err('3 à 7 layers')
        for x in ly:
            icon(x.get('icon')); tone(x.get('tone'))
            if not x.get('label'): err('label requis')
    elif t=='hub':
        sp=b.get('spokes',[]); c=b.get('center',{})
        if not c.get('label'): err('center.label requis')
        icon(c.get('icon'))
        if not (3<=len(sp)<=8): err('3 à 8 spokes')
        for x in sp:
            icon(x.get('icon')); tone(x.get('tone'))
            if not x.get('label'): err('label requis')
    elif t=='cycle':
        it=b.get('items',[])
        if not (3<=len(it)<=8): err('3 à 8 items')
        for x in it:
            icon(x.get('icon'))
            if not x.get('label'): err('label requis')
    elif t=='decision':
        cnt=[0]
        def walk(n,d):
            if d>4: err('profondeur > 4'); return
            if 'q' in n:
                cnt[0]+=1
                if 'yes' not in n or 'no' not in n: err('noeud q sans yes/no'); return
                walk(n['yes'],d+1); walk(n['no'],d+1)
            else:
                if not n.get('a'): err('feuille sans a')
                icon(n.get('icon')); tone(n.get('tone'))
        walk(b.get('root',{}),1)
        if cnt[0]<1 or cnt[0]>6: err('1 à 6 questions')
    elif t=='matrix':
        r,c,ce=b.get('rows',[]),b.get('cols',[]),b.get('cells',[])
        if not (2<=len(r)<=9 and 2<=len(c)<=6): err('rows 2-9, cols 2-6')
        if len(ce)!=len(r) or any(len(x)!=len(c) for x in ce): err('cells doit être rows×cols')
        for x in ce:
            for v in x:
                if not isinstance(v,str): err('cellule str')
    elif t=='tree':
        n=[0]
        def walk(x,d):
            n[0]+=1; icon(x.get('icon')); tone(x.get('tone'))
            if not x.get('label'): err('label requis')
            if d>4: err('profondeur > 4')
            for c in x.get('children',[]): walk(c,d+1)
        walk(b.get('root',{}),1)
        if n[0]>16: err('max 16 noeuds')
    elif t=='compare':
        for c in b.get('cols',[]): icon(c.get('icon'))
    elif t=='text':
        if words(b.get('md'))>80: err(f"text > 80 mots ({words(b.get('md'))}) : transforme en visuel")
    return e
def check_lessons(lessons,orig=None,strict=True):
    errs=0; tot=[]
    for L in lessons:
        lid=L['id']
        for i,b in enumerate(L['blocks']): errs+=check_block(lid,i,b)
        r=ratio(L['blocks']); pw=prose_words(L['blocks']); tot.append((lid,r,pw))
        svc=[b for b in L['blocks'] if b.get('type')=='svc']
        if strict:
            if len(svc)!=1: errs+=E(lid,f'exactement 1 bloc svc requis (a {len(svc)})')
            if r<0.6: errs+=E(lid,f'ratio visuel {r:.2f} < 0.60')
            if pw>320: errs+=E(lid,f'prose {pw} mots > 320')
            types={b['type'] for b in L['blocks'] if b['type'] in VIS1}
            if len(types)<4: errs+=E(lid,f'au moins 4 types de visuels différents (a {sorted(types)})')
            if sum(1 for b in L['blocks'] if b['type'] in {'flow','arch'})<1: errs+=E(lid,'au moins 1 flow ou arch')
            nvis=sum(1 for b in L['blocks'] if b['type'] in VIS1)
            if nvis<6: errs+=E(lid,f'au moins 6 blocs visuels (a {nvis})')
            if any(re.search(r'[؀-ۿ]',json.dumps(L,ensure_ascii=False)) for _ in [0]): errs+=E(lid,'caractères arabes interdits')
    return errs,tot
def run_validate(lessons):
    fd,p=tempfile.mkstemp(suffix='.json'); os.write(fd,json.dumps(lessons,ensure_ascii=False).encode()); os.close(fd)
    r=subprocess.run(['python3',f'{W}/validate.py',p],capture_output=True,text=True); os.unlink(p)
    out=[l for l in r.stdout.splitlines() if l.startswith('ERR')]
    for l in out: print(l)
    return len(out)
def cmd_patch(path):
    P=json.load(open(path,encoding='utf-8')); base=load_lessons(); ids={l['id'] for l in base}
    errs=0
    for p in P:
        if p['id'] not in ids: errs+=E(p.get('id'),'id de leçon inconnu')
    pm={p['id']:p for p in P}
    sel=[apply_patch(l,pm[l['id']]) for l in base if l['id'] in pm]
    for l in sel:
        o=next(x for x in base if x['id']==l['id']); n=len(o['blocks'])
        pa=pm[l['id']]
        for i in pa.get('drop',[]):
            if not (0<=i<n): errs+=E(l['id'],f'drop {i} hors plage (0..{n-1})')
        for it in pa.get('insert',[]):
            if not (-1<=it['after']<n): errs+=E(l['id'],f"after {it['after']} hors plage")
        for k in pa.get('shorten',{}):
            if not (0<=int(k)<n) or o['blocks'][int(k)]['type'] not in ('text','derja'): errs+=E(l['id'],f'shorten {k}: doit viser un bloc text/derja existant')
    errs+=run_validate(sel)
    e2,tot=check_lessons(sel); errs+=e2
    for lid,r,pw in tot: print(f'  {lid}: ratio visuel {r:.2f}, prose {pw} mots')
    missing=[l['id'] for l in base if l['id'] not in pm and True]
    print(f'{len(sel)} leçons patchées, {errs} erreurs'); return errs
SV_REQ=['k','name','cat','tagline','role','why','how','when','derja','use','exam','related']
CATS={'Identité & accès','Détection & monitoring','Protection des données','Réseau & edge','Calcul & conteneurs','Stockage','Bases de données','Gouvernance & gestion','Intégration & analytique','Outils développeur','Concept'}
def cmd_services(path):
    S=json.load(open(path,encoding='utf-8')); errs=0
    for s in S:
        k=s.get('k','?')
        for r in SV_REQ:
            if r not in s: errs+=E(k,f'champ manquant {r}')
        if s.get('k') not in AWSK: errs+=E(k,'k absent de icon_keys.json')
        if s.get('cat') not in CATS: errs+=E(k,f"cat invalide {s.get('cat')!r}")
        if not (2<=len(s.get('why',[]))<=4): errs+=E(k,'why: 2 à 4 puces')
        if not (1<=len(s.get('when',[]))<=4): errs+=E(k,'when: 1 à 4 puces')
        if not (2<=len(s.get('use',[]))<=5): errs+=E(k,'use: 2 à 5 étapes {k,t}')
        for u in s.get('use',[]):
            if u.get('k') not in ICONALL or not u.get('t'): errs+=E(k,f'use invalide {u}')
        for r in s.get('related',[]):
            if r not in AWSK: errs+=E(k,f'related inconnu {r}')
        for v in s.get('vs',[]):
            if v.get('k') not in AWSK or not v.get('d'): errs+=E(k,f'vs invalide {v}')
        if re.search(r'[؀-ۿ]',json.dumps(s,ensure_ascii=False)): errs+=E(k,'caractères arabes interdits')
        if words(s.get('role',''))>45: errs+=E(k,'role trop long (≤ 45 mots)')
    print(f'{len(S)} services, {errs} erreurs'); return errs
if __name__=='__main__':
    m=sys.argv[1]
    if m=='patch': sys.exit(1 if cmd_patch(sys.argv[2]) else 0)
    if m=='services': sys.exit(1 if cmd_services(sys.argv[2]) else 0)
    if m=='all':
        base=load_lessons(); merged=apply_all(base,load_patches())
        errs=run_validate(merged); e2,tot=check_lessons(merged); 
        print('ratio moyen',sum(r for _,r,_ in tot)/len(tot),'prose moyenne',sum(p for *_,p in tot)/len(tot)); print(errs+e2,'erreurs'); sys.exit(1 if errs+e2 else 0)
