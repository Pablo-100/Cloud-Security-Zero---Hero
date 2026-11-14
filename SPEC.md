# SPEC — Plateforme d'apprentissage "Cloud Security 0 → Hero" (TEK-UP ING5-SSIR)

Tu écris du **contenu pédagogique en JSON** pour une plateforme interactive (type "Protocol Explorer" : flux animés
pas-à-pas, décodage champ par champ, scénarios). Un moteur HTML (écrit par ailleurs) rend tes blocs. Tu ne
touches PAS au moteur. Tu produis UN fichier JSON : `/home/claude/work/content/<ton_fichier>.json`
contenant un tableau de **leçons** (objets décrits ci-dessous).

## Public & ton
- L'étudiant est **débutant en cloud AWS** (niveau "A1.1"), tunisien, doit **comprendre** puis **passer un examen oral/écrit**
  devant le prof (savoir QUOI répondre et COMMENT le dire).
- Langue du cours : **français** clair et précis (vocabulaire technique EN/FR comme dans les slides).
- Couche "intuition" : **derja tunisienne écrite en lettres latines** (comme sur WhatsApp : "ya3ni", "el", "mta3", "7aja", "kol chay",
  "bch", "lazem", "ma3neha", "fhemt?"). Le ton = un grand frère/une grande sœur qui t'explique au café, avec des analogies
  de la vie quotidienne (carte d'identité/CIN, louage, bawab/gardien, clé de la maison, badge de l'école, café/serveur, mariage,
  poste/courrier, banque). **Jamais condescendant, jamais de blabla** : chaque phrase apprend quelque chose.
  Exemple de style : « Ya3ni IAM houwa el bawab mta3 el cloud: yo9olek "inti chkoun?" (authentification) w ba3dha "tnajjem tod5ol
  fin?" (autorisation). » → écris uniquement en lettres latines (pas d'alphabet arabe).
- Les termes techniques restent en anglais/français d'origine (Role, Policy, AssumeRole, bucket...).

## Règles de contenu (IMPORTANT)
1. **Fidélité au cours** : base-toi d'abord sur les slides fournies (texte + images : rends-les en PNG pour lire diagrammes/JSON).
   Tu peux compléter avec tes connaissances AWS **certaines** pour mieux expliquer, mais jamais inventer de chiffres/limites
   douteux. En cas de doute → ne l'écris pas.
