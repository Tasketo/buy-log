import { AttributeValue, DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';

import getUserId from './utils/get-user-id-from-event'
import getCommonResponseHeaders from './utils/get-common-response-headers'
import { marshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const USER_KEY = process.env.USER_KEY || '';
const USER_CHECK_ENABLED = process.env.USER_CHECK_ENABLED === '1';

const client = new DynamoDBClient({});

const propertiesDenyList = ["itemId", "createdAt"];
if (USER_CHECK_ENABLED) {
    propertiesDenyList.push(USER_KEY);
}

export const handler = async (event: any) => {
    try {
        const userId = getUserId(event);
        const { id } = event.pathParameters;

        const item = JSON.parse(event.body);
        item.updatedAt = new Date().toJSON();

        const properties = Object.keys(item).filter(x => !propertiesDenyList.includes(x));
        if (!item || properties.length < 1) {
            return { statusCode: 400, body: 'invalid request, no arguments provided' };
        }

        const key = { [PRIMARY_KEY]: { S: id } };
        if (USER_CHECK_ENABLED) {
            key[USER_KEY] = { S: userId };
        }

        const values = properties.reduce((previous: { [key: string]: any; }, key) => {
            previous[`:${key}`] = item[key];
            return previous;
        }, {});
        const names = properties.reduce((previous: { [key: string]: any; }, key) => {
            previous[`#${key}`] = key;
            return previous;
        }, {});

        await client.send(new UpdateItemCommand({
            TableName: TABLE_NAME,
            Key: key,
            UpdateExpression: `set ${properties.map(key => `#${key} = :${key}`).join(', ')}`,
            ExpressionAttributeNames: names,
            ExpressionAttributeValues: marshall(values),
        }));
        return { statusCode: 201, headers: getCommonResponseHeaders() };
    } catch (e) {
        if (e.code === 'ConditionalCheckFailed') {
            return { statusCode: 403, headers: getCommonResponseHeaders() };
        }
        console.error(e);
        return { statusCode: 500, headers: getCommonResponseHeaders() };
    }
};

// TODO: impl for 404