const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

class AuthController {
  /**
   * User signin
   */
  async signin(req, res) {
    try {
      const { email, password } = req.body;

      // Validation
      if (!email || !password) {
        return res.status(400).json({ message: "Email & Password required" });
      }

      console.log(`[${new Date().toISOString()}] Login attempt for email: ${email}`);

      // Find user
      const user = await authService.findUserByEmail(email);

      if (!user) {
        console.log(`[${new Date().toISOString()}] Login failed - user not found: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        console.log(`[${new Date().toISOString()}] Login failed - invalid password for: ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          usertype: user.usertype
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      console.log(`[${new Date().toISOString()}] Login successful for user: ${email} (ID: ${user.id})`);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Login successful",
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Signin error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * User signup
   */
  async signup(req, res) {
    try {
      const { fname, lname, phonenumber, email, password, address, usertype } = req.body;

      // Validation
      if (!fname || !lname || !phonenumber || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      console.log(`[${new Date().toISOString()}] Signup attempt for email: ${email}`);

      // Check if user already exists
      const existingUser = await authService.findUserByEmail(email);

      if (existingUser) {
        console.log(`[${new Date().toISOString()}] Signup failed - user already exists: ${email}`);
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await authService.createUser({
        fname,
        lname,
        phonenumber: phonenumber || null,
        email,
        password: hashedPassword,
        address: address || null,
        usertype: usertype || 'USER'
      });

      console.log(`[${new Date().toISOString()}] Signup successful for user: ${email} (ID: ${newUser.id})`);

      // Return user data without password
      const { password: _, ...userWithoutPassword } = newUser;

      res.status(201).json({
        message: "User created successfully",
        user: userWithoutPassword
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Signup error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const userId = req.user.id;

      console.log(`[${new Date().toISOString()}] Fetching profile for user ID: ${userId}`);

      const user = await authService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Return user data without password
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: "Profile fetched successfully",
        user: userWithoutPassword
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get profile error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { phonenumber, address, skills, about } = req.body;

      console.log(`[${new Date().toISOString()}] Updating profile for user ID: ${userId}`);

      const updatedUser = await authService.updateUser(userId, {
        phonenumber,
        address,
        skills,
        about
      });

      // Return user data without password
      const { password: _, ...userWithoutPassword } = updatedUser;

      console.log(`[${new Date().toISOString()}] Profile updated successfully for user ID: ${userId}`);

      res.json({
        message: "Profile updated successfully",
        user: userWithoutPassword
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Update profile error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Test password (development only)
   */
  async testPassword(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await authService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      res.json({
        email: user.email,
        passwordMatch: isMatch,
        storedHash: user.password,
        message: isMatch ? "Password matches!" : "Password does not match"
      });

    } catch (error) {
      console.error("Test password error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Reset password (development only)
   */
  async resetPassword(req, res) {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password required" });
      }

      const user = await authService.findUserByEmail(email);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await authService.updatePassword(email, hashedPassword);

      console.log(`[${new Date().toISOString()}] Password reset successful for: ${email}`);

      res.json({
        message: "Password reset successful",
        email: user.email
      });

    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
