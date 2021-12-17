import loadEnvVariable from '../loadEnvVariable';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import handlePost, { Json } from './handlePost';
import getConnector from './getConnector';
import {
  Connector,
  implementsIOAuth2AccessTokenRequest, implementsIOAuth2AccessTokenResponse, IOAuth2,
  IOAuth2AccessTokenRequest, IOAuth2AccessTokenResponse, ISearch, Github,
} from 'connectors';
import * as assert from 'assert';

const clientSecret = loadEnvVariable('OAUTH_GITHUB_CLIENT_SECRET');

export async function accessTokenRequest(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('Github accessTokenRequest');
  return await handlePost(event, context, (body: Json) => {
    return getConnector(Github, body, clientSecret);
  }, (body: Json) => {
    const oAuth2AccessTokenRequest: IOAuth2AccessTokenRequest = body['oAuth2AccessTokenRequest'];
    assert(implementsIOAuth2AccessTokenRequest(oAuth2AccessTokenRequest), 'Invalid oAuth2AccessTokenRequest ' + oAuth2AccessTokenRequest);
    return oAuth2AccessTokenRequest;
  }, async (connector: Connector, args: IOAuth2AccessTokenRequest) => {
    return await (connector as unknown as IOAuth2).accessTokenRequest(args);
  });
}

export async function search(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('Github search');
  return handlePost(event, context, (body: Json) => {
    return getConnector(Github, body);
  }, (body: Json) => {
    let query: string;
    let oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse;
    [query, oAuth2AccessTokenResponse] = body['args'];
    assert(implementsIOAuth2AccessTokenResponse(oAuth2AccessTokenResponse), 'Invalid oAuth2AccessTokenResponse ' + oAuth2AccessTokenResponse);
    return [query, oAuth2AccessTokenResponse] as [string, IOAuth2AccessTokenResponse];
  }, async (connector: Connector, args: [string, IOAuth2AccessTokenResponse]) => {
    return await (connector as unknown as ISearch).search(...args);
  });
}
