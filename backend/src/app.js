require('dotenv').config()
const path = require('path')
const fastifyAutoload = require("@fastify/autoload");
const fastifyCors = require("@fastify/cors");
const { errorResponse } = require('./helpers/response.helper');

const fastify = require("fastify")({
  logger: process.env.NODE_ENV !== 'production'
})

fastify.register(fastifyCors, {
  credentials: true,
  origin: process.env.APP_ORIGIN?.split(';')?.map(c => c.trim()) || ['*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
})

fastify.register(fastifyAutoload,
  {
    dir: path.join(__dirname, 'controllers'),
    options: {
      prefix: process.env.APP_PREFIX || '/api',
    }
  })

fastify.setNotFoundHandler((request, reply) => {
  const url = request.raw.url
  if (url !== undefined && url.startsWith((process.env.APP_PREFIX || '/api'))) {
    errorResponse(reply, 'API route not found', 404);
  } else {
    reply.sendFile('index.html')
  }
})

fastify.listen({ port: process.env.APP_PORT || 8000, host: '0.0.0.0' }, (err) => {
  if (err) {
    throw err
  }
  console.log('APP READY ON PORT ' + process.env.APP_PORT);
})