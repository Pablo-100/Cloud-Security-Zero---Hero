import re, os, glob, json
ROOT='/tmp/icons/aws-icons-svg/q1-2022'
ARCH=ROOT+'/Architecture-Service-Icons_01312022'
RES=ROOT+'/Resource-Icons_01312022'
# key -> (kind, name, label)
A={ # service icons (colored square)
'iam':'AWS-Identity-and-Access-Management','kms':'AWS-Key-Management-Service','secrets':'AWS-Secrets-Manager',
'cognito':'Amazon-Cognito','sso':'AWS-Single-Sign-On','directory':'AWS-Directory-Service','orgs':'AWS-Organizations',
'guardduty':'Amazon-GuardDuty','inspector':'Amazon-Inspector','macie':'Amazon-Macie','detective':'Amazon-Detective',
'securityhub':'AWS-Security-Hub','waf':'AWS-WAF','shield':'AWS-Shield','firewallmgr':'AWS-Firewall-Manager',
'networkfw':'AWS-Network-Firewall','acm':'AWS-Certificate-Manager','cloudhsm':'AWS-CloudHSM','artifact':'AWS-Artifact',
'auditmgr':'AWS-Audit-Manager','ram':'AWS-Resource-Access-Manager','signer':'AWS-Signer',
'cloudtrail':'AWS-CloudTrail','config':'AWS-Config','cloudwatch':'Amazon-CloudWatch','ssm':'AWS-Systems-Manager',
'controltower':'AWS-Control-Tower','cloudformation':'AWS-CloudFormation','trustedadvisor':'AWS-Trusted-Advisor',
'servicecatalog':'AWS-Service-Catalog','incidentmgr':'AWS-Systems-Manager-Incident-Manager','chatbot':'AWS-Chatbot',
'appconfig':'AWS-AppConfig','console':'AWS-Management-Console','health':'AWS-Personal-Health-Dashboard',
'ec2':'Amazon-EC2','lambda':'AWS-Lambda','fargate':'AWS-Fargate','autoscaling':'Amazon-EC2-Auto-Scaling',
'beanstalk':'AWS-Elastic-Beanstalk','nitro':'AWS-Nitro-Enclaves','batch':'AWS-Batch','lightsail':'Amazon-Lightsail',
'ecs':'Amazon-Elastic-Container-Service','eks':'Amazon-Elastic-Kubernetes-Service','ecr':'Amazon-Elastic-Container-Registry',
's3':'Amazon-Simple-Storage-Service','glacier':'Amazon-Simple-Storage-Service-Glacier','ebs':'Amazon-Elastic-Block-Store',
'efs':'Amazon-EFS','fsx':'Amazon-FSx','backup':'AWS-Backup','storagegw':'AWS-Storage-Gateway','snowball':'AWS-Snowball',
'rds':'Amazon-RDS','aurora':'Amazon-Aurora','dynamodb':'Amazon-DynamoDB','elasticache':'Amazon-ElastiCache',
'redshift':'Amazon-Redshift','documentdb':'Amazon-DocumentDB','neptune':'Amazon-Neptune','dms':'AWS-Database-Migration-Service',
'vpc':'Amazon-Virtual-Private-Cloud','cloudfront':'Amazon-CloudFront','route53':'Amazon-Route-53','elb':'Elastic-Load-Balancing',
'directconnect':'AWS-Direct-Connect','vpn':'AWS-Site-to-Site-VPN','clientvpn':'AWS-Client-VPN','privatelink':'AWS-PrivateLink',
'tgw':'AWS-Transit-Gateway','globalaccel':'AWS-Global-Accelerator','apigw':'Amazon-API-Gateway','appsync':'AWS-AppSync',
'sns':'Amazon-Simple-Notification-Service','sqs':'Amazon-Simple-Queue-Service','eventbridge':'Amazon-EventBridge',
'stepfunctions':'AWS-Step-Functions','mq':'Amazon-MQ','kinesis':'Amazon-Kinesis','firehose':'Amazon-Kinesis-Firehose',
'athena':'Amazon-Athena','glue':'AWS-Glue','opensearch':'Amazon-OpenSearch-Service','quicksight':'Amazon-QuickSight',
'lakeformation':'AWS-Lake-Formation','emr':'Amazon-EMR','msk':'Amazon-Managed-Streaming-for-Apache-Kafka',
'codecommit':'AWS-CodeCommit','codebuild':'AWS-CodeBuild','codedeploy':'AWS-CodeDeploy','codepipeline':'AWS-CodePipeline',
'codeartifact':'AWS-CodeArtifact','cli':'AWS-Command-Line-Interface','sdk':'AWS-Tools-and-SDKs','xray':'AWS-X-Ray',
'cloudshell':'AWS-CloudShell','cdk':'AWS-Cloud-Development-Kit','amplify':'AWS-Amplify','workspaces':'Amazon-WorkSpaces',
'appstream':'Amazon-AppStream','sagemaker':'Amazon-SageMaker','rekognition':'Amazon-Rekognition','comprehend':'Amazon-Comprehend',
'iotcore':'AWS-IoT-Core','cloudmap':'AWS-Cloud-Map','appmesh':'AWS-App-Mesh','datasync':'AWS-DataSync','transfer':'AWS-Transfer-Family',
'ses':'Amazon-Simple-Email-Service','connect':'Amazon-Connect','outposts':'AWS-Outposts-family','wavelength':'AWS-Wavelength',
'localzones':'AWS-Local-Zones','budgets':'AWS-Budgets','costexplorer':'AWS-Cost-Explorer','opsworks':'AWS-OpsWorks',
'support':'AWS-Support','proton':'AWS-Proton','resiliencehub':'AWS-Resilience-Hub','fis':'AWS-Fault-Injection-Simulator',
'apprunner':'AWS-App-Runner','imagebuilder':'Amazon-EC2-Image-Builder','licensemgr':'AWS-License-Manager','cloud9':'AWS-Cloud9',
'cloudcontrol':'AWS-Cloud-Control-API','cloudwan':'AWS-Cloud-WAN','drs':'CloudEndure-Disaster-Recovery',
'migrationhub':'AWS-Migration-Hub','mgn':'AWS-Application-Migration-Service','pinpoint':'Amazon-Pinpoint',
'locationsvc':'Amazon-Location-Service','timestream':'Amazon-Timestream','keyspaces':'Amazon-Keyspaces','memorydb':'Amazon-MemoryDB-for-Redis',
'devopsguru':'Amazon-DevOps-Guru','codeguru':'Amazon-CodeGuru','grafana':'Amazon-Managed-Service-for-Grafana','prometheus':'Amazon-Managed-Service-for-Prometheus',
'cloudsearch':'Amazon-CloudSearch','workdocs':'Amazon-WorkDocs','workmail':'Amazon-WorkMail','chime':'Amazon-Chime',
'otel':'AWS-Distro-for-OpenTelemetry','wellarch':'AWS-Well-Architected-Tool','launchwizard':'AWS-Launch-Wizard',
}
R={ # resource icons (glyph) : key -> (category, name)
'role':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Role'),
'permissions':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Permissions'),
'sts':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_AWS-STS'),
'mfa':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_MFA-Token'),
'tempcred':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Temporary-Security-Credential'),
'longcred':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Long-Term-Security-Credential'),
'datakey':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Data-Encryption-Key'),
'encdata':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_Encrypted-Data'),
'accessanalyzer':('Security-Identity-and-Compliance','AWS-Identity-Access-Management_AWS-IAM-Access-Analyzer'),
'finding':('Security-Identity-and-Compliance','AWS-Security-Hub_Finding'),
'wafrule':('Security-Identity-and-Compliance','AWS-WAF_Rule'),
'managedrule':('Security-Identity-and-Compliance','AWS-WAF_Managed-Rule'),
'bot':('Security-Identity-and-Compliance','AWS-WAF_Bad-Bot'),
'saml':('General-Icons','SAML-token'),
'user':('General-Icons','User'),
'users':('General-Icons','Users'),
'client':('General-Icons','Client'),
'mobile':('General-Icons','Mobile-client'),
'internet':('General-Icons','Internet'),
'firewall':('General-Icons','Firewall'),
'padlock':('General-Icons','SSL-padlock'),
'document':('General-Icons','Documents'),
'server':('General-Icons','Traditional-server'),
'database':('General-Icons','Generic-database'),
'building':('General-Icons','Office-building'),
'gear':('General-Icons','Gear'),
'disk':('General-Icons','Disk'),
'sdkres':('General-Icons','SDK'),
'question':('General-Icons','Question'),
'email':('General-Icons','Email'),
'ca':('Security-Identity-and-Compliance','AWS-Certificate-Manager_Certificate-Authority'),
'adconnector':('Security-Identity-and-Compliance','AWS-Directory-Service_AD-Connector'),
'managedad':('Security-Identity-and-Compliance','AWS-Directory-Service_AWS-Managed-Microsoft-AD'),
'inspectoragent':('Security-Identity-and-Compliance','Amazon-Inspector_Agent'),
'shieldadv':('Security-Identity-and-Compliance','AWS-Shield_AWS-Shield-Advanced'),
}
def find_arch(name):
    for p in glob.glob(f'{ARCH}/*/Arch_64/Arch_{name}_64.svg')+glob.glob(f'{ARCH}/*/64/Arch_{name}_64.svg'):
        return p
