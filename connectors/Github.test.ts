import apiGatewayEvent from './apiGatewayEvent';
import context from './context';
import { IOAuth2AccessTokenResponse, SearchResult, Github } from 'connectors';
import { accessTokenRequest, search } from './Github';

const headers = {
  'Access-Control-Allow-Origin': process.env['ACCESS_CONTROL_ALLOW_ORIGIN'],
  'Access-Control-Allow-Credentials': true,
};

describe('accessTokenRequest', () => {
  test('when event.body is null', async () => {
    const res = await accessTokenRequest(apiGatewayEvent(), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({
        'error': {
          'generatedMessage': false,
          'code': 'ERR_ASSERTION',
          'actual': false,
          'expected': true,
          'operator': '==',
        },
      }),
    });
  });

  test('when event.body is invalid json', async () => {
    const res = await accessTokenRequest(apiGatewayEvent({
      body: 'invalid',
    }), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({error: {}}),
    });
  });

  // TODO: Test (and implement the right behaviour if needed) when body is a valid json but doesn't have required

  test('when Github connector throws an error', async () => {
    const errorMessage = 'errorMessage';
    // @ts-ignore
    Github.mockAccessTokenRequest.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const res = await accessTokenRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://github.com',
        },
        oAuth2AccessTokenRequest: {
          grantType: 'granyType',
          code: 'code',
          redirectUri: 'http://localhost:8001',
          clientId: 'clientId',
        },
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 500,
      headers,
      body: JSON.stringify({error: {}}),
    });
  });

  test('when Github.accessTokenRequest returns access token', async () => {
    const accessToken = 'dwfwfwfwf';
    const tokenType = 'tokenType';
    // @ts-ignore
    Github.mockAccessTokenRequest.mockReturnValue({
      accessToken,
      tokenType,
    });
    const res = await accessTokenRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://github.com',
        },
        oAuth2AccessTokenRequest: {
          grantType: 'granyType',
          code: 'code',
          redirectUri: 'http://localhost:8001',
          clientId: 'clientId',
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

describe('search', () => {
  test('when Github.search returns valid searchResults', async () => {
    const accessToken = 'accessToken';
    const tokenType = 'tokenType';
    const searchResults = [
      new SearchResult('id', 'title', 'text', 'link', 'userId', 1231231230),
    ];
    // @ts-ignore
    Github.mockSearch.mockImplementation((query: string, oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse | null) => {
      expect(query).toStrictEqual('test');
      expect(oAuth2AccessTokenResponse).toStrictEqual({accessToken, tokenType});
      return searchResults;
    });
    const res = await search(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://github.com',
        },
        args: [
          'test',
          {accessToken, tokenType},
        ],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify(searchResults),
    });
  });

  describe('with additionalSearchParameters', () => {
    const args = [
      'test',
      {accessToken: 'accessToken', tokenType: 'tokenType'},
      { retries: 2, timeout: 30 },
    ];

    beforeAll(async () => {
      await search(apiGatewayEvent({
        body: JSON.stringify({
          connector: {
            origin: 'https://github.com',
          },
          args,
        }),
      }), context());
    });

    test('Github.search called with the additional search parameters', () => {
      // @ts-ignore
      const mockSearch = Github.mockSearch;
      expect(mockSearch).toBeCalledWith(...args);
    });
  });
});
