import {
  currentUser,
  favorites,
  search,
  temporaryCredentialRequest,
  tokenCredentialsRequest,
  visited,
} from './ConfluenceServer';
import apiGatewayEvent from './apiGatewayEvent';
import context from './context';
import {
  ConfluenceServer,
  ErrorCode,
  ErrorCodeConnectorError, IOAuth1TokenCredentialsResponse, IUser,
  OAuth1Signature,
  OAuth1TemporaryCredentialResponse, SearchResult,
} from 'connectors';

const confluenceServer = new ConfluenceServer('http://confluence.yourdomain.com');
// TODO: Delete allow origin * if not needed for security reasons
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('temporaryCredentialRequest', () => {
  test('when event body is null', async () => {
    const res = await temporaryCredentialRequest(apiGatewayEvent(), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({
        // TODO: Make friendlier errors in case of invalid requests
        'generatedMessage': false,
        'code': 'ERR_ASSERTION',
        'actual': false,
        'expected': true,
        'operator': '==',
      }),
    });
  });

  // TODO: Test when body misses some fields

  test('when event body is an invalid json', async () => {
    const res = await temporaryCredentialRequest(apiGatewayEvent({
      body: 'invalid',
    }), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: '{}',
    });
  });

  test('when ConfluenceServer throws an error', async () => {
    // @ts-ignore
    ConfluenceServer.mockTemporaryCredentialRequest.mockImplementation(() => {
      throw new ErrorCodeConnectorError(ErrorCode.TIMEOUT_ERROR, confluenceServer, 'Timeout');
    });
    const res = await temporaryCredentialRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        oAuth1TemporaryCredentialRequest: {
          oauthCallback: 'http://localhost:8001',
          oauthConsumerKey: 'Loocle',
          oauthSignatureMethod: OAuth1Signature.RSA_SHA1,
        },
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 500,
      headers,
      // TODO: Should we pass errorCodes as strings instead?
      body: JSON.stringify({
        'connector': {'origin': 'http://confluence.yourdomain.com', 'timeout': 10000},
        'message': 'Timeout',
        'errorCode': 8,
      }),
    });
  });

  test('when ConfluenceServer returns token', async () => {
    const oauthToken = 'token';
    const oauthTokenSecret = 'tokenSecret';
    const oauthCallbackConfirmed = true;
    // @ts-ignore
    ConfluenceServer.mockTemporaryCredentialRequest.mockReturnValue(
        new OAuth1TemporaryCredentialResponse(oauthToken, oauthTokenSecret, true),
    );
    const res = await temporaryCredentialRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        oAuth1TemporaryCredentialRequest: {
          oauthCallback: 'http://localhost:8001',
          oauthConsumerKey: 'Loocle',
          oauthSignatureMethod: OAuth1Signature.RSA_SHA1,
        },
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify({oauthToken, oauthTokenSecret, oauthCallbackConfirmed}),
    });
    // @ts-ignore
    expect(ConfluenceServer.mockTemporaryCredentialRequest).toBeCalledWith({
      'oauthCallback': 'http://localhost:8001',
      'oauthConsumerKey': 'Loocle',
      'oauthSignatureMethod': OAuth1Signature.RSA_SHA1,
    });
  });
});

describe('tokenCredentialsRequest', () => {
  test('when even body is null', async () => {
    const res = await tokenCredentialsRequest(apiGatewayEvent(), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({
        'generatedMessage': false,
        'code': 'ERR_ASSERTION',
        'actual': false,
        'expected': true,
        'operator': '==',
      }),
    });
  });

  test('when event body is invalid json', async () => {
    const res = await tokenCredentialsRequest(apiGatewayEvent({
      body: 'invalid',
    }), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      // TODO: Fix Error JSON.stringify
      body: '{}',
    });
  });

  test('when ConfluenceServer throws an error', async () => {
    // @ts-ignore
    ConfluenceServer.mockTokenCredentialsRequest.mockImplementation(() => {
      throw new ErrorCodeConnectorError(ErrorCode.TIMEOUT_ERROR, confluenceServer, 'Timeout');
    });
    const res = await tokenCredentialsRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        oAuth1TokenCredentialsRequest: {
          oauthVerifier: 'oauthVerifier',
          oauthConsumerKey: 'Loocle',
          oauthSignatureMethod: OAuth1Signature.RSA_SHA1,
        },
      }),
    }), context({getRemainingTimeInMillis: () => 110}));
    expect(res).toStrictEqual({
      statusCode: 500,
      headers,
      body: JSON.stringify({'connector': {'origin': 'http://confluence.yourdomain.com','timeout': 10000},'message': 'Timeout','errorCode': 8}),
    });
  });

  // TODO: Test when event body is json but misses some required fields

  test('when ConfluenceServer returns a token', async () => {
    const oauthVerifier = 'oauthVerifier';
    const oauthToken = 'token';
    const oauthTokenSecret = 'tokenSecret';
    // @ts-ignore
    ConfluenceServer.mockTokenCredentialsRequest.mockReturnValue({ oauthToken, oauthTokenSecret });
    const res = await tokenCredentialsRequest(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        oAuth1TokenCredentialsRequest: {
          oauthVerifier,
          oauthConsumerKey: 'Looole',
          oauthSignatureMethod: OAuth1Signature.RSA_SHA1,
        },
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify({oauthToken, oauthTokenSecret}),
    });
    // @ts-ignore
    expect(ConfluenceServer.mockTokenCredentialsRequest).toBeCalledWith({
      'oauthConsumerKey': 'Looole',
      'oauthSignatureMethod': 1,
      'oauthVerifier': 'oauthVerifier',
    });
  });
});

