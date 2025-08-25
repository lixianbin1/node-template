const options = {
  info: {
    version: '1.0.0',
    title: "node-template",
    description:"node-template 项目的Swagger文档",
    license: {
      name: 'MIT',
    },
  },
  security: {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
    },
  },
  baseDir: __dirname,
  filesPattern: './**/*.js',
  swaggerUIPath: '/docs',
  exposeSwaggerUI: true,
  exposeApiDocs: false,
  apiDocsPath: '/v3/api-docs',
  notRequiredAsNullable: false,
  multiple: true,
};

module.exports = options;