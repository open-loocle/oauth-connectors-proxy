import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import * as assert from 'assert';
import {
  ConfluenceServer,
  Connector,
  ICurrentUser,
  IFavorites,
  implementsIOAuth1TemporaryCredentialRequest, implementsIOAuth1TokenCredentialsRequest,
  implementsIOAuth1TokenCredentialsResponse,
  IOAuth1,
  IOAuth1TemporaryCredentialRequest, IOAuth1TokenCredentialsRequest,
  IOAuth1TokenCredentialsResponse,
  ISearch,
  IVisited,
} from 'connectors';
import getConnector from './getConnector';
import handlePost, { Json } from './handlePost';

export async function temporaryCredentialRequest(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer temporaryCredentialRequest');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    const oAuth1TemporaryCredentialRequest: IOAuth1TemporaryCredentialRequest = body['oAuth1TemporaryCredentialRequest'];
    assert(implementsIOAuth1TemporaryCredentialRequest(oAuth1TemporaryCredentialRequest), 'Invalid oAuth1TemporaryCredentialRequest ' + oAuth1TemporaryCredentialRequest);
    return oAuth1TemporaryCredentialRequest;
  }, async (connector: Connector, args: IOAuth1TemporaryCredentialRequest) => {
    return await (connector as unknown as IOAuth1).temporaryCredentialRequest(args);
  });
}

export async function tokenCredentialsRequest(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer tokenCredentialsRequest');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    const oAuth1TokenCredentialsRequest: IOAuth1TokenCredentialsRequest = body['oAuth1TokenCredentialsRequest'];
    assert(implementsIOAuth1TokenCredentialsRequest(oAuth1TokenCredentialsRequest), 'Invalid oAuth1TokenCredentialsRequest ' + oAuth1TokenCredentialsRequest);
    return oAuth1TokenCredentialsRequest;
  }, async (connector: Connector, args: IOAuth1TokenCredentialsRequest) => {
    return await (connector as unknown as IOAuth1).tokenCredentialsRequest(args);
  });
}

export async function search(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer search');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    let query: string;
    let oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse;
    let additionalParameters: { [key: string]: any } | undefined;
    [query, oAuth1TokenCredentialsResponse, additionalParameters] = body['args'];
    assert(implementsIOAuth1TokenCredentialsResponse(oAuth1TokenCredentialsResponse), 'Invalid oAuth1TokenCredentialsResponse ' + oAuth1TokenCredentialsResponse);
    return [query, oAuth1TokenCredentialsResponse, additionalParameters] as [string, IOAuth1TokenCredentialsResponse, { [key: string]: any } | undefined];
  }, async (connector: Connector, args: [string, IOAuth1TokenCredentialsResponse, { [key: string]: any } | undefined]) => {
    return await (connector as unknown as ISearch).search(...args);
  });
}

export async function visited(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer visited');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    let limit: number | undefined = undefined;
    let oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse;
    oAuth1TokenCredentialsResponse = body['args'][0];
    assert(implementsIOAuth1TokenCredentialsResponse(oAuth1TokenCredentialsResponse), 'Invalid oAuth1TokenCredentialsResponse ' + oAuth1TokenCredentialsResponse);
    if (body['args'].length > 1) {
      limit = parseInt(body['args'][1], 10);
    }
    return [oAuth1TokenCredentialsResponse, limit] as [IOAuth1TokenCredentialsResponse, number | undefined];
  }, async (connector: Connector, args: [IOAuth1TokenCredentialsResponse, number | undefined]) => {
    return await (connector as unknown as IVisited).visited(...args);
  });
}

export async function currentUser(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer currentUser');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    const oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse = body['args'][0];
    assert(implementsIOAuth1TokenCredentialsResponse(oAuth1TokenCredentialsResponse), 'Invalid oAuth1TokenCredentialsResponse ' + oAuth1TokenCredentialsResponse);
    return oAuth1TokenCredentialsResponse;
  }, async (connector: Connector, args: IOAuth1TokenCredentialsResponse) => {
    return await (connector as unknown as ICurrentUser).currentUser(args);
  });
}

export async function favorites(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
  console.info('ConfluenceServer favorites');
  return handlePost(event, context, (body: Json) => {
    return getConnector(ConfluenceServer, body);
  }, (body: Json) => {
    let limit: number | undefined = undefined;
    let oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse;
    oAuth1TokenCredentialsResponse = body['args'][0];
    assert(implementsIOAuth1TokenCredentialsResponse(oAuth1TokenCredentialsResponse), 'Invalid oAuth1TokenCredentialsResponse ' + oAuth1TokenCredentialsResponse);
    if (body['args'].length > 1) {
      limit = parseInt(body['args'][1], 10);
    }
    return [oAuth1TokenCredentialsResponse, limit] as [IOAuth1TokenCredentialsResponse, number | undefined];
  }, async (connector: Connector, args: [IOAuth1TokenCredentialsResponse, number | undefined]) => {
    return await (connector as unknown as IFavorites).favorites(...args);
  });
}
