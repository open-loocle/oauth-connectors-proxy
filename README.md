# OAuth connectors proxy

Proxy for oauth-connectors.

Because of CORS policies the connectors normally cannot be used straight from the browser.

## Deploy

Setup credentials first:

    serverless config credentials --provider aws --key ******************** --secret **************************************** 

The credentials are store in last pass.

Then run:

    npm run deploy
