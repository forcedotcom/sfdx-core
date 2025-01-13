import { writeFileSync } from 'fs';
import { rpcConfig } from '../src/rpcConfig';

const schema = {
  type: 'object',
  properties: {
    endpoints: {
      type: 'object',
      patternProperties: {
        '^/.*': {
          type: 'object',
          properties: {
            method: { type: 'string' },
            params: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          required: ['method', 'params'],
        },
      },
    },
  },
  required: ['endpoints'],
};

writeFileSync('rpcSchema.json', JSON.stringify(schema, null, 2));
console.log('JSON schema generated successfully');
