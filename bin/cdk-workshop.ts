#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { CdkWorkshopStack } from '../lib/cdk-workshop-stack';

const app = new cdk.App();
const envUS  = { 
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1' 
};
new CdkWorkshopStack(app, 'CdkWorkshopStack', { env: envUS} );
