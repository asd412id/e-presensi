const { successResponse, errorResponse } = require("../../helpers/response.helper");
const { generateToken } = require("../../helpers/jwt.helper");
const authService = require("../../services/auth.service");
const authMiddleware = require("../../middleware/auth.middleware");
const userService = require("../../services/user.service");

function authController(route) {
  route.post('/register', {
    schema: {
      body: {
        type: 'object',
        required: ['name', 'username', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 1 },
          username: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    try {
      const user = await authService.register(request.body);
      const token = generateToken({ uuid: user.uuid });
      successResponse(reply, { user, token }, 'Pengguna berhasil didaftarkan');
    } catch (error) {
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  route.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['login', 'password'],
        properties: {
          login: { type: 'string', minLength: 1 },
          password: { type: 'string', minLength: 1 },
        },
        additionalProperties: false,
      },
    },
  }, async (request, reply) => {
    try {
      const user = await authService.login(request.body);
      const token = generateToken({ uuid: user.uuid });
      successResponse(reply, { user, token }, 'Pengguna berhasil masuk');
    } catch (error) {
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  route.get('/me', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      const uuid = request.user.uuid;
      const user = await userService.getByUuid(uuid);
      if (!user) {
        return errorResponse(reply, 'Pengguna tidak ditemukan', 404);
      }
      delete user.dataValues.password; // Hapus password dari response untuk keamanan
      successResponse(reply, user, 'Pengguna terautentikasi');
    } catch (error) {
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });

  route.post('/logout', { preHandler: authMiddleware }, async (request, reply) => {
    try {
      // Implementasi logout: pada JWT stateless, cukup informasikan ke client untuk menghapus token
      successResponse(reply, null, 'Pengguna berhasil logout');
    } catch (error) {
      errorResponse(reply, `Terjadi kesalahan: ${error.message}`);
    }
  });
}

module.exports = authController;