import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as cdk from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as path from 'path'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'
import { Construct } from 'constructs'

interface Ec2InstancesProps extends cdk.StackProps {
  vpc: ec2.Vpc
  sg: ec2.SecurityGroup
}

export class Ec2Instances extends cdk.Stack {
  public readonly vpc: ec2.Vpc
  public readonly sg: ec2.SecurityGroup

  public readonly videoInstance1: ec2.Instance
  public readonly videoInstance2: ec2.Instance
  public readonly webInstance1: ec2.Instance
  public readonly webInstance2: ec2.Instance

  constructor(scope: Construct, id: string, props: Ec2InstancesProps) {
    super(scope, id, props)

    const { vpc, sg } = props

    const role = new iam.Role(this, 'ec2Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    })

    role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore')
    )

    // Use Latest Amazon Linux Image - CPU Type ARM64
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.ARM_64,
    })

    // Create the instance using the Security Group, AMI, and KeyPair defined in the VPC created
    const videoInstance1 = new ec2.Instance(this, 'videoInstance1', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: sg,
      keyName: 'video-server-key',
      role: role,
    })

    // Create an asset that will be used as part of User Data to run on first load
    const asset = new Asset(this, 'Asset', {
      path: path.join(__dirname, '../src/videoInstance1.sh'),
    })
    const localPath = videoInstance1.userData.addS3DownloadCommand({
      bucket: asset.bucket,
      bucketKey: asset.s3ObjectKey,
    })

    videoInstance1.userData.addExecuteFileCommand({
      filePath: localPath,
      arguments: '--verbose -y',
    })
    asset.grantRead(videoInstance1.role)

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'IP Address', {
      value: videoInstance1.instancePublicIp,
    })
    // new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName })
    new cdk.CfnOutput(this, 'Download Key Command', {
      value:
        'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem',
    })
    new cdk.CfnOutput(this, 'ssh command', {
      value:
        'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' +
        videoInstance1.instancePublicIp,
    })

    const videoInstance2 = new ec2.Instance(this, 'videoInstance2', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: sg,
      keyName: 'video-server-key',
      role: role,
    })

    // Create an asset that will be used as part of User Data to run on first load
    const assetVideoInstance2 = new Asset(this, 'AssetVideoInstance2', {
      path: path.join(__dirname, '../src/videoInstance2.sh'),
    })
    const localPathVideoInstance2 = videoInstance2.userData.addS3DownloadCommand(
      {
        bucket: assetVideoInstance2.bucket,
        bucketKey: assetVideoInstance2.s3ObjectKey,
      }
    )

    videoInstance2.userData.addExecuteFileCommand({
      filePath: localPathVideoInstance2,
      arguments: '--verbose -y',
    })
    assetVideoInstance2.grantRead(videoInstance2.role)

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'IP Address Video Instance 2', {
      value: videoInstance2.instancePublicIp,
    })
    // new cdk.CfnOutput(this, 'Key Name', { value: key.keyPairName })
    new cdk.CfnOutput(this, 'Download Key Command Video Instance 2', {
      value:
        'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem',
    })
    new cdk.CfnOutput(this, 'ssh command Video Instance 2', {
      value:
        'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' +
        videoInstance2.instancePublicIp,
    })

    const webInstance1 = new ec2.Instance(this, 'webInstance1', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: sg,
      keyName: 'video-server-key',
      role: role,
    })

    // Create an asset that will be used as part of User Data to run on first load
    const assetWebInstance1 = new Asset(this, 'AssetWebInstance1', {
      path: path.join(__dirname, '../src/webInstance1.sh'),
    })
    const localPathWebInstance1 = webInstance1.userData.addS3DownloadCommand({
      bucket: assetWebInstance1.bucket,
      bucketKey: assetWebInstance1.s3ObjectKey,
    })

    webInstance1.userData.addExecuteFileCommand({
      filePath: localPathWebInstance1,
      arguments: '--verbose -y',
    })
    assetWebInstance1.grantRead(webInstance1.role)

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'IP Address WebInstance1', {
      value: webInstance1.instancePublicIp,
    })
    // new cdk.CfnOutput(this, 'Key Name WebInstance1', { value: key.keyPairName })
    new cdk.CfnOutput(this, 'Download Key Command WebInstance1', {
      value:
        'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem',
    })
    new cdk.CfnOutput(this, 'ssh command WebInstance1', {
      value:
        'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' +
        webInstance1.instancePublicIp,
    })

    const webInstance2 = new ec2.Instance(this, 'webInstance2', {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: sg,
      keyName: 'video-server-key',
      role: role,
    })

    // Create an asset that will be used as part of User Data to run on first load
    const assetWebInstance2 = new Asset(this, 'AssetWebInstance2', {
      path: path.join(__dirname, '../src/webInstance2.sh'),
    })
    const localPathWebInstance2 = webInstance2.userData.addS3DownloadCommand({
      bucket: assetWebInstance2.bucket,
      bucketKey: assetWebInstance2.s3ObjectKey,
    })

    webInstance2.userData.addExecuteFileCommand({
      filePath: localPathWebInstance2,
      arguments: '--verbose -y',
    })
    assetWebInstance2.grantRead(webInstance2.role)

    // Create outputs for connecting
    new cdk.CfnOutput(this, 'IP Address webInstance2', {
      value: webInstance2.instancePublicIp,
    })
    // new cdk.CfnOutput(this, 'Key Name webInstance2', { value: key.keyPairName })
    new cdk.CfnOutput(this, 'Download Key Command webInstance2', {
      value:
        'aws secretsmanager get-secret-value --secret-id ec2-ssh-key/cdk-keypair/private --query SecretString --output text > cdk-key.pem && chmod 400 cdk-key.pem',
    })
    new cdk.CfnOutput(this, 'ssh command webInstance2', {
      value:
        'ssh -i cdk-key.pem -o IdentitiesOnly=yes ec2-user@' +
        webInstance2.instancePublicIp,
    })

    this.videoInstance1 = videoInstance1
    this.videoInstance2 = videoInstance2
    this.webInstance1 = webInstance1
    this.webInstance2 = webInstance2
  }
}
