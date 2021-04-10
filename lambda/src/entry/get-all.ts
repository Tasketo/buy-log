import { DynamoDBClient, ScanCommand, ScanInput } from '@aws-sdk/client-dynamodb';

import getUserId from './utils/get-user-id-from-event'
import getCommonResponseHeaders from './utils/get-common-response-headers'
import { unmarshall } from '@aws-sdk/util-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || '';
const PRIMARY_KEY = process.env.PRIMARY_KEY || '';
const USER_KEY = process.env.USER_KEY || '';
const USER_CHECK_ENABLED = process.env.USER_CHECK_ENABLED === '1';
const LIMIT = process.env.PAGE_LIMIT ? parseInt(process.env.PAGE_LIMIT, 10) : 100;

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
    try {
        const userId = getUserId(event);

        const params: ScanInput = {
            TableName: TABLE_NAME,
            ConsistentRead: true,
            Limit: LIMIT,
            FilterExpression: USER_CHECK_ENABLED ? `#userId = :userId` : '',
            ExpressionAttributeNames: { '#userId': USER_KEY },
            ExpressionAttributeValues: { ':userId': { S: userId } }
        };

        const { limit, pageItemId, field, search } = event.queryStringParameters || {};
        if (limit && parseInt(limit, 10) !== Number.NaN) {
            params.Limit = parseInt(limit, 10);
        }
        if (pageItemId) {
            params.ExclusiveStartKey = { [PRIMARY_KEY]: pageItemId };
        }

        if (field && search) {
            params.FilterExpression += `${USER_CHECK_ENABLED ? ' and ' : ''}contains (#${field}, :${field})`
            params.ExpressionAttributeNames![`#${field}`] = field;
            params.ExpressionAttributeValues![`:${field}`] = { S: search };
        }

        const data = await client.send(new ScanCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: data.Items?.map(x => unmarshall(x)),
                meta: {
                    pageItemId: data.LastEvaluatedKey,
                    count: data.Count
                }
            }),
            headers: getCommonResponseHeaders()
        };
    } catch (e) {
        console.error(e);
        return { statusCode: 500, headers: getCommonResponseHeaders() };
    }
};