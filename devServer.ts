// Taken from https://steveholgado.com/aws-lambda-local-development/
const express = require('express');
const path = require('path');
const lambdaLocal = require('lambda-local');
const cors = require('cors');

const app = express();

// Process body as plain text as this is
// how it would come from API Gateway
app.use(express.text({type: '*/*'}));
app.use(cors());

// @ts-ignore
app.use('/connectors/:file/:handler', async (req, res) => {
  const event = {
    queryStringParameters: req.query,
    body: req.body,
  };
  console.debug('event', event);
  const result = await lambdaLocal.execute({
    lambdaPath: path.join(__dirname, 'connectors', req.params['file']),
    lambdaHandler: req.params['handler'],
    envfile: path.join(__dirname, '.env.dev'),
    event,
    timeoutMs: 30000,
  });
  res
  .status(result.statusCode)
  .set(result.headers)
  .end(result.body);
});

app.listen(3000, () => console.log('listening on port: 3000'));
