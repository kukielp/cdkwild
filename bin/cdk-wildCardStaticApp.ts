#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { wildCardStaticApp } from '../lib/wildCardStaticApp-stack';

const app = new cdk.App();
const envUS  = { 
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1' 
};
new wildCardStaticApp(app, 'wildCardStaticApp', { env: envUS} );
