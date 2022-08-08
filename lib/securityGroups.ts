import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'

interface SecurityGroupsProps extends cdk.StackProps {
  vpc: ec2.Vpc
}

export class SecurityGroups extends cdk.Stack {
  public readonly sg: ec2.SecurityGroup

  constructor(scope: Construct, id: string, props: SecurityGroupsProps) {
    super(scope, id, props)

    const { vpc } = props

    // Allow SSH (TCP Port 22) access from anywhere
    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      vpc,
      description: 'Allow SSH (TCP port 22) in',
      allowAllOutbound: true,
    })
    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'Allow SSH Access'
    )
    this.sg = securityGroup
  }
}
