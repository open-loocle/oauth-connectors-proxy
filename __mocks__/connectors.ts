import {
  ConfluenceServer as ConfluenceServerOriginal,
  Slack as SlackOriginal,
  Github as GithubOriginal,
  OAuth1TemporaryCredentialResponse,
  IOAuth1TokenCredentialsResponse, IOAuth2AccessTokenResponse, SearchResult, IUser,
} from 'connectors';
import * as connectors from 'connectors';

export class ConfluenceServer extends ConfluenceServerOriginal {
  static mockTemporaryCredentialRequest: jest.Mock = jest.fn();
  static mockTokenCredentialsRequest: jest.Mock = jest.fn();
  static mockSearch: jest.Mock = jest.fn();
  static mockVisited: jest.Mock = jest.fn();
  static mockCurrentUser: jest.Mock = jest.fn();
  static mockFavorites: jest.Mock = jest.fn();

  /**
   * Override mockTemporaryCredentialRequest in your test to tweak the behaviour.
   */
  async temporaryCredentialRequest(...args: any): Promise<OAuth1TemporaryCredentialResponse> {
    return ConfluenceServer.mockTemporaryCredentialRequest(...args);
  }

  async tokenCredentialsRequest(...args: any): Promise<IOAuth1TokenCredentialsResponse> {
    return ConfluenceServer.mockTokenCredentialsRequest(...args);
  }

  async search(...args: any): Promise<Array<SearchResult>> {
    return ConfluenceServer.mockSearch(...args);
  }

  async visited(...args: any): Promise<Array<string>> {
    return ConfluenceServer.mockVisited(...args);
  }

  async currentUser(...args: any): Promise<IUser> {
    return ConfluenceServer.mockCurrentUser(...args);
  }

  async favorites(...args: any): Promise<Array<string>> {
    return ConfluenceServer.mockFavorites(...args);
  }
}

export class Slack extends SlackOriginal {
  static mockConstructor: jest.Mock = jest.fn();
  static mockAccessTokenRequest: jest.Mock = jest.fn();
  static mockSearch: jest.Mock = jest.fn();
  static mockCurrentUser: jest.Mock = jest.fn();
  static mockFavorites: jest.Mock = jest.fn();

  constructor(origin: string | null, clientSecret?: string) {
    super(origin, clientSecret);
    Slack.mockConstructor(origin, clientSecret);
  }

  async accessTokenRequest(...args: any): Promise<IOAuth2AccessTokenResponse> {
    return Slack.mockAccessTokenRequest(...args);
  }

  async search(...args: any): Promise<Array<SearchResult>> {
    return Slack.mockSearch(...args);
  }

  async currentUser(...args: any): Promise<IUser> {
    return Slack.mockCurrentUser(...args);
  }

  async favorites(...args: any): Promise<Array<string>> {
    return Slack.mockFavorites(...args);
  }
}

export class DemoSlack extends Slack {
  static mockDemoAuth: jest.Mock = jest.fn();

  async demoAuth(): Promise<IOAuth2AccessTokenResponse> {
    // TODO: Fix type errors in the file
    return DemoSlack.mockDemoAuth();
  }
}

export class Github extends GithubOriginal {
  static mockConstructor: jest.Mock = jest.fn();
  static mockAccessTokenRequest: jest.Mock = jest.fn();
  static mockSearch: jest.Mock = jest.fn();

  constructor(origin: string | null, clientSecret?: string) {
    super(origin, clientSecret);
    Github.mockConstructor(origin, clientSecret);
  }

  async accessTokenRequest(...args: any): Promise<IOAuth2AccessTokenResponse> {
    return Github.mockAccessTokenRequest(...args);
  }

  async search(...args: any): Promise<Array<SearchResult>> {
    return Github.mockSearch(...args);
  }
}

module.exports = {
  ...connectors,
  ConfluenceServer,
  Slack,
  DemoSlack,
  Github,
};
