declare module 'swagger-ui-express' {
  import express = require('express');
  const swaggerUi: {
    serve: express.RequestHandler[];
    setup: (spec?: any, opts?: any) => express.RequestHandler;
  };
  export = swaggerUi;
}