2. **Reformule avec tes propres mots** (pas de copier-coller long des slides ; pas de mention du nom de l'auteur du PDF).
3. **Exemples AWS réalistes** : vrais noms d'actions IAM (`s3:GetObject`), vrais ARN, vrais JSON de policies valides.
4. **0 → hero** : dans chaque leçon commence par le "pourquoi / problème" avant la définition, puis définition précise,
   puis mécanisme (flux/architecture), puis exemple concret, puis pièges + oral + quiz.
5. Diagrammes : privilégie des **flows animés** (sequence) et des **architectures** claires ; garde 3-8 acteurs/nœuds max par diagramme.
6. Chaque leçon doit répondre à : « Qu'est-ce que je dis si le prof me demande ça ? » → bloc `oral`.
7. JSON **valide** (guillemets échappés, pas de virgule finale). Pas de retours à la ligne bruts dans les chaînes : utilise `\n`.
8. Pas d'emoji dans les champs techniques ; un seul emoji dans `emoji` du header de leçon.

## Schéma d'une leçon
```json
{
  "id": "ch2b-03",               // unique ; préfixe imposé dans ta consigne
  "part": "ch2b",                // id de la partie (imposé dans ta consigne)
  "title": "Resource-based policies & Principal",
  "emoji": "🛂",
  "level": 1,                    // 0 = base, 1 = intermédiaire, 2 = avancé
  "minutes": 12,
  "core": true,                  // true = au programme cours (CH1/CH2) ; false = approfondissement PDF
  "src": "CH2 slides 53-57",     // ou "PDF p.284-305"
  "hook": { "fr": "1 phrase : pourquoi c'est important", "derja": "2-4 phrases d'intuition en derja + analogie" },
  "blocks": [ ...blocs ci-dessous... ],
  "terms": [ { "t": "STS", "d": "définition FR en 1 phrase", "derja": "optionnel, 1 phrase derja" } ],
  "oral":  [ { "q": "Question type du prof", "a": "Réponse modèle FR, 3 à 6 phrases structurées (définition → mécanisme → exemple → précaution)", "keys": ["mot-clé", "mot-clé"] } ],
  "pitfalls": [ "Piège d'examen / confusion fréquente (1 phrase chacun)" ],
  "quiz": [ { "q": "...", "opts": ["A","B","C","D"], "ans": 1, "why": "explication courte" } ],
  "recap": [ "3 à 6 points à retenir" ]
}
```
Minimum par leçon *core* : 1 hook, ≥6 blocs, ≥2 visuels (flow/arch/decode/policy), ≥1 scenario, ≥3 oral, ≥3 pitfalls, ≥4 quiz, 4-6 recap, ≥4 terms.
Minimum par leçon *non core* (PDF) : 1 hook, ≥5 blocs, ≥1 visuel, ≥1 scenario, ≥2 oral, ≥2 pitfalls, ≥3 quiz, ≥3 recap, ≥3 terms.
Quiz : `ans` = index (0-3) de la bonne réponse ; varie la position de la bonne réponse ; distracteurs plausibles.

## Types de blocs (champ "type")
### `derja` — encadré intuition
`{"type":"derja","title":"Fhem bel derja","text":"...derja latin..."}`

### `text` — explication
`{"type":"text","title":"Définition","md":"Texte avec **gras**, `code`, et listes :\n- point 1\n- point 2"}`
(md supporté : **gras**, *italique*, `code`, lignes "- " en liste, `\n` = nouvelle ligne)

### `callout`
`{"type":"callout","tone":"tip|warn|exam|info","title":"...","text":"..."}`  (exam = « tombe à l'examen »)

### `table`
`{"type":"table","title":"...","head":["Col1","Col2"],"rows":[["a","b"],["c","d"]],"note":"optionnel"}`
(les cellules exactement "Client", "Fournisseur", "Partagé" sont colorées automatiquement ; md inline autorisé dans les cellules)

### `compare` — cartes côte à côte
`{"type":"compare","title":"SAML vs OIDC","cols":[{"name":"SAML 2.0","tag":"XML","points":["..",".."],"use":"Quand l'utiliser"},{...}]}` (2 à 4 colonnes)

### `steps` — étapes numérotées (statique)
`{"type":"steps","title":"...","items":[{"t":"Titre court","d":"Détail"}]}`

### `flow` — diagramme de séquence ANIMÉ pas-à-pas (le bloc phare)
```json
{"type":"flow","title":"SAML SP-initiated","intro":"optionnel",
 "actors":[{"id":"u","label":"Alice","sub":"navigateur","kind":"user"},
           {"id":"sp","label":"SaaS App","sub":"Service Provider","kind":"app"},
           {"id":"idp","label":"IdP","sub":"Entra ID","kind":"idp"}],
 "steps":[{"from":"u","to":"sp","label":"1. Ouvre l'app","detail":"Explication FR (1-2 phrases)","derja":"optionnel : 1 phrase derja",
           "dashed":false,"payload":{"title":"AuthnRequest","fields":[{"k":"Issuer","v":"https://app.example.com","note":"qui demande"}]}}]}
```
- `kind` ∈ user, app, idp, aws, store, network, key, attacker, service, generic. 2 à 6 acteurs ; 4 à 12 steps.
- `from`==`to` → étape "sur soi-même" (ex : validation). `dashed:true` = retour/réponse.
- `payload` (optionnel) = « décodage champ par champ » du message échangé (comme un paquet décodé). 2-6 fields {k,v,note}.
- Un step peut avoir `"tone":"bad"` (rouge : attaque/refus) ou `"tone":"good"` (vert : succès).

### `arch` — architecture (nœuds groupés + flèches), avec mode "pas-à-pas"
```json
{"type":"arch","title":"Cross-account AssumeRole",
 "groups":[{"id":"A","label":"Compte A (Auth) 111111111111","kind":"account","col":0,"row":0,
            "nodes":[{"id":"app","label":"Application","sub":"EC2","icon":"compute"},{"id":"pol","label":"Identity policy","sub":"sts:AssumeRole","icon":"policy"}]},
           {"id":"B","label":"Compte B (Workload)","kind":"account","col":1,"row":0,"nodes":[...]}],
 "edges":[{"id":"e1","from":"app","to":"role","label":"1. AssumeRole","style":"solid"}],
 "steps":[{"edges":["e1"],"nodes":["app"],"caption":"Explication de cette étape"}]}
```
- `kind` de groupe : account, vpc, subnet, zone, onprem, internet, org, generic. `col`/`row` : position dans une grille (0..3).
- Nœuds empilés verticalement dans le groupe (1-4 nœuds par groupe). `icon` ∈ user, role, policy, compute, storage, db, key, network, shield, log, api, queue, idp, org, device, cloud, lock, generic.
- Edge `style` ∈ solid, dashed, deny (rouge, barrée). 3-10 edges. `steps` optionnel mais recommandé (3-8 étapes : chaque étape met en surbrillance des edges/nodes avec légende).

### `decode` — décodage d'un artefact (JWT, XML SAML, ARN, JSON SCIM, commande CLI, politique...) 
```json
{"type":"decode","title":"Anatomie d'un ARN","raw":"arn:aws:s3:::my-bucket/reports/*",
 "parts":[{"s":"arn","label":"Préfixe","note":"Amazon Resource Name"},{"s":"aws","label":"Partition","note":"..."},{"s":"s3","label":"Service","note":".."}]}
```
`parts[].s` = sous-chaînes **présentes dans raw**, dans l'ordre d'apparition (le moteur les surligne ; au survol → label+note). 
`raw` peut contenir `\n` (JSON/XML multi-lignes).

### `policy` — politique JSON lisible ligne par ligne + mini-quiz « Peux-tu ? »
```json
{"type":"policy","title":"Identity-based policy","lines":["{","  \"Version\": \"2012-10-17\",","  \"Statement\": [","    {"," ..."],
 "notes":[{"lines":[4,5],"text":"Effect Allow = autorise","tone":"info"}],
 "tryit":[{"q":"Peut-on faire s3:PutObject ?","ans":false,"why":"Seul GetObject est autorisé"}]}
```
- `lines` = tableau de chaînes (une par ligne, indentation incluse). `notes[].lines` = numéros de lignes **1-indexés** (ou [a,b] plage).
  `tone` ∈ info, good, warn, bad. `tryit[].ans` = booléen (true = autorisé / vrai).
- Utilise ce bloc pour TOUT JSON de policy (identity, resource, trust, SCP, boundary, session, key policy, bucket policy…).

### `scenario` — mise en situation à choix
`{"type":"scenario","title":"Cas : ...","situation":"Contexte réaliste (2-4 phrases)","q":"Que faire ?","opts":[{"t":"Option","ok":false,"why":"Pourquoi faux"},{"t":"Option","ok":true,"why":"Pourquoi juste"}]}`
(3-4 options, 1 seule `ok:true`)

### `widget` — composants interactifs pré-construits (utilise UNIQUEMENT si ta consigne le demande)
`{"type":"widget","name":"sharedResp|evalLogic|abacPlay","title":"..."}`

## Validation
Lance : `python3 /home/claude/work/validate.py /home/claude/work/content/<ton_fichier>.json` jusqu'à **0 erreur**.
Le validateur vérifie le JSON, les champs requis, les références (actors/steps/edges), `parts` du decode, les index de policy, le quiz.

## Lire les sources
- Textes extraits : `/home/claude/work/src/ch1.txt`, `ch2.txt` (slides numérotées, notes incluses), `aws.txt` (PDF, pages séparées par \f ; `python3 -c` pour couper).
- Pour VOIR une slide/page (diagrammes, JSON en image) : `pdftoppm -r 70 -f N -l N -png /home/claude/work/src/{ch1|ch2|aws}.pdf /tmp/<tonnom>_pN` puis Read du PNG.
  (ch1.pdf/ch2.pdf = conversion fidèle des pptx : n° de page = n° de slide.)
- Ne modifie jamais les fichiers de `/home/claude/work/src`. Travaille dans `/tmp/<tonnom>/`.
