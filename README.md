# Buy Log

## Folder Structure / packages

- [cdk](./cdk/README.md) contains all the AWS Resource, which are deployed using the cd
- [lambda](./lambda/README.md) contains all the plain source-code of the lambda functions
- [frontend](./frontend/README.md) contains the frontend code
- `.scripts` contains some helper scripts for building and deploying

## Preconditions

- Install [node.js](https://nodejs.org/en/download/)
- Setup [cdk](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html#getting_started_prerequisites)

## Full build & deploy

- Create a hosted zone in Route53 of AWS for your domain
- Run `npm install`
- Run `npn run setup`
- Run `npm run deploy`

# TODO

- request validation