def find_res(cat,name):
    for p in glob.glob(f'{RES}/Res_{cat}/Res_48_Light/Res_{name}_48_Light.svg'):
        return p
def to_symbol(key,path):
    s=open(path,encoding='utf8').read()
    s=re.sub(r'<\?xml.*?\?>','',s); s=re.sub(r'<!--.*?-->','',s,flags=re.S)
    s=re.sub(r'<title>.*?</title>','',s,flags=re.S); s=re.sub(r'<desc>.*?</desc>','',s,flags=re.S)
    m=re.search(r'<svg[^>]*viewBox="([^"]+)"[^>]*>(.*)</svg>',s,flags=re.S)
    vb,inner=m.group(1),m.group(2)
    ids=set(re.findall(r'\bid="([^"]+)"',inner))
    for i in ids:
        inner=inner.replace(f'id="{i}"',f'id="{key}-{i}"').replace(f'url(#{i})',f'url(#{key}-{i})').replace(f'href="#{i}"',f'href="#{key}-{i}"')
    # drop ids on plain groups (unreferenced)
    inner=re.sub(r'\s+id="'+re.escape(key)+r'-(?!linearGradient|path|mask|filter|radial|clip|use|a-|b-)[^"]*"','',inner)
    inner=re.sub(r'(\d+\.\d{2})\d+',r'\1',inner)
    inner=re.sub(r'\s+',' ',inner).replace('> <','><').strip()
    return f'<symbol id="i-{key}" viewBox="{vb}">{inner}</symbol>'
out={}; miss=[]
for k,n in A.items():
    p=find_arch(n)
    if not p: miss.append(k); continue
    out[k]=to_symbol(k,p)
for k,(c,n) in R.items():
    p=find_res(c,n)
    if not p: miss.append(k); continue
    out[k]=to_symbol('r-'+k,p).replace(f'id="i-r-{k}"',f'id="i-{k}"')
print('icons',len(out),'missing',miss)
sprite=''.join(out.values())
js='/* AWS Architecture Icons (official set, Q1-2022) — © Amazon Web Services, used for educational diagrams. */\nconst AWS_SPRITE='+json.dumps(sprite)+';\nconst AWS_ICON_KEYS='+json.dumps(sorted(out))+';\nconst AWS_RES_KEYS='+json.dumps(sorted(R.keys()))+';\n'
open('/home/claude/work/engine/js/05_icons.js','w',encoding='utf8').write(js)
print(len(js)//1024,'KB')
