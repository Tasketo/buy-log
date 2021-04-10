import { AccountRecovery, Mfa, UserPool, VerificationEmailStyle, UserPoolClient, CfnIdentityPool, CfnIdentityPoolRoleAttachment, UserPoolOperation } from '@aws-cdk/aws-cognito';
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods } from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';
import { CfnOutput, Duration, RemovalPolicy } from '@aws-cdk/core';
import crudDynamoLambda from './modules/crud-dynamo-lambda-api'
import itemModel from './models/item'
import { Effect, FederatedPrincipal, ManagedPolicy, PolicyStatement, Role } from '@aws-cdk/aws-iam';
import { Function, AssetCode, Runtime, StartingPosition } from '@aws-cdk/aws-lambda';
import { DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Topic } from '@aws-cdk/aws-sns'
import { EmailSubscription } from '@aws-cdk/aws-sns-subscriptions';

import { prefix, domain, adminEmail } from '../../env.json';

export class BackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // https://docs.amplify.aws/lib/storage/getting-started/q/platform/js#manual-setup-import-storage-bucket
    const bucket = new Bucket(this, "attachments", {
      encryption: BucketEncryption.KMS_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [{
        allowedHeaders: ["*"],
        allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE],
        allowedOrigins: [`https://${domain}`, 'http://localhost:8080'],
        exposedHeaders: [
          "x-amz-server-side-encryption",
          "x-amz-request-id",
          "x-amz-id-2",
          "ETag"],
        maxAge: 3000
      }]
    })
    new cdk.CfnOutput(this, 'bucket', { value: bucket.bucketName, exportName: `${prefix}-attachment-bucket` });


    // https://docs.amplify.aws/cli/storage/import#configuring-iam-role-to-use-amplify-recommended-policies
    const managedS3Policy = new ManagedPolicy(this, 'buy-log-amplify-cognito-s3', {
      statements: [
        new PolicyStatement({
          sid: 'manage',
          actions: [
            "s3:GetObject",
            "s3:PutObject",
            "s3:DeleteObject"
          ],
          resources: [
            bucket.arnForObjects('private/${cognito-identity.amazonaws.com:sub}'),
            bucket.arnForObjects('private/${cognito-identity.amazonaws.com:sub}/*'),
          ],
          effect: Effect.ALLOW
        }),
        new PolicyStatement({
          sid: 'list',
          actions: [
            "s3:ListBucket"
          ],
          resources: [
            bucket.bucketArn
          ],
          conditions: {
            "StringLike": {
              "s3:prefix": [
                "private/${cognito-identity.amazonaws.com:sub}",
                "private/${cognito-identity.amazonaws.com:sub}/*"
              ]
            }
          },
          effect: Effect.ALLOW
        })
      ]
    })

    const userPool = new UserPool(this, prefix + '-user-pool', {
      userPoolName: 'buy-log',
      selfSignUpEnabled: true, // TODO: check for admin confirmation
      userVerification: {
        emailSubject: 'Verify your email for buy-log',
        emailBody: 'Hello,<br><br>Thanks for signing up to our buy-log!<br>Please confirm your using this verification code: {####}<br><br><br>Have a nice day!<br>buy-log Team',
        emailStyle: VerificationEmailStyle.CODE,
      },
      signInAliases: { username: true, email: true },
      standardAttributes: { email: { required: true, mutable: false } },
      mfa: Mfa.OFF,
      // mfaSecondFactor: { otp: true, sms: true },
      passwordPolicy: {
        minLength: 16,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
        tempPasswordValidity: Duration.days(3),
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
    });
    new CfnOutput(this, 'userPoolId', { value: userPool.userPoolId, exportName: `${prefix}-user-pool-id` })

    userPool.addDomain('buy-log-domain', {
      cognitoDomain: {
        domainPrefix: 'buy-log'
      }
    })

    const userPoolClient = new UserPoolClient(this, prefix + '-pool-client', {
      userPool,
    })
    new CfnOutput(this, 'userPoolWebClientId', { value: userPoolClient.userPoolClientId, exportName: `${prefix}-user-pool-client-id` })

    const identityPool = new CfnIdentityPool(this, prefix + '-identity-pool', {
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: userPoolClient.userPoolClientId,
        providerName: userPool.userPoolProviderName
      }]
    })
    new CfnOutput(this, 'identityPoolId', { value: identityPool.ref, exportName: `${prefix}-identity-pool-id` })

    const authenticatedRole = new Role(this, `${prefix}-cognito-role-authenticated`, {
      assumedBy: new FederatedPrincipal('cognito-identity.amazonaws.com', {
        "StringEquals": { "cognito-identity.amazonaws.com:aud": identityPool.ref },
        "ForAnyValue:StringLike": { "cognito-identity.amazonaws.com:amr": "authenticated" },
      }, "sts:AssumeRoleWithWebIdentity"),
    });
    authenticatedRole.addToPolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        "mobileanalytics:PutEvents",
        "cognito-sync:*",
        "cognito-identity:*"
      ],
      resources: ["*"],
    }));
    authenticatedRole.addManagedPolicy(managedS3Policy);
    new CfnIdentityPoolRoleAttachment(this, 'DefaultValid', {
      identityPoolId: identityPool.ref,
      roles: {
        'authenticated': authenticatedRole.roleArn
      }
    });

    const { dynamoTable } = crudDynamoLambda(this, 'items', {
      userRelatedResource: true,
      userPool,
      model: itemModel,
      identityPoolId: identityPool.ref,
      prefix,
    });

    const triggerFunction = new Function(this, 'trigger-function', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'items-db-trigger.handler',
      code: new AssetCode('src/lambda/items'),
      logRetention: 30,
      environment: {}
    });
    triggerFunction.addEventSource(new DynamoEventSource(dynamoTable, {
      startingPosition: StartingPosition.TRIM_HORIZON,
      batchSize: 10,
      bisectBatchOnError: true,
      retryAttempts: 2
    }))
    triggerFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['s3:DeleteObject'],
      resources: [bucket.bucketArn + '/*']
    }))

    const opsSnS = new Topic(this, 'sns-ops', {
      topicName: `${prefix}-operations`
    })
    opsSnS.addSubscription(new EmailSubscription(adminEmail));

    const signUpFunction = new Function(this, 'sign-up-function', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'sign-up.handler',
      code: new AssetCode('src/lambda/operations'),
      logRetention: 30,
      environment: { TOPIC_ARN: opsSnS.topicArn }
    });
    signUpFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["sns:Publish"],
      resources: [opsSnS.topicArn]
    }))

    userPool.addTrigger(UserPoolOperation.POST_CONFIRMATION, signUpFunction)
  }
}