describe('search', () => {
  test('when body is null', async () => {
    const res = await search(apiGatewayEvent(), context());
    expect(res).toStrictEqual({
      statusCode: 400,
      headers,
      body: JSON.stringify({'generatedMessage': false,'code': 'ERR_ASSERTION','actual': false,'expected': true,'operator': '=='}),
    });
  });

  test('when ConfluenceServer throws an error', async () => {
    // @ts-ignore
    ConfluenceServer.mockSearch.mockImplementation(() => {
      throw new ErrorCodeConnectorError(ErrorCode.TIMEOUT_ERROR, confluenceServer, 'Timeout');
    });
    const res = await search(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        args: [
          'test',
          { oauthToken: 'oauthToken', oauthTokenSecret: 'oauthTokenSecret' },
        ],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 500,
      headers,
      body: JSON.stringify({'connector': {'origin': 'http://confluence.yourdomain.com','timeout': 10000},'message': 'Timeout','errorCode': 8}),
    });
  });

  // TODO: Test when queryStringParameters miss required fields

  test('when ConfluenceServer.search returns a valid result', async () => {
    const searchResults = [
      new SearchResult('65591', 'Test', '', 'http://localhost:8090/display/TEST/Test', '402880824ff933a4014ff9345d7c0002', 1588595958.283),
    ];
    // @ts-ignore
    ConfluenceServer.mockSearch.mockImplementation((query: string, oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse) => {
      expect(query).toStrictEqual('test');
      expect(oAuth1TokenCredentialsResponse).toStrictEqual({oauthToken: 'oauthToken', oauthTokenSecret: 'oauthTokenSecret'});
      return searchResults;
    });
    const res = await search(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        args: [
          'test',
          { oauthToken: 'oauthToken', oauthTokenSecret: 'oauthTokenSecret' },
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

describe('visited', () => {
  test('when ConfluenceServer.visited returns a valid result', async () => {
    const expectedVisited = ['123', '456'];
    // @ts-ignore
    ConfluenceServer.mockVisited.mockImplementation((oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse, limit?: number) => {
      expect(oAuth1TokenCredentialsResponse).toStrictEqual({oauthToken: 'oauthToken1', oauthTokenSecret: 'oauthTokenSecret1'});
      expect(limit).toStrictEqual(100);
      return ['123', '456'];
    });
    const res = await visited(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        args: [
          {oauthToken: 'oauthToken1', oauthTokenSecret: 'oauthTokenSecret1'},
          100,
        ],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify(expectedVisited),
    });
  });
});

describe('currentUser', () => {
  test('when ConfluenceServer returns a valid result', async () => {
    const user: IUser = { id: '100' };
    const oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse = {
      oauthToken: 'oauthToken',
      oauthTokenSecret: 'oauthTokenSecret',
    };
    // @ts-ignore
    ConfluenceServer.mockCurrentUser.mockImplementation((oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse) => {
      expect(oAuth1TokenCredentialsResponse).toStrictEqual(oAuth1TokenCredentialsResponse);
      return user;
    });
    const res = await currentUser(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        args: [oAuth1TokenCredentialsResponse],
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
  test('when ConfluenceServer returns a valid result', async () => {
    const oAuth1TokenCredentialsResponse: IOAuth1TokenCredentialsResponse = {
      oauthToken: 'oauthToken',
      oauthTokenSecret: 'oauthTokenSecret',
    };
    const limit = 100;
    const expectedFavorites = ['300387164', '300387165'];
    // @ts-ignore
    ConfluenceServer.mockFavorites.mockReturnValue(expectedFavorites);
    const res = await favorites(apiGatewayEvent({
      body: JSON.stringify({
        connector: {
          origin: 'http://confluence.yourdomain.com',
        },
        args: [oAuth1TokenCredentialsResponse, limit],
      }),
    }), context());
    expect(res).toStrictEqual({
      statusCode: 200,
      headers,
      body: JSON.stringify(expectedFavorites),
    });
  });
});
