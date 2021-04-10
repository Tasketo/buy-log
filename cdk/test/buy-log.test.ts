import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as BackendStack from '../lib/backend-stack';
import * as FrontendStack from '../lib/frontend-stack';

test('Empty Stack', () => {
  const app = new cdk.App();
  // WHEN
  const stackBackend = new BackendStack.BackendStack(app, 'MyTestStack');
  // THEN
  expectCDK(stackBackend).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))


  // WHEN
  const stackFrontend = new FrontendStack.FrontendStack(app, 'MyTestStack');
  // THEN
  expectCDK(stackFrontend).to(matchTemplate({
    "Resources": {}
  }, MatchStyle.EXACT))
});
