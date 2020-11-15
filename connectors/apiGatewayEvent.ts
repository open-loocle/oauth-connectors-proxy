import { APIGatewayEvent } from 'aws-lambda';

/**
 * Generate ApiGatewayEvent for test purposes
 */
export default function apiGatewayEvent(properties: { [name: string]: any } = {}): APIGatewayEvent {
  return {
    body: properties['body'] || null,
    headers: properties['headers'] || {},
    multiValueHeaders: properties['multiValueHeaders'] || {},
    httpMethod: properties['httpMethod'] || 'GET',
    isBase64Encoded: properties['isBase64Encoded'] || false,
    path: properties['path'] || '/',
    pathParameters: properties['pathParameters'] || null,
    queryStringParameters: properties['queryStringParameters'] || null,
    multiValueQueryStringParameters: properties['multiValueQueryStringParameters'] || null,
    stageVariables: properties['stageVariables'] || null,
    requestContext: properties['requestContext'] || {},
    resource: properties['resource'] || '',
  };
}
