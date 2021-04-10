import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuid } from 'uuid';

import getUserId from './utils/get-user-id-from-event'
import getCommonResponseHeaders from './utils/get-common-response-headers'

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const USER_KEY = process.env.USER_KEY || '';
const USER_CHECK_ENABLED = process.env.USER_CHECK_ENABLED === '1';

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
    try {
        const item = JSON.parse(event.body);
        item[PRIMARY_KEY] = uuid();
        item.createdAt = new Date().toJSON();
        item.updatedAt = new Date().toJSON();
        if (USER_CHECK_ENABLED) {
            item[USER_KEY] = getUserId(event)
        }

        await client.send(new PutItemCommand({
            TableName: TABLE_NAME,
            Item: marshall(item)
        }));
        return {
            statusCode: 200,
            body: JSON.stringify(item),
            headers: getCommonResponseHeaders()
        };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, headers: getCommonResponseHeaders() };
    }
};