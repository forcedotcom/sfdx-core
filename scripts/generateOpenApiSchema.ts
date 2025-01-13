import { writeFileSync } from 'fs';
import { rpcConfig } from '../src/rpcConfig';

const openApiSchema = {
  openapi: '3.1.0',
  info: {
    title: 'RPC Server API',
    version: '1.0.0',
  },
  paths: {},
};

for (const [path, config] of Object.entries(rpcConfig.endpoints)) {
  openApiSchema.paths[path] = {
    get: {
      summary: `Call ${config.method}`,
      parameters: config.params.map((param) => ({
        name: param,
        in: 'query',
        required: true,
        schema: {
          type: 'string',
        },
      })),
      responses: {
        200: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  result: {
                    type: 'object',
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}

writeFileSync('openApiSchema.json', JSON.stringify(openApiSchema, null, 2));
console.log('OpenAPI 3.1 schema generated successfully');
