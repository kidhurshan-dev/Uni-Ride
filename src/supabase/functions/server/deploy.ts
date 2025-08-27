// Simple deployment trigger - this file helps ensure the server is deployed
// when the backend code changes
export const deployment = {
  version: '1.0.0',
  timestamp: new Date().toISOString(),
  name: 'uni-ride-server'
};

console.log('🚀 Deployment triggered:', deployment);