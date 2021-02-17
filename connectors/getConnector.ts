import { Connector } from 'connectors';
import * as assert from 'assert';

export default function getConnector(connectorClass: { new(...args: any): Connector }, eventBody: { [name: string]: any }, ...args: any): Connector {
  assert('connector' in eventBody, 'connector should be in body');
  assert('origin' in eventBody['connector'], 'origin should be in body[connector]');
  return new connectorClass(eventBody['connector']['origin'], ...args);
}
