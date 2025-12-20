const prisma = require('../config/prisma');


class CustomerPostedJobsService {

    /**
  * Get all customer posted jobs
  */
    async getAllPostedJobs() {
        return await prisma.job.findMany({
            orderBy: {
                postedDate: 'desc'
            },
            include: {
                category: true,
                createdUser: {
                    select: {
                        id: true,
                        email: true,
                        fname: true,
                        lname: true

                    }
                }

            }
        });
    }
}

module.exports = new CustomerPostedJobsService();