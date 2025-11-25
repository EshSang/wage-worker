const prisma = require('../config/prisma');

class AuthService {
  /**
   * Find user by email
   */
  async findUserByEmail(email) {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  /**
   * Create a new user
   */
  async createUser(userData) {
    return await prisma.user.create({
      data: userData
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    return await prisma.user.findUnique({
      where: { id: userId }
    });
  }

  /**
   * Update user password
   */
  async updatePassword(email, newPassword) {
    return await prisma.user.update({
      where: { email },
      data: { password: newPassword }
    });
  }

  /**
   * Update user profile
   */
  async updateUser(userId, updateData) {
    console.log(`[${new Date().toISOString()}] AuthService.updateUser - userId: ${userId}, updateData:`, updateData);

    const result = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    console.log(`[${new Date().toISOString()}] AuthService.updateUser - Update result:`, result);

    return result;
  }
}

module.exports = new AuthService();
