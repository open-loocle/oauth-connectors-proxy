import getConnector from './getConnector';
import { Slack } from '../__mocks__/connectors';

describe('getConnector', () => {
  test('when connector is not passed', () => {
    expect(() => getConnector(Slack, {})).toThrow('connector should be in body');
  });

  test('when origin is not passed', () => {
    expect(() => getConnector(Slack, {connector: {}})).toThrow('origin should be in body[connector]');
  });

  test('when additional arguments are not passed', () => {
    const origin = 'https://slack.com';
    getConnector(Slack, {connector: {origin}});
    expect(Slack.mockConstructor).toBeCalledWith(origin, undefined);
  });

  test('when additional arguments are passed', () => {
    const origin = 'https://slack.com';
    const secret = 'secret';
    getConnector(Slack, {connector: {origin}}, secret);
    expect(Slack.mockConstructor).toBeCalledWith(origin, secret);
  });
});
