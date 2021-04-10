import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, RestApi } from "@aws-cdk/aws-apigateway";
import { UserPool } from "@aws-cdk/aws-cognito";
import { AttributeType, BillingMode, StreamViewType, Table } from "@aws-cdk/aws-dynamodb";
import { AssetCode, Function, FunctionProps, Runtime } from "@aws-cdk/aws-lambda";
import { CfnOutput, Construct, RemovalPolicy } from "@aws-cdk/core";

export interface IOptions {
    primaryKey?: string,
    userKey?: string,
    userRelatedResource?: boolean,
    userPool?: UserPool,
    model?: any,
    identityPoolId?: string,
    bucketName?: string,
    prefix: string,
}

export default (scope: Construct, resourceName: string, options: IOptions) => {
    const primaryKey = options.primaryKey || 'itemId';
    const userKey = options.userKey || 'userId';
    const userRelatedResource = options.userRelatedResource || false;

    const tableParams: any = {};
    if (userRelatedResource) {
        tableParams.sortKey = {
            name: userKey,
            type: AttributeType.STRING,
        }
    }
    const dynamoTable = new Table(scope, resourceName, {
        partitionKey: {
            name: primaryKey,
            type: AttributeType.STRING
        },
        tableName: resourceName,
        stream: StreamViewType.NEW_AND_OLD_IMAGES,
        removalPolicy: RemovalPolicy.DESTROY,
        billingMode: BillingMode.PAY_PER_REQUEST,
        ...tableParams
    });

    // const sharedLayer = new LayerVersion(scope, 'shared', {
    //     code: new AssetCode('src/lambda/layer'),
    //     compatibleRuntimes: [Runtime.NODEJS_14_X],
    //     description: 'Api Handler Shared code (node_modules, utils)',
    // });

    const lambdaOptions: FunctionProps = {
        handler: '',
        code: new AssetCode('lambda-dist/entry'),
        runtime: Runtime.NODEJS_14_X,
        // layers: [sharedLayer],
        environment: {
            TABLE_NAME: resourceName,
            PRIMARY_KEY: primaryKey,
            USER_KEY: userKey,
            USER_CHECK_ENABLED: userRelatedResource ? '1' : '0',
            IDENTITY_POOL_ID: options.identityPoolId || '',
        },
        logRetention: 30
    }

    const getOneLambda = new Function(scope, `${resourceName}-getOneItemFunction`, {
        ...lambdaOptions,
        handler: 'get-one.handler'
    });
    dynamoTable.grantReadData(getOneLambda);

    const getAllLambda = new Function(scope, `${resourceName}-getAllItemsFunction`, {
        ...lambdaOptions,
        handler: 'get-all.handler',
    });
    dynamoTable.grantReadData(getAllLambda);

    const createOneLambda = new Function(scope, `${resourceName}-createItemFunction`, {
        ...lambdaOptions,
        handler: 'create.handler',
    });
    dynamoTable.grantWriteData(createOneLambda);

    const updateOneLambda = new Function(scope, `${resourceName}-updateItemFunction`, {
        ...lambdaOptions,
        handler: 'update-one.handler',
    });
    dynamoTable.grantWriteData(updateOneLambda);

    const deleteOneLambda = new Function(scope, `${resourceName}-deleteItemFunction`, {
        ...lambdaOptions,
        handler: 'delete-one.handler',
    });
    dynamoTable.grantWriteData(deleteOneLambda);

    const api = new RestApi(scope, `${resourceName}-api`, {
        restApiName: `${resourceName} Service`,
        defaultCorsPreflightOptions: {
            allowOrigins: Cors.ALL_ORIGINS,
            allowMethods: Cors.ALL_METHODS,
            allowCredentials: true,
            disableCache: true,
        },
    });
    new CfnOutput(scope, `${resourceName}-endpoint`, { value: api.url, exportName: `${options.prefix}-${resourceName}-endpoint` });

    let methodOptions: any = {};
    if (options.userPool) {
        const authorizer = new CognitoUserPoolsAuthorizer(scope, 'cognito-authorizer', {
            cognitoUserPools: [options.userPool]
        })
        methodOptions.authorizer = authorizer;
        methodOptions.authorizationType = AuthorizationType.COGNITO;
    }

    // TODO: request validation
    // if (options.model) {
    //     methodOptions.requestValidator = new RequestValidator(scope, `${resourceName}-validator`, {
    //         restApi: api,
    //         validateRequestBody: true,
    //         validateRequestParameters: true,
    //     })

    //     methodOptions.requestModels = {
    //         "application/json": new Model(scope, `${resourceName}-model`, {
    //             restApi: api,
    //             contentType: "application/json",
    //             description: "Payload used to validate",
    //             schema: options.model
    //         })
    //     }
    // }

    const items = api.root.addResource(resourceName, {});

    const getAllIntegration = new LambdaIntegration(getAllLambda);
    items.addMethod('GET', getAllIntegration, methodOptions);

    const createOneIntegration = new LambdaIntegration(createOneLambda);
    items.addMethod('POST', createOneIntegration, methodOptions);

    const singleItem = items.addResource('{id}', {});
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    singleItem.addMethod('GET', getOneIntegration, methodOptions);

    const updateOneIntegration = new LambdaIntegration(updateOneLambda);
    singleItem.addMethod('PUT', updateOneIntegration, methodOptions);

    const deleteOneIntegration = new LambdaIntegration(deleteOneLambda);
    singleItem.addMethod('DELETE', deleteOneIntegration, methodOptions);

    return { dynamoTable }
}