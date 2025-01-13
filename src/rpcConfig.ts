export const rpcConfig = {
  endpoints: {
    '/authInfo': {
      method: 'handleAuthInfo',
      params: ['username'],
    },
    '/connection': {
      method: 'handleConnection',
      params: ['username'],
    },
    '/org': {
      method: 'handleOrg',
      params: ['username'],
    },
    '/lifecycle': {
      method: 'handleLifecycle',
      params: ['eventName'],
    },
  },
};
