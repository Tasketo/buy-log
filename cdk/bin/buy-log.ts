#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BackendStack } from '../lib/backend-stack';
import { FrontendStack } from '../lib/frontend-stack';

import { prefix } from '../../env.json'

const accountSettings = {
    account: process.env.CDK_DEPLOY_ACCOUNT || process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEPLOY_REGION || process.env.CDK_DEFAULT_REGION
}

const app = new cdk.App();
new BackendStack(app, 'backend', { stackName: `${prefix}-backend`, env: accountSettings });
new FrontendStack(app, 'frontend', { stackName: `${prefix}-frontend`, env: accountSettings });
