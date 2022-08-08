#!/usr/bin/env node

import * as cdk from 'aws-cdk-lib'
import { VPC } from '../lib/vpc'
import { Ec2Instances } from '../lib/ec2Instances'
import { SecurityGroups } from '../lib/securityGroups'
import { LoadbalancerStack } from '../lib/loadBalancerStack'

const app = new cdk.App()

const { vpc } = new VPC(app, 'VPC', {})

const { sg } = new SecurityGroups(app, 'SecurityGroups', {
  vpc,
})

const {
  videoInstance1,
  videoInstance2,
  webInstance1,
  webInstance2,
} = new Ec2Instances(app, 'Ec2Instances', {
  vpc,
  sg,
})

new LoadbalancerStack(app, 'LoadbalancerStack', {
  vpc,
  sg,
  videoInstance1,
  videoInstance2,
  webInstance1,
  webInstance2,
})
