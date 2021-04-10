export default (event: any): string => {
    return event.requestContext.authorizer.claims.sub;
}