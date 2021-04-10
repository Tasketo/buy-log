import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

import getUserId from './utils/get-user-id-from-event'
import getCommonResponseHeaders from './utils/get-common-response-headers'
import { unmarshall } from '@aws-sdk/util-dynamodb';

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

        const data = await client.send(new GetItemCommand({
            TableName: TABLE_NAME,
            Key: key,
        }));
        if (!data.Item) {
            return { statusCode: 404, headers: getCommonResponseHeaders() };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(unmarshall(data.Item)),
            headers: getCommonResponseHeaders()
        };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, headers: getCommonResponseHeaders() };
    }
};