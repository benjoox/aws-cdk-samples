import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as cdk from 'aws-cdk-lib'
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2'
import * as elasticloadbalancingv2targets from 'aws-cdk-lib/aws-elasticloadbalancingv2-targets'
import { Construct } from 'constructs'

interface LoadbalancerStackProps extends cdk.StackProps {
  vpc: ec2.Vpc
  sg: ec2.SecurityGroup
  videoInstance1: ec2.Instance
  videoInstance2: ec2.Instance
  webInstance1: ec2.Instance
  webInstance2: ec2.Instance
}

export class LoadbalancerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LoadbalancerStackProps) {
    super(scope, id, props)
    const {
      vpc,
      sg,
      videoInstance1,
      videoInstance2,
      webInstance1,
      webInstance2,
    } = props

    const alb = new elbv2.ApplicationLoadBalancer(this, 'alb', {
      vpc,
      internetFacing: true,
      securityGroup: sg,
    })

    const registeredVideoInstance1 = new elasticloadbalancingv2targets.InstanceTarget(
      videoInstance1
    )
    const registeredVideoInstance2 = new elasticloadbalancingv2targets.InstanceTarget(
      videoInstance2
    )

    const videoTargets = new elbv2.ApplicationTargetGroup(
      this,
      'videoTargets',
      {
        targetGroupName: 'videoTargets',
        protocol: elbv2.ApplicationProtocol.HTTP,
        port: 80,
        vpc,
        targets: [registeredVideoInstance1, registeredVideoInstance2],
      }
    )

    const registeredWebInstance1 = new elasticloadbalancingv2targets.InstanceTarget(
      webInstance1
    )
    const registeredWebInstance2 = new elasticloadbalancingv2targets.InstanceTarget(
      webInstance2
    )

    const webTargets = new elbv2.ApplicationTargetGroup(this, 'webTargets', {
      targetGroupName: 'webTargets',
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: 80,
      vpc,
      targetType: elbv2.TargetType.INSTANCE,
      targets: [registeredWebInstance1, registeredWebInstance2],
    })

    webTargets.addTarget()

    alb.addListener('Listener', {
      port: 80,
      open: true,
      defaultAction: elbv2.ListenerAction.weightedForward([
        {
          targetGroup: videoTargets,
          weight: 50,
        },
        {
          targetGroup: webTargets,
          weight: 50,
        },
      ]),
    })

    const nlb = new elbv2.NetworkLoadBalancer(this, 'nlb', {
      vpc,
      internetFacing: true,
    })

    const nlbTargetGroup = new elbv2.NetworkTargetGroup(
      this,
      'NLBVideoTargets',
      {
        targetGroupName: 'nlbVideoTargets',
        protocol: elbv2.Protocol.TCP,
        port: 80,
        vpc,
        targets: [registeredVideoInstance1],
      }
    )

    nlb.addListener('Listener', {
      port: 80,
      defaultTargetGroups: [nlbTargetGroup],
    })

    console.log({ alb, nlb })
  }
}
