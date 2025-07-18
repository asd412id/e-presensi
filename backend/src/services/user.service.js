const db = require("../models");

class UserService {
  constructor(userRepository) {
    this.userRepository = db.user;
  }

  async getById(userId) {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user: ${error.message}`);
    }
  }

  async getByUuid(uuid) {
    try {
      const user = await this.userRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw new Error(`Error fetching user by uuid: ${error.message}`);
    }
  }
}

module.exports = new UserService();
