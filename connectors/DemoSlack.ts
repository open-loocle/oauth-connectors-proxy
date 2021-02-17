import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import * as assert from 'assert';
import {
  Connector, DemoSlack, ICurrentUser, IDemoAuth, IFavorites,
  implementsIOAuth2AccessTokenRequest,
  implementsIOAuth2AccessTokenResponse,
  IOAuth2,
  IOAuth2AccessTokenRequest,
  IOAuth2AccessTokenResponse,
  ISearch,
} from 'connectors';
import getConnector from './getConnector';
import loadEnvVariable from '../loadEnvVariable';
import handlePost, { Json } from './handlePost';

const clientSecret = loadEnvVariable('OAUTH_SLACK_CLIENT_SECRET');
const accessToken = loadEnvVariable('OAUTH_DEMO_SLACK_ACCESS_TOKEN');

export async function accessTokenRequest(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('DemoSlack accessTokenRequest');
  return await handlePost(event, context, (body: Json) => {
    return getConnector(DemoSlack, body, clientSecret, accessToken);
  }, (body: Json) => {
    const oAuth2AccessTokenRequest: IOAuth2AccessTokenRequest = body['oAuth2AccessTokenRequest'];
    assert(implementsIOAuth2AccessTokenRequest(oAuth2AccessTokenRequest), 'Invalid oAuth2AccessTokenRequest ' + oAuth2AccessTokenRequest);
    return oAuth2AccessTokenRequest;
  }, async (connector: Connector, args: IOAuth2AccessTokenRequest) => {
    return await (connector as unknown as IOAuth2).accessTokenRequest(args);
  });
}

export async function search(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('DemoSlack search');
  return handlePost(event, context, (body: Json) => {
    return getConnector(DemoSlack, body);
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

export async function currentUser(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('DemoSlack currentUser');
  return handlePost(event, context, (body: Json) => {
    return getConnector(DemoSlack, body);
  }, (body: Json) => {
    const oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse = body['args'][0];
    assert(implementsIOAuth2AccessTokenResponse(oAuth2AccessTokenResponse), 'Invalid oAuth2AccessTokenResponse ' + oAuth2AccessTokenResponse);
    return oAuth2AccessTokenResponse;
  }, async (connector: Connector, args: IOAuth2AccessTokenResponse) => {
    return await (connector as unknown as ICurrentUser).currentUser(args);
  });
}

export async function favorites(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('DemoSlack favorites');
  return handlePost(event, context, (body: Json) => {
    return getConnector(DemoSlack, body);
  }, (body: Json) => {
    let limit: number | undefined = undefined;
    let oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse;
    oAuth2AccessTokenResponse = body['args'][0];
    assert(implementsIOAuth2AccessTokenResponse(oAuth2AccessTokenResponse), 'Invalid oAuth2AccessTokenResponse ' + oAuth2AccessTokenResponse);
    if (body['args'].length > 1) {
      limit = parseInt(body['args'][1], 10);
    }
    return [oAuth2AccessTokenResponse, limit] as [IOAuth2AccessTokenResponse, number | undefined];
  }, async (connector: Connector, args: [IOAuth2AccessTokenResponse, number | undefined]) => {
    return await (connector as unknown as IFavorites).favorites(...args);
  });
}

export async function demoAuth(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('DemoSlack demoAuth');
  return await handlePost(event, context, (body: Json) => {
    return getConnector(DemoSlack, body, clientSecret, accessToken);
  }, () => {
    return null;
  }, async (connector: Connector) => {
    return await (connector as unknown as IDemoAuth).demoAuth();
  });
}
