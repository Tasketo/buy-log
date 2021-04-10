import { DeleteItemCommand, DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

import getUserId from './utils/get-user-id-from-event'
import getCommonResponseHeaders from './utils/get-common-response-headers'

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const USER_KEY = process.env.USER_KEY || '';
const USER_CHECK_ENABLED = process.env.USER_CHECK_ENABLED === '1';

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
    try {
        const { id } = event.pathParameters;
        const userId = getUserId(event);

        const key = { [PRIMARY_KEY]: { S: id } };
        if (USER_CHECK_ENABLED) {
            key[USER_KEY] = { S: userId };
        }

        await client.send(new DeleteItemCommand({
            TableName: TABLE_NAME,
            Key: key,
        }));
        return { statusCode: 201, headers: getCommonResponseHeaders() };
    } catch (e) {
        if (e.code === 'ConditionalCheckFailed') {
            return { statusCode: 403, headers: getCommonResponseHeaders() };
        }
        console.error(e)
        return { statusCode: 500, headers: getCommonResponseHeaders() };
    }
};