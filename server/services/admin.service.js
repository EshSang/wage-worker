const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

/**
 * Get all users with filters and pagination
 */
async function getAllUsers(filters = {}) {
  try {
    const { usertype, search, page = 1, limit = 20 } = filters;

    const where = {};

    // Filter by user type
    if (usertype && usertype !== 'ALL') {
      where.usertype = usertype;
    }

    // Search filter (name or email)
    if (search) {
      where.OR = [
        { fname: { contains: search } },
        { lname: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fname: true,
          lname: true,
          phonenumber: true,
          address: true,
          skills: true,
          about: true,
          usertype: true,
          _count: {
            select: {
              jobs: true,
              jobApplications: true,
              orders: true,
            }
          }
        },
        orderBy: {
          id: 'desc'
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where })
    ]);

    return {
      users,
      pagination: {
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        pageSize: limit,
      }
    };
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
}

/**
 * Get user statistics
 */
async function getUserStatistics() {
  try {
    const [
      totalUsers,
      adminUsers,
      workerUsers,
      customerUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { usertype: 'ADMIN' } }),
      prisma.user.count({ where: { usertype: 'USER' } }),
      prisma.user.count({ where: { usertype: 'CUSTOMER' } }),
    ]);

    return {
      totalUsers,
      adminUsers,
      workerUsers,
      customerUsers,
    };
  } catch (error) {
    console.error('Error in getUserStatistics:', error);
    throw error;
  }
}

/**
 * Get single user by ID
 */
async function getUserById(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
        usertype: true,
        _count: {
          select: {
            jobs: true,
            jobApplications: true,
            orders: true,
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

/**
 * Create new user (admin)
 */
async function createUser(userData) {
  try {
    const { email, password, fname, lname, phonenumber, address, skills, about, usertype } = userData;

    // Validate required fields
    if (!email || !password || !fname || !lname) {
      throw new Error('Email, password, first name, and last name are required');
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fname,
        lname,
        phonenumber: phonenumber || null,
        address: address || null,
        skills: skills || null,
        about: about || null,
        usertype: usertype || 'USER',
      },
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
        usertype: true,
      }
    });

    console.log('User created successfully:', user.id);
    return user;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

/**
 * Update user (admin)
 */
async function updateUser(userId, userData) {
  try {
    const { email, fname, lname, phonenumber, address, skills, about, usertype, password } = userData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== existingUser.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: parseInt(userId) }
        }
      });

      if (emailTaken) {
        throw new Error('Email already taken');
      }
    }

    // Prepare update data
    const updateData = {};
    if (email) updateData.email = email;
    if (fname) updateData.fname = fname;
    if (lname) updateData.lname = lname;
    if (phonenumber !== undefined) updateData.phonenumber = phonenumber;
    if (address !== undefined) updateData.address = address;
    if (skills !== undefined) updateData.skills = skills;
    if (about !== undefined) updateData.about = about;
    if (usertype) updateData.usertype = usertype;

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        fname: true,
        lname: true,
        phonenumber: true,
        address: true,
        skills: true,
        about: true,
        usertype: true,
      }
    });

    console.log('User updated successfully:', user.id);
    return user;
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

/**
 * Delete user (admin)
 */
async function deleteUser(userId) {
  try {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user has active orders
    const activeOrders = await prisma.order.count({
      where: {
        userId: parseInt(userId),
        status: {
          in: ['PENDING', 'ACCEPTED']
        }
      }
    });

    if (activeOrders > 0) {
      throw new Error(`Cannot delete user with ${activeOrders} active orders. Please complete or cancel them first.`);
    }

    // Check if user (as customer) has active jobs with pending applications
    const activeJobsAsCustomer = await prisma.job.count({
      where: {
        createdUserId: parseInt(userId),
        status: 'Open',
        jobApplications: {
          some: {
            applicationStatus: {
              in: ['APPLIED', 'PENDING']
            }
          }
        }
      }
    });

    if (activeJobsAsCustomer > 0) {
      throw new Error(`Cannot delete user with ${activeJobsAsCustomer} active jobs that have pending applications.`);
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(userId) }
    });

    console.log('User deleted successfully:', userId);
    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Error in deleteUser:', error);
    throw error;
  }
}

module.exports = {
  getAllUsers,
  getUserStatistics,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
