const options = {
  info: {
    version: '1.0.0',
    title: "node-template",
    description:"node-template's interface documentation",
    license: {
      name: 'MIT',
    },
  },
  security: {
    BasicAuth: {
      type: 'apiKey',  
      in: 'header',  
      name: 'Authorization'
    },
  },
  swaggerUiOptions: {
    requestInterceptor: function(request) {  
      if (token) {  
        request.headers['Authorization'] = 'Bearer ' + token;  
      }  
      return request;  
    },  
  },
  baseDir: __dirname,
  filesPattern: './**/*.js',
  swaggerUIPath: '/docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
  swaggerUiOptions: {},
  multiple: true,
};

module.exports = options;