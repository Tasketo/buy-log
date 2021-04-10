import { JsonSchemaType } from "@aws-cdk/aws-apigateway";

export default {
    type: JsonSchemaType.OBJECT,
    properties: {
        itemId: {
            type: JsonSchemaType.STRING,
            format: 'uuid'
        },
        userId: {
            type: JsonSchemaType.STRING,
        },
        name: {
            type: JsonSchemaType.STRING,
            minLength: 3,
        },
        date: {
            type: JsonSchemaType.STRING,
            format: 'date',
        },
        price: {
            type: JsonSchemaType.NUMBER,
            minimum: 0,
        },
        createdAt: {
            type: JsonSchemaType.STRING,
            format: 'date-time',
        },
        updatedAt: {
            type: JsonSchemaType.STRING,
            format: 'date-time',
        },
        attachments: {
            type: JsonSchemaType.ARRAY,
            items: {
                type: JsonSchemaType.STRING,
                format: 'uuid'
            }
        },
    },
    required: ["name", "price"]
}