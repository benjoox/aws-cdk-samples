#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkAlbSampleAppStack } from '../lib/cdk-alb-sample-app-stack';

const app = new cdk.App();
new CdkAlbSampleAppStack(app, 'CdkAlbSampleAppStack');
