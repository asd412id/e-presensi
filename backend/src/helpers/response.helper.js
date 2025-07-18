function errorResponse(reply, message, statusCode = 400) {
  reply.status(statusCode).send({
    status: 'error',
    message
  });
}

function successResponse(reply, data, message = 'Success', statusCode = 200) {
  reply.status(statusCode).send({
    status: 'success',
    message,
    data
  });
}

module.exports = {
  errorResponse,
  successResponse
};