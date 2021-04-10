import { CognitoIdentityClient, GetIdCommand } from "@aws-sdk/client-cognito-identity";

const client = new CognitoIdentityClient({});

const identityPoolId = process.env.IDENTITY_POOL_ID; // e.g. eu-central-1:b2d43940-2124-4111-9201-32ae127d930a

export default async (event: any): Promise<string> => {
    // iss example: https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_gK6VGTGAh
    // Authorization example: Bearer eyJraWQiOiJTVzlvYXo5bEhhWFphQUhDU2xyKzFibFltcXdsRUo4Z3NiYmdQK1kyRXd3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiIxMWJlNWF....
    const { iss } = event.requestContext.authorizer.claims
    const { Authorization } = event.headers;

    const login = iss.substring("https://".length);
    const token = Authorization.substring("Bearer ".length);

    const response = await client.send(new GetIdCommand({
        IdentityPoolId: identityPoolId,
        Logins: { [login]: token }
    }))
    return response.IdentityId as string;
}