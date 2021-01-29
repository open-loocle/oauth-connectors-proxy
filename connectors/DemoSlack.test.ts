import { DemoSlack } from 'connectors';
import { demoAuth } from './DemoSlack';
import apiGatewayEvent from './apiGatewayEvent';
import context from './context';

const headers = {
  'Access-Control-Allow-Origin': process.env['ACCESS_CONTROL_ALLOW_ORIGIN'],
  'Access-Control-Allow-Credentials': true,
};

describe('demoAuth', () => {
  const accessToken = 'dwfwfwfwf';
  const tokenType = 'tokenType';

  test('DemoSlack returns a valid response', async () => {
    // @ts-ignore
    DemoSlack.mockDemoAuth.mockReturnValue({accessToken, tokenType});
    const res = await demoAuth(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
        },
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify({accessToken, tokenType}),
    });
  });
});
