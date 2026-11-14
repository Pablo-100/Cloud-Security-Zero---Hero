import sys,json,re,glob,os
sys.path.insert(0,'/home/claude/work/tools')
from lib import *
KEEP={'derja','icon','id','type','kind','from','to','nodes','edges','style','services','part','emoji','lines','raw','tone','col','row','match','cat','related','level','minutes','core','center_icon','hint','corr','ans','answer','correct','d_icon','lang','bold'}
def load_all():
    L=apply_all(load_lessons(),load_patches())
    S=[]
    for f in sorted(glob.glob('/home/claude/work/content/services/*.json')):
        d=json.load(open(f)); S+= d if isinstance(d,list) else list(d.values())
    return L,S
def walk(o,key,fn):
    """returns transformed copy; fn(str)->str applied at translatable string leaves"""
    if isinstance(o,dict):
        if o.get('type')=='derja': return o
        r={}
        for k,v in o.items():
            if k in KEEP and not (isinstance(v,dict) or (isinstance(v,list) and any(isinstance(x,dict) for x in v))): r[k]=v
            else: r[k]=walk(v,k,fn)
        return r
    if isinstance(o,list): return [walk(v,key,fn) for v in o]
    if isinstance(o,str): return fn(o)
    return o
ID=re.compile(r'^[A-Za-z0-9_\-:./*@#\[\]()=+,%$<>{}|\\ ]{0,12}$')
def translatable(s):
    if not re.search(r'[A-Za-zÀ-ÿ]',s): return False
    if s.startswith(('{','[','arn:','aws ','"','<')): return False
    if re.fullmatch(r'[a-z0-9_\-:.]+',s): return False
    if ' ' not in s and len(s)<=14 and s==s.upper(): return False
    return True
def collect():
    L,S=load_all(); seen={}
    def f(s):
        if translatable(s) and s not in seen: seen[s]=len(seen)
        return s
    walk(L,None,f); walk(S,None,f)
    return list(seen.keys()),L,S
if __name__=='__main__':
    strs,L,S=collect()
    print(len(strs),'unique strings', sum(len(s) for s in strs)/1e6,'M chars')
    os.makedirs('/home/claude/work/content/i18n/src',exist_ok=True)
    json.dump(strs,open('/home/claude/work/content/i18n/source_strings.json','w'),ensure_ascii=False)
    import random
    tok=[s for s in strs if re.search(r'\*\*|`|\[\[|\{|<',s)]
    print(len(tok),'with markup'); print(random.sample(tok,8))
