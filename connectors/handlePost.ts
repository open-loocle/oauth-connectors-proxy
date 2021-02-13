import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Connector } from 'connectors';
import * as assert from 'assert';

export type Json = { [name: string]: any };

const ACCESS_CONTROL_ALLOW_ORIGIN = process.env['ACCESS_CONTROL_ALLOW_ORIGIN'] || 'https://d2jupu3zypvvzl.cloudfront.net';
const headers = {
  'Access-Control-Allow-Origin': ACCESS_CONTROL_ALLOW_ORIGIN,
  'Access-Control-Allow-Credentials': true,
};

export default async function handlePost<A extends any, R extends any>(
    event: APIGatewayEvent,
    context: Context,
    getConnector: (body: Json, context: Context) => Connector,
    getArgs: (body: Json) => A,
    getResult: (connector: Connector, args: A) => Promise<R>,
): Promise<APIGatewayProxyResult> {
  let body: Json;
  let connector: Connector;
  let args: A;
  try {
    assert(event.body !== null, 'Request body is required');
    body = JSON.parse(event.body as string);
    connector = getConnector(body, context);
    args = getArgs(body);
  } catch (error) {
    console.warn('Bad request', event.body, '. Error: ', error);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({error}),
    };
  }
  let result: R;
  try {
    result = await getResult(connector, args);
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error}),
    };
  }
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(result),
  };
}
