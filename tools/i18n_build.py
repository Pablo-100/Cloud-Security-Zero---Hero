"""Assemble les dictionnaires de langue : {hash53(source_fr): traduction}.
Sources : content/i18n/out_<lang>/NNN.json (aligné sur src/NNN.json) + content/i18n/ui_<lang>.json ({fr: tr})."""
import json,os,glob,sys
M32=0xFFFFFFFF
def imul(a,b): return ((a&M32)*(b&M32))&M32
def h53(s):
    h1=0xdeadbeef; h2=0x41c6ce57
    for ch in s.encode('utf-16-le'):
        pass
    units=[]; b=s.encode('utf-16-le')
    for i in range(0,len(b),2): units.append(b[i]|(b[i+1]<<8))
    for c in units:
        h1=imul(h1^c,2654435761); h2=imul(h2^c,1597334677)
    h1=(imul(h1^(h1>>16),2246822507)^imul(h2^(h2>>13),3266489909))&M32
    h2=(imul(h2^(h2>>16),2246822507)^imul(h1^(h1>>13),3266489909))&M32
    return 4294967296*(2097151&h2)+h1
def b36(n):
    a='0123456789abcdefghijklmnopqrstuvwxyz'; r=''
    while n: n,m=divmod(n,36); r=a[m]+r
    return r or '0'
def key(s): return b36(h53(s))
def build(lang):
    d={}; base='/home/claude/work/content/i18n/'
    for f in sorted(glob.glob(base+f'src/*.json')):
        k=os.path.basename(f); o=base+f'out_{lang}/'+k
        if not os.path.exists(o): continue
        src=json.load(open(f)); out=json.load(open(o))
        if len(src)!=len(out): continue
        for a,b in zip(src,out):
            if b and b!=a: d[key(a)]=b
    for u in sorted(glob.glob(base+f'ui_{lang}.json')+glob.glob(base+f'ui_delta*_{lang}.json')):
        for a,b in json.load(open(u)).items():
            if b and b!=a: d[key(a)]=b
    return d
if __name__=='__main__':
    seen={}
    srcs=[]
    for f in glob.glob('/home/claude/work/content/i18n/src/*.json'): srcs+=json.load(open(f))
    ku=json.load(open('/home/claude/work/content/i18n/ui_keys.json')) if os.path.exists('/home/claude/work/content/i18n/ui_keys.json') else []
    for s in srcs+ku:
        k=key(s)
        if k in seen and seen[k]!=s: print('COLLISION',s,seen[k])
        seen[k]=s
    print(len(seen),'keys, no collision' )
    for lang in sys.argv[1:]:
        d=build(lang); json.dump(d,open(f'/home/claude/work/content/i18n/dict_{lang}.json','w'),ensure_ascii=False,separators=(',',':')); print(lang,len(d),'entries')
