const { createVerifier } = require('fast-jwt');
const { JWT_SECRET } = process.env;

// Inisialisasi JWT verifier
const verifyJwt = createVerifier({ key: JWT_SECRET });

module.exports = async function authMiddleware(request, reply) {
  try {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'Unauthorized: Token missing' });
    }
    const token = authHeader.split(' ')[1];
    const payload = await verifyJwt(token);
    request.user = payload;
  } catch (err) {
    return reply.code(401).send({ message: 'Unauthorized: Invalid token' });
  }
};
