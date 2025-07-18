const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const db = require("../models");

class AuthService {

  async register(userData) {
    const { name, username, email, password } = userData;

    // Check if user already exists
    const existingUser = await db.user.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    if (existingUser) {
      throw new Error('Pengguna sudah terdaftar');
    }

    // Create new user
    const newUser = { name, username, email, password };
    const createdUser = await db.user.create(newUser);

    // Hapus password dari response untuk keamanan
    const { password: _, ...userWithoutPassword } = createdUser.toJSON();
    return userWithoutPassword;
  }

  async login(credentials) {
    const { login, password } = credentials;

    // Find user by email or username
    const user = await db.user.findOne({
      where: {
        [Op.or]: [
          { email: login },
          { username: login }
        ]
      }
    });
    if (!user) {
      throw new Error('Email/Username atau kata sandi tidak valid');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email/Username atau kata sandi tidak valid');
    }

    // Hapus password dari response untuk keamanan
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }
}

module.exports = new AuthService();