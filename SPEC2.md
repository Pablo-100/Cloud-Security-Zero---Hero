# SPEC2 — Refonte "60 % visuel / 40 % texte" + catalogue de services AWS

Contexte : plateforme d'étude "Cloud Security 0 → Hero" (étudiant tunisien débutant, examen oral + écrit). Le contenu v1 (90 leçons,
`/home/claude/work/content/*.json`, schéma dans `/home/claude/work/SPEC.md`) est trop textuel (≈ 410 mots de prose par leçon, 1 seul diagramme).
**Demande du client : par leçon ≈ 60 % schémas / architectures / icônes officielles AWS et ≈ 40 % écriture ; et une fiche « rôle + pourquoi » pour
chaque service AWS.** Tu fais partie d'une équipe d'agents ; ne touche JAMAIS aux fichiers existants de `content/*.json`, `engine/`, `src/`.

## Règles communes
- Français précis ; derja = lettres LATINES uniquement (jamais d'alphabet arabe — le validateur refuse). Pas d'emoji.
- Exactitude AWS : n'écris que ce dont tu es sûr (pas de limites/chiffres douteux). Fidèle aux slides quand elles existent (`src/ch1.txt`, `src/ch2.txt`, `src/aws.txt`).
- Icônes : champ `icon`/`k` = une clé de `/home/claude/work/tools/icon_keys.json` (logos officiels AWS : `s3`, `kms`, `iam`, `lambda`, `vpc`, `guardduty`, `cloudtrail`,
  `waf`, `ec2`, `rds`, `sns`, `role`, `sts`, `mfa`, `user`, `users`, `client`, `internet`, `server`, `database`, `padlock`, `document`, `firewall`, `saml`, `building`, `bot`, `gear`…).
  Pour un acteur non-AWS (Okta, attaquant, navigateur) : `user`, `client`, `mobile`, `bot`, `building`, `saml`, `server`. Choisis toujours l'icône la plus parlante.
- Libellés COURTS : label ≤ 24 caractères, sub ≤ 32 caractères, `d` des cards ≤ 18 mots.

## A. Mission « catalogue de services » (agents services)
Écris `content/services/<nom>.json` = tableau d'entrées, UNE par clé d'icône qui t'est assignée :
```json
{"k":"kms","name":"AWS KMS","full":"AWS Key Management Service","cat":"Protection des données",
 "tagline":"Le coffre-fort des clés de chiffrement.",
 "role":"1 à 2 phrases (≤ 45 mots) : ce que le service EST et fait.",
 "why":["Pourquoi l'utiliser #1 (≤ 18 mots)","#2","#3"],            // 2 à 4 puces, orientées bénéfice/sécurité
 "how":"Comment ça marche en 1-2 phrases.",
 "when":["Cas d'usage concret 1","Cas 2"],                          // 1 à 4
 "notwhen":"Quand ne PAS l'utiliser / limite / alternative (1 phrase). Optionnel.",
 "derja":"2-3 phrases derja (lettres latines) avec une analogie du quotidien tunisien.",
 "use":[{"k":"ec2","t":"Instance"},{"k":"kms","t":"Demande une clé"},{"k":"ebs","t":"Volume chiffré"}],   // 2 à 5 étapes : mini-architecture « en pratique » (clés d'icônes)
 "vs":[{"k":"cloudhsm","d":"Différence en une phrase"}],            // optionnel, 0 à 3
 "exam":["Point d'examen / piège (1 phrase)", "..."],               // 2 à 4
 "related":["iam","s3"],                                            // 2 à 5 clés d'icônes
 "match":["KMS","Key Management"]}                                  // mots à repérer dans le texte du cours (optionnel)
```
`cat` ∈ {"Identité & accès","Détection & monitoring","Protection des données","Réseau & edge","Calcul & conteneurs","Stockage","Bases de données","Gouvernance & gestion","Intégration & analytique","Outils développeur","Concept"}
(« Concept » pour les icônes qui sont des notions : role, permissions, mfa, tempcred, longcred, datakey, accessanalyzer, saml… ; pour elles `role` = définition, `why` = pourquoi la notion existe).
Valide : `python3 /home/claude/work/tools/check.py services /home/claude/work/content/services/<nom>.json` jusqu'à 0 erreur.
Ton : concret, sécurité d'abord (« pourquoi un étudiant en sécurité cloud s'en soucie »), jamais de marketing.

