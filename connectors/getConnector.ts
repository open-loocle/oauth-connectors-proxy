import { Connector } from 'connectors';
import * as assert from 'assert';
import { Context } from 'aws-lambda';

export default function getConnector(connectorClass: { new(...args: any): Connector }, eventBody: { [name: string]: any }, context: Context, ...args: any): Connector {
  assert('connector' in eventBody, 'connector should be in body');
  assert('origin' in eventBody['connector'], 'origin should be in body[connector]');
  let timeout: number | undefined = context.getRemainingTimeInMillis() - 100;
  if ('timeout' in eventBody['connector']) {
    timeout = Math.min(timeout, parseInt(eventBody['connector']['timeout'], 10));
  }
  return new connectorClass(eventBody['connector']['origin'], timeout, ...args);
}
