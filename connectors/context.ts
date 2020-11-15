import { Context } from 'aws-lambda';

/**
 * Generate aws-lambda Context for test purposes
 */
export default function context(properties: { [name: string]: any } = {}): Context {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'functionName',
    functionVersion: 'functionVersion',
    invokedFunctionArn: 'invokedFunctionArn',
    memoryLimitInMB: '100',
    awsRequestId: 'awsRequestId',
    logGroupName: 'logGroupName',
    logStreamName: 'logStreamName',
    identity: undefined,
    clientContext: undefined,
    getRemainingTimeInMillis: properties['getRemainingTimeInMillis'] || (() => 6000),
    done: () => null,
    fail: () => null,
    succeed: () => null,
  };
}