## B. Mission « conversion visuelle des leçons » (agents leçons)
Tu reçois une liste de fichiers `content/<f>.json`. Pour CHAQUE leçon tu produis un **patch** (JSON) ; le build applique ton patch à la leçon d'origine.
Tu écris `content/patches/<nom>.json` = tableau de patchs :
```json
{"id":"ch2b-03",
 "services":["iam","s3","sts"],                 // clés d'icônes de la leçon (2-8)
 "drop":[2,5],                                  // index (0-based, dans les blocs ORIGINAUX) à supprimer (longs paragraphes/tables remplacés par un visuel)
 "shorten":{"3":"nouveau md ≤ 60 mots"},        // réécriture courte d'un bloc text/derja existant (index original)
 "insert":[{"after":1,"block":{...}}, {"after":-1,"block":{...}}]   // after = index original après lequel insérer ; -1 = tout au début ; l'ordre du tableau = l'ordre d'insertion
}
```
Tu peux aussi remplacer `pitfalls`, `recap`, `terms` en les fournissant dans le patch (optionnel — ne le fais que pour raccourcir/clarifier).
**On garde** : hook, oral, quiz, scenarios, policy, decode, flow, arch, widget existants (ce sont déjà des visuels/interactions), la section derja principale (raccourcie si > 50 mots).

### Objectifs mesurés par `python3 /home/claude/work/tools/check.py patch <ton_fichier>` (0 erreur exigé)
1. **Ratio visuel ≥ 0.60** (flow, arch, decode, policy, widget, compare, svc, pipeline, stack, hub, cycle, decision, matrix, tree, cards, facts = 1 ; steps/table = 0.4 ; scenario = 0.5 ; text/derja/callout = 0).
2. **Prose ≤ 320 mots** au total (blocs text + derja + callout) ; un bloc `text` ≤ 80 mots ; jamais 2 `text` consécutifs sans visuel entre eux.
3. **Exactement 1 bloc `svc`** (« Services en jeu ») par leçon, 2-8 items, chacun avec `ctx` = rôle + raison d'être **dans cette leçon** (≤ 22 mots).
4. ≥ 6 blocs visuels, ≥ 4 TYPES de visuels différents dont ≥ 1 flow ou arch.
5. Tables : au plus 1 par leçon (≤ 5 lignes) ; sinon convertis en `matrix`, `compare` (avec `icon`), `cards`, `stack`.
**Ne perds pas d'information utile à l'examen** : ce que tu supprimes en texte doit réapparaître dans un visuel (label, sub, note, caption, cards.d…).

