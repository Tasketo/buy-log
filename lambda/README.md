# Lambda Functions

Event sample

```json
{
  "resource": "/items",
  "path": "/items",
  "httpMethod": "GET",
  "headers": {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Authorization": "eyJraWQiOiJ1V1dJUndLc1JaVE9yY2l2R3NTTjc2NHNLM3NiQUxLcVZTUFJIWm9YY2pjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJmYmNjOGFmNS0wMjlkLTRkNjMtODJhMS0xY2Q2MjY1NzczMjUiLCJhdWQiOiIybnBkMDJha2RwMzhvZXVsY3JwbmhoajVibyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZXZlbnRfaWQiOiI4NzNmOTY2Zi1lYWU2LTQ1ZDAtYTI4MS05YjA4NzM5Mjg0Y2YiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYxNDk0NDQxNiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfWURlQlNYU3hyIiwiY29nbml0bzp1c2VybmFtZSI6InRoZXJhaWRzIiwiZXhwIjoxNjE0OTQ4MDE2LCJpYXQiOjE2MTQ5NDQ0MTYsImVtYWlsIjoidGhlcmFpZHNAd2ViLmRlIn0.CZGZGLBt7OgNd5bLkn8cDGNiwOW4JvYyhQ7t5ejd0xpbLUHGwe5ExBJS2pSQEh8OYlLENaPBNHJN5OTstZChvq5V_ZsRlcC91CsBqHXV-DTlNzpxcS_spbJxIiQFnAtRN-gqQkIx1qsPpdSOvfcWX-WvtfthVWdEWGkR0inmybzY15B_1qXGMglwvZ2qllhVlJiKJLTMmBbt077KXeV4p-fR-G1Z7PjVPgesTIF408xFz1cfUa1HASX6vofV3QpqYj77cDPd85doyjLtB7SXjZqFA6KtMyd2hylDMVv0hfXjWDRcU_gIlB0g-MU1ryH8vqc8gwnvwwEjauzw2A8v2w",
    "CloudFront-Forwarded-Proto": "https",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-Mobile-Viewer": "false",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Tablet-Viewer": "false",
    "CloudFront-Viewer-Country": "DE",
    "Host": "d3m1s28yjj.execute-api.eu-central-1.amazonaws.com",
    "Postman-Token": "1511e4af-2c07-4aaf-9924-2437d62ef725",
    "User-Agent": "PostmanRuntime/7.26.10",
    "Via": "1.1 d6561aeeccb210202cf78b99f07c5235.cloudfront.net (CloudFront)",
    "X-Amz-Cf-Id": "DAtgqlPuJp0eC_08U0Os3_ovfXf_2t8_b-w_c0QsBKPgyC2hh62gug==",
    "X-Amzn-Trace-Id": "Root=1-60421c90-6f4aa81763b4f348091e5d63",
    "X-Forwarded-For": "87.145.70.92, 64.252.138.134",
    "X-Forwarded-Port": "443",
    "X-Forwarded-Proto": "https"
  },
  "multiValueHeaders": {
    "Accept": ["*/*"],
    "Accept-Encoding": ["gzip, deflate, br"],
    "Authorization": [
      "eyJraWQiOiJ1V1dJUndLc1JaVE9yY2l2R3NTTjc2NHNLM3NiQUxLcVZTUFJIWm9YY2pjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJmYmNjOGFmNS0wMjlkLTRkNjMtODJhMS0xY2Q2MjY1NzczMjUiLCJhdWQiOiIybnBkMDJha2RwMzhvZXVsY3JwbmhoajVibyIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwiZXZlbnRfaWQiOiI4NzNmOTY2Zi1lYWU2LTQ1ZDAtYTI4MS05YjA4NzM5Mjg0Y2YiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTYxNDk0NDQxNiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfWURlQlNYU3hyIiwiY29nbml0bzp1c2VybmFtZSI6InRoZXJhaWRzIiwiZXhwIjoxNjE0OTQ4MDE2LCJpYXQiOjE2MTQ5NDQ0MTYsImVtYWlsIjoidGhlcmFpZHNAd2ViLmRlIn0.CZGZGLBt7OgNd5bLkn8cDGNiwOW4JvYyhQ7t5ejd0xpbLUHGwe5ExBJS2pSQEh8OYlLENaPBNHJN5OTstZChvq5V_ZsRlcC91CsBqHXV-DTlNzpxcS_spbJxIiQFnAtRN-gqQkIx1qsPpdSOvfcWX-WvtfthVWdEWGkR0inmybzY15B_1qXGMglwvZ2qllhVlJiKJLTMmBbt077KXeV4p-fR-G1Z7PjVPgesTIF408xFz1cfUa1HASX6vofV3QpqYj77cDPd85doyjLtB7SXjZqFA6KtMyd2hylDMVv0hfXjWDRcU_gIlB0g-MU1ryH8vqc8gwnvwwEjauzw2A8v2w"
    ],
    "CloudFront-Forwarded-Proto": ["https"],
    "CloudFront-Is-Desktop-Viewer": ["true"],
    "CloudFront-Is-Mobile-Viewer": ["false"],
    "CloudFront-Is-SmartTV-Viewer": ["false"],
    "CloudFront-Is-Tablet-Viewer": ["false"],
    "CloudFront-Viewer-Country": ["DE"],
    "Host": ["d3m1s28yjj.execute-api.eu-central-1.amazonaws.com"],
    "Postman-Token": ["1511e4af-2c07-4aaf-9924-2437d62ef725"],
    "User-Agent": ["PostmanRuntime/7.26.10"],
    "Via": ["1.1 d6561aeeccb210202cf78b99f07c5235.cloudfront.net (CloudFront)"],
    "X-Amz-Cf-Id": ["DAtgqlPuJp0eC_08U0Os3_ovfXf_2t8_b-w_c0QsBKPgyC2hh62gug=="],
    "X-Amzn-Trace-Id": ["Root=1-60421c90-6f4aa81763b4f348091e5d63"],
    "X-Forwarded-For": ["87.145.70.92, 64.252.138.134"],
    "X-Forwarded-Port": ["443"],
    "X-Forwarded-Proto": ["https"]
  },
  "queryStringParameters": null,
  "multiValueQueryStringParameters": null,
  "pathParameters": null,
  "stageVariables": null,
  "requestContext": {
    "resourceId": "06yomm",
    "authorizer": {
      "claims": {
        "sub": "fbcc8af5-029d-4d63-82a1-1cd626577325",
        "aud": "2npd02akdp38oeulcrpnhhj5bo",
        "email_verified": "false",
        "event_id": "873f966f-eae6-45d0-a281-9b08739284cf",
        "token_use": "id",
        "auth_time": "1614944416",
        "iss": "https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_YDeBSXSxr",
        "cognito:username": "name",
        "exp": "Fri Mar 05 12:40:16 UTC 2021",
        "iat": "Fri Mar 05 11:40:16 UTC 2021",
        "email": "name@example.com"
      }
    },
    "resourcePath": "/items",
    "httpMethod": "GET",
    "extendedRequestId": "btlmoHsTFiAFnZw=",
    "requestTime": "05/Mar/2021:11:57:04 +0000",
    "path": "/prod/items",
    "accountId": "791755369473",
    "protocol": "HTTP/1.1",
    "stage": "prod",
    "domainPrefix": "d3m1s28yjj",
    "requestTimeEpoch": 1614945424739,
    "requestId": "2729ae48-b06c-4343-b477-0728568fd035",
    "identity": {
      "cognitoIdentityPoolId": null,
      "accountId": null,
      "cognitoIdentityId": null,
      "caller": null,
      "sourceIp": "87.145.70.92",
      "principalOrgId": null,
      "accessKey": null,
      "cognitoAuthenticationType": null,
      "cognitoAuthenticationProvider": null,
      "userArn": null,
      "userAgent": "PostmanRuntime/7.26.10",
      "user": null
    },
    "domainName": "d3m1s28yjj.execute-api.eu-central-1.amazonaws.com",
    "apiId": "d3m1s28yjj"
  },
  "body": null,
  "isBase64Encoded": false
}
```
