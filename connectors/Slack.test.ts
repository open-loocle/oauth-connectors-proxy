import { accessTokenRequest, currentUser, favorites, search } from './Slack';
import apiGatewayEvent from './apiGatewayEvent';
import context from './context';
import { IOAuth2AccessTokenResponse, IUser, SearchResult, Slack } from 'connectors';

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

  test('when WebClient throws an error', async () => {
    const errorMessage = 'errorMessage';
    // @ts-ignore
    Slack.mockAccessTokenRequest.mockImplementation(() => {
      throw new Error(errorMessage);
    });
    const res = await accessTokenRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
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

  test('when WebClient.oauth.access returns access token', async () => {
    const accessToken = 'dwfwfwfwf';
    const tokenType = 'tokenType';
    // @ts-ignore
    Slack.mockAccessTokenRequest.mockReturnValue({
      accessToken,
      tokenType,
    });
    const res = await accessTokenRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
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
  test('when Slack.search returns valid searchResults', async () => {
    const accessToken = 'accessToken';
    const tokenType = 'tokenType';
    const searchResults = [
      new SearchResult('id', 'title', 'text', 'link', 'userId', 1231231230),
    ];
    // @ts-ignore
    Slack.mockSearch.mockImplementation((query: string, oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse | null) => {
      expect(query).toStrictEqual('test');
      expect(oAuth2AccessTokenResponse).toStrictEqual({accessToken, tokenType});
      return searchResults;
    });
    const res = await search(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
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
});

describe('currentUser', () => {
  test('when Slack.currentUser returns valid IUser', async () => {
    const accessToken = 'accessToken';
    const tokenType = 'tokenType';
    const user: IUser = { id: 'id', name: 'name' };
    // @ts-ignore
    Slack.mockCurrentUser.mockImplementation((oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse | null) => {
      expect(oAuth2AccessTokenResponse).toStrictEqual({accessToken, tokenType});
      return user;
    });
    const res = await currentUser(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
        },
        args: [
          {accessToken, tokenType},
        ],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify(user),
    });
  });
});

describe('favorites', () => {
  test('when Slack.favorites returns valid result', async () => {
    const accessToken = 'accessToken';
    const tokenType = 'tokenType';
    const expectedFavorites = ['123', '234'];
    const expectedLimit = 100;
    // @ts-ignore
    Slack.mockFavorites.mockImplementation((oAuth2AccessTokenResponse: IOAuth2AccessTokenResponse | null, limit?: number) => {
      expect(oAuth2AccessTokenResponse).toStrictEqual({accessToken, tokenType});
      expect(limit).toStrictEqual(expectedLimit);
      return expectedFavorites;
    });
    const res = await favorites(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'https://slack.com',
        },
        args: [
          {accessToken, tokenType},
          expectedLimit,
        ],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify(expectedFavorites),
    });
  });
});