### Nouveaux blocs (en plus de flow/arch/decode/policy/compare/steps…)
Tous les champs `icon`/`k` = clés d'`icon_keys.json` ; `tone` ∈ info|good|warn|bad|neutral.
```json
{"type":"svc","title":"Services en jeu","items":[{"k":"iam","ctx":"Décide qui peut faire quoi ; porte les policies de la leçon."}]}

{"type":"cards","title":"…","cols":3,"items":[{"icon":"kms","t":"Titre court","d":"≤ 18 mots","tone":"good"}]}          // 2-6 items : remplace une liste de puces

{"type":"facts","title":"…","items":[{"icon":"s3","big":"11 × 9","label":"durabilité S3","sub":"optionnel"}]}                // 2-5 chiffres/mots-clés marquants

{"type":"pipeline","title":"Chaîne d'attaque","stages":[{"label":"Reconnaissance","sub":"scan","icon":"bot","tone":"warn"}],"caption":"optionnel"}  // 3-8 étapes de gauche à droite (kill chain, IR, request path)

{"type":"stack","title":"Défense en profondeur","layers":[{"label":"Identité","sub":"MFA, moindre privilège","icon":"iam","tone":"info","tags":["MFA","IAM"]}],"side":"du plus externe au plus interne"}   // 3-7 couches empilées

{"type":"hub","title":"…","center":{"label":"IAM","sub":"cœur","icon":"iam"},"spokes":[{"label":"Users","sub":"humains","icon":"user","note":"1 phrase affichée au clic","tone":"info"}]}   // 3-8 branches

{"type":"cycle","title":"Cycle de réponse","center":"IR","items":[{"label":"Préparer","sub":"playbooks","icon":"ssm"}]}               // 3-8 étapes en boucle

{"type":"decision","title":"Quel service choisir ?","root":{"q":"Données sensibles ?","yes":{"q":"Clés sous ton contrôle exclusif ?","yes":{"a":"CloudHSM","icon":"cloudhsm","tone":"good","why":"HSM dédié"},"no":{"a":"KMS","icon":"kms","tone":"good","why":"géré"}},"no":{"a":"SSE-S3","icon":"s3","tone":"neutral"}}}   // arbre oui/non (1-6 questions, profondeur ≤ 4)

{"type":"matrix","title":"Qui peut quoi ?","rows":["Deny explicite","SCP"],"cols":["Même compte","Cross-account"],"cells":[["no","no"],["ok","ok"]],"legend":{"ok":"Autorisé","no":"Refusé"}}   // cellules : ok | no | warn | na | texte court (≤ 14 car.)

{"type":"tree","title":"Hiérarchie Organizations","root":{"label":"Racine","icon":"orgs","children":[{"label":"OU Prod","icon":"building","children":[{"label":"Compte A","icon":"user"}]}]}}   // ≤ 16 nœuds, profondeur ≤ 4
```
Extensions des blocs existants : `compare.cols[].icon` ; `arch` nœuds → `icon` peut être une clé AWS (ex `"icon":"kms"`) ; `flow.actors[].icon` idem (sinon le moteur devine d'après le libellé).

### Quel visuel pour quelle idée (guide)
- Un processus/protocole entre acteurs → `flow` (existant ou nouveau : 3-5 acteurs, ≥ 5 étapes, `derja` sur 1-2 étapes clés).
- Où vivent les composants / quelles frontières (compte, VPC, org) → `arch` (groupes account/vpc/subnet/org + vraies icônes + étapes).
- Couches / défense en profondeur / responsabilité partagée / ordre d'évaluation → `stack`.
- Un concept avec 4-8 composantes → `hub`. Un cycle de vie / boucle → `cycle`. Une chaîne séquentielle simple → `pipeline`.
- « Quel service/option choisir ? » → `decision`. Comparaison de cas × critères (autorisé/refusé) → `matrix`. Hiérarchie → `tree`.
- 3-6 idées-clés parallèles → `cards`. Chiffres à retenir → `facts`. Deux approches à comparer → `compare`.
Rythme conseillé d'une leçon : hook → visuel d'ouverture (stack/hub/pipeline) → ≤ 60 mots de texte → arch/flow → cards/matrix → (policy/decode/scenario existants) → decision/cycle → svc. Alterne ; pas de mur de texte.
Chaque nouveau visuel doit être CORRECT et pédagogique (labels précis, sens des flèches/ordres justes). Pas de remplissage décoratif.

### Méthode de travail (important : budget de tokens limité)
1. Lis ton/tes fichier(s) de contenu (via Python : liste des blocs avec index, type, titre, nb de mots) puis les blocs utiles.
2. Fais UN patch à la fois : écris-le dans `/tmp/<nom>/pNN.json`, vérifie-le, puis, à la fin, fusionne tous les patchs dans `content/patches/<nom>.json` (liste) et lance le check global sur ce fichier.
3. Itère jusqu'à 0 erreur. Si une limite d'API/tokens est atteinte, arrête-toi et rapporte précisément quelles leçons sont terminées.
4. Rapport final : 3 lignes max (leçons faites, ratio moyen, éventuels problèmes).
