import sys
lang,name,notes=sys.argv[1],sys.argv[2],sys.argv[3]
open(f'/home/claude/work/content/i18n/PROMPT_{lang}.md','w').write(f"""Tu traduis le contenu d'une plateforme de cours « AWS Cloud Security » (étudiants ingénieurs) de l'anglais vers : {name} (code {lang}). Répertoire : /home/claude/work/content/i18n.
Pour chaque numéro k de ta plage (donnée dans ton message) : lis out_en/<k>.json (tableau JSON de chaînes anglaises, ≤250 éléments) et écris out_{lang}/<k>.json (crée le dossier si besoin) = tableau JSON de MÊME longueur, même ordre, chaque chaîne traduite en {name}, naturel, clair et pédagogique.
Règles strictes :
- Conserve EXACTEMENT les marqueurs : `**gras**`, `` `code` ``, `${{...}}`, URLs, retours à la ligne \\n, symboles (<->, →, ✓...). Même nombre de ** et de backticks que dans la source.
- NE TRADUIS PAS les termes techniques ni les noms de services : noms de services AWS (AWS KMS, Amazon S3, IAM, Lambda, CloudTrail...), noms d'API/actions/clés de condition (aws:SourceVpc, sts:AssumeRole), commandes, codes, ARN, identifiants, sigles (CIA, MFA, SCP, VPC, SAML, OAuth...), noms de produits et termes techniques standard que l'on garde en anglais dans la pratique (policy, role, bucket, token, endpoint, hash, key policy, trust policy...). TOUT LE RESTE (phrases, explications, titres, libellés de schémas, questions d'examen, scénarios) doit être traduit : aucune phrase ne doit rester en anglais.
- Si une chaîne n'est qu'un identifiant/commande/valeur technique, recopie-la à l'identique.
- Libellés très courts de schémas : équivalent court. Registre : forme informelle/neutre si la langue le permet.
{notes}
- Écris chaque fichier avec l'outil Write, JSON valide UTF-8 (échappe les guillemets). Traduis toi-même, sans outil automatique.
- Après chaque lot de 4 fichiers, valide avec : python3 /home/claude/work/tools/i18n_check_chunk.py {lang} <k1> <k2> ... (doit afficher errors 0) et corrige. Réponds en une ligne à la fin.
""")
