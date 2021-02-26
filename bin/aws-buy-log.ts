#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsBuyLogStack } from '../lib/aws-buy-log-stack';

const app = new cdk.App();
new AwsBuyLogStack(app, 'AwsBuyLogStack');
