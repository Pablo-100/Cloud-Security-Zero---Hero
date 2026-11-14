/* ===== Résolution d'icônes AWS ===== */
const AWSK=new Set(AWS_ICON_KEYS), AWSRES=new Set(AWS_RES_KEYS);
const LEG2AWS={user:'user',role:'role',policy:'permissions',compute:'ec2',storage:'s3',db:'database',key:'kms',network:'vpc',shield:'shield',log:'cloudwatch',api:'apigw',queue:'sqs',idp:'saml',org:'orgs',device:'client',cloud:'internet',lock:'padlock',skull:'bot',generic:'gear'};
const KIND2AWS={user:'user',app:'server',idp:'saml',aws:'console',store:'s3',network:'vpc',key:'kms',attacker:'bot',service:'lambda',generic:'gear'};
/* devine l'icône d'après le libellé (ordre = priorité) */
const GUESS=[
 [/cloudhsm|\bhsm\b/i,'cloudhsm'],[/\bkms\b|\bcmk\b|customer managed key/i,'kms'],[/secrets? manager/i,'secrets'],
 [/cloudtrail/i,'cloudtrail'],[/cloudwatch|\balarm/i,'cloudwatch'],[/guardduty/i,'guardduty'],[/inspector/i,'inspector'],[/macie/i,'macie'],[/detective/i,'detective'],
 [/security hub/i,'securityhub'],[/firewall manager/i,'firewallmgr'],[/network firewall/i,'networkfw'],[/shield/i,'shield'],[/\bwaf\b/i,'waf'],
 [/certificate manager|\bacm\b/i,'acm'],[/control tower/i,'controltower'],[/organizations?\b|\bscp\b|\bou\b/i,'orgs'],[/aws config|config rule|\bconfig\b/i,'config'],
 [/systems manager|\bssm\b|parameter store/i,'ssm'],[/cloudformation|\bcfn\b/i,'cloudformation'],[/trusted advisor/i,'trustedadvisor'],[/access analyzer/i,'accessanalyzer'],
 [/identity center|\bsso\b|single sign/i,'sso'],[/cognito/i,'cognito'],[/directory|active directory|\bldap\b/i,'directory'],
 [/\bsts\b|assumerole|assume role/i,'sts'],[/\bmfa\b|\btotp\b/i,'mfa'],[/saml|\bidp\b|okta|entra|identity provider|fournisseur d'identit/i,'saml'],
 [/iam role|\brôle\b|\brole\b/i,'role'],[/polic|politique|permission/i,'permissions'],[/\biam\b/i,'iam'],
 [/lambda/i,'lambda'],[/fargate/i,'fargate'],[/\becs\b/i,'ecs'],[/\beks\b|kubernetes/i,'eks'],[/\becr\b/i,'ecr'],[/\bec2\b|instance|\bvm\b/i,'ec2'],
 [/aurora|\brds\b/i,'rds'],[/dynamodb/i,'dynamodb'],[/elasticache|redis/i,'elasticache'],[/redshift/i,'redshift'],
 [/\bebs\b|\bvolume/i,'ebs'],[/\befs\b/i,'efs'],[/glacier/i,'glacier'],[/\bs3\b|bucket/i,'s3'],[/backup/i,'backup'],
 [/\bsns\b/i,'sns'],[/\bsqs\b|\bqueue\b|file d'attente/i,'sqs'],[/eventbridge/i,'eventbridge'],[/step functions/i,'stepfunctions'],[/api gateway|apigw/i,'apigw'],
 [/cloudfront|\bcdn\b/i,'cloudfront'],[/route ?53|\bdns\b/i,'route53'],[/\balb\b|\bnlb\b|\belb\b|load balancer|équilibreur/i,'elb'],
 [/privatelink|vpc endpoint/i,'privatelink'],[/transit gateway|\btgw\b/i,'tgw'],[/direct connect/i,'directconnect'],[/client vpn/i,'clientvpn'],[/\bvpn\b/i,'vpn'],
 [/\bvpc\b|subnet|gateway|\bnat\b|security group|\bnacl\b/i,'vpc'],
 [/athena/i,'athena'],[/\bglue\b/i,'glue'],[/kinesis/i,'kinesis'],[/firehose/i,'firehose'],[/opensearch|elasticsearch/i,'opensearch'],
 [/codepipeline/i,'codepipeline'],[/codebuild/i,'codebuild'],[/codecommit/i,'codecommit'],[/codedeploy/i,'codedeploy'],
 [/\bcli\b/i,'cli'],[/\bsdk\b/i,'sdk'],[/console/i,'console'],[/x-ray|xray/i,'xray'],[/nitro/i,'nitro'],
 [/attaquant|attacker|hacker|malware|pirate|bot\b|menace|threat|adversaire/i,'bot'],
 [/mobile/i,'mobile'],[/navigateur|browser|client\b|front|application web|web app/i,'client'],
 [/utilisateur|\buser\b|alice|bob|développeur|admin|étudiant|employé|personne/i,'user'],
 [/on-?prem|datacenter|data center|entreprise|siège|société|organisation|company/i,'building'],
 [/base de donn|database|\bdb\b/i,'database'],[/serveur|server|backend|\bapp\b|application/i,'server'],
 [/internet|public|\bweb\b/i,'internet'],[/pare-?feu|firewall/i,'firewall'],[/certificat|cl[ée]|chiffr|encrypt/i,'padlock'],
 [/journal|\blogs?\b|audit/i,'document'],[/document|fichier|rapport/i,'document']
];
function resolveIcon(label,sub,hint,kind){
  if(hint&&AWSK.has(hint)) return hint;
  const L=String(label||''); for(const [re,k] of GUESS) if(re.test(L)) return k;
  const S=String(sub||''); for(const [re,k] of GUESS) if(re.test(S)) return k;
  if(hint&&LEG2AWS[hint]) return LEG2AWS[hint];
  if(kind&&KIND2AWS[kind]) return KIND2AWS[kind];
  return 'gear';
}
/* icône DOM (HTML) : <svg><use/></svg> */
function aico(key,size,cls){
  if(!AWSK.has(key)) key=LEG2AWS[key]||'gear';
  const wrap=document.createElement('span'); wrap.className='aico'+(AWSRES.has(key)?' res':'')+(cls?' '+cls:''); wrap.style.setProperty('--s',(size||40)+'px');
  wrap.innerHTML=`<svg viewBox="0 0 ${size||40} ${size||40}" width="${size||40}" height="${size||40}" aria-hidden="true" focusable="false"><use href="#i-${key}" width="${size||40}" height="${size||40}"/></svg>`;
  return wrap;
}
/* icône SVG (dans un diagramme) */
function sico(key,x,y,size){
  if(!AWSK.has(key)) key=LEG2AWS[key]||'gear';
  const u=s('use',{href:'#i-'+key,x,y,width:size,height:size,class:'sico'+(AWSRES.has(key)?' res':'')});
  if(!AWSRES.has(key)){ u.setAttribute('clip-path','url(#aws-round)'); return u; }
  const g=s('g',{class:'sico-g'});
  g.appendChild(s('rect',{x:x-2,y:y-2,width:size+4,height:size+4,rx:size*.2,class:'sico-bg'}));
  g.appendChild(u); return g;
}
const KEYNAMES={iam:'IAM',sts:'AWS STS',role:'IAM Role',permissions:'Policies',mfa:'MFA',tempcred:TK('Credentials temporaires'),longcred:TK('Credentials long terme'),saml:'SAML',sso:'IAM Identity Center',cognito:'Amazon Cognito',kms:'AWS KMS',s3:'Amazon S3',ec2:'Amazon EC2',vpc:'Amazon VPC',user:TK('Utilisateur'),users:TK('Utilisateurs'),client:TK('Client'),internet:TK('Internet'),bot:TK('Attaquant'),server:TK('Serveur'),database:TK('Base de données'),padlock:TK('Chiffrement'),document:TK('Document'),firewall:TK('Pare-feu'),building:TK('Entreprise'),gear:TK('Composant'),mobile:TK('Mobile')};
