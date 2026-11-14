import json, glob, os, re, copy
W='/home/claude/work'
ICONS_LEGACY={"user","role","policy","compute","storage","db","key","network","shield","log","api","queue","idp","org","device","cloud","lock","generic"}
AWSK=set(json.load(open(f'{W}/tools/icon_keys.json')))
ICONALL=ICONS_LEGACY|AWSK
TONES={"info","good","warn","bad","neutral"}
def load_lessons():
    L=[]
    for f in sorted(glob.glob(f'{W}/content/*.json')): L+=json.load(open(f,encoding='utf-8'))
    return L
def apply_patch(lesson,patch):
    """patch: {id, services?, drop?[idx], shorten?{idx:md}, insert?[{after:int,block}]} ; idx = index dans les blocs ORIGINAUX (0-based) ; after=-1 -> avant le 1er bloc"""
    L=copy.deepcopy(lesson); orig=L['blocks']; drop=set(patch.get('drop',[])); sh={int(k):v for k,v in patch.get('shorten',{}).items()}
    ins={}
    for it in patch.get('insert',[]): ins.setdefault(int(it['after']),[]).append(it['block'])
    out=list(ins.get(-1,[]))
    for i,b in enumerate(orig):
        if i not in drop:
            b=copy.deepcopy(b)
            if i in sh and b.get('type')=='text': b['md']=sh[i]
            if i in sh and b.get('type')=='derja': b['text']=sh[i]
            out.append(b)
        out+=ins.get(i,[])
    L['blocks']=out
    if 'services' in patch: L['services']=patch['services']
    for k in ('pitfalls','recap','terms'):
        if k in patch: L[k]=patch[k]
    return L
def apply_all(lessons,patches):
    pm={p['id']:p for p in patches}
    return [apply_patch(l,pm[l['id']]) if l['id'] in pm else l for l in lessons]
def load_patches():
    P=[]
    for f in sorted(glob.glob(f'{W}/content/patches/*.json')): P+=json.load(open(f,encoding='utf-8'))
    return P
def load_services():
    S=[]
    for f in sorted(glob.glob(f'{W}/content/services/*.json')): S+=json.load(open(f,encoding='utf-8'))
    return S
VIS1={"flow","arch","decode","widget","pipeline","stack","hub","cycle","decision","matrix","tree","cards","facts","svc","policy","compare"}
SEMI={"steps":.4,"table":.4,"scenario":.5}
def words(s): return len(re.findall(r'\w+',s or ''))
def prose_words(blocks):
    n=0
    for b in blocks:
        t=b.get('type')
        if t=='text': n+=words(b.get('md'))
        elif t=='derja': n+=words(b.get('text'))
        elif t=='callout': n+=words(b.get('text'))+words(b.get('title'))
    return n
def ratio(blocks):
    if not blocks: return 0
    v=0
    for b in blocks:
        t=b.get('type'); v+= 1 if t in VIS1 else SEMI.get(t,0)
    return v/len(blocks)
