const categoryService = require('../services/category.service');

class CategoryController {
  /**
   * Get all job categories
   */
  async getAllCategories(req, res) {
    try {
      console.log(`[${new Date().toISOString()}] Fetching all categories - User: ${req.user.email} (ID: ${req.user.id})`);

      const categories = await categoryService.getAllCategories();

      console.log(`[${new Date().toISOString()}] Found ${categories.length} categories`);

      res.json({
        message: "Categories fetched successfully",
        categories
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Get all categories error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Create a new category (admin only)
   */
  async createCategory(req, res) {
    try {
      const { category } = req.body;

      // Validation
      if (!category) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      console.log(`[${new Date().toISOString()}] Creating category: ${category} - User: ${req.user.email}`);

      const newCategory = await categoryService.createCategory({ category });

      console.log(`[${new Date().toISOString()}] Category created successfully - ID: ${newCategory.id}`);

      res.status(201).json({
        message: "Category created successfully",
        category: newCategory
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Create category error:`, error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Update a category (admin only)
   */
  async updateCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { category } = req.body;

      // Validation
      if (!category) {
        return res.status(400).json({ message: 'Category name is required' });
      }

      console.log(`[${new Date().toISOString()}] Updating category ID: ${categoryId} - User: ${req.user.email}`);

      const updatedCategory = await categoryService.updateCategory(
        parseInt(categoryId),
        { category }
      );

      console.log(`[${new Date().toISOString()}] Category updated successfully - ID: ${categoryId}`);

      res.json({
        message: "Category updated successfully",
        category: updatedCategory
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Update category error:`, error);

      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }

  /**
   * Delete a category (admin only)
   */
  async deleteCategory(req, res) {
    try {
      const { categoryId } = req.params;

      console.log(`[${new Date().toISOString()}] Deleting category ID: ${categoryId} - User: ${req.user.email}`);

      await categoryService.deleteCategory(parseInt(categoryId));

      console.log(`[${new Date().toISOString()}] Category deleted successfully - ID: ${categoryId}`);

      res.json({
        message: "Category deleted successfully"
      });

    } catch (error) {
      console.error(`[${new Date().toISOString()}] Delete category error:`, error);

      if (error.code === 'P2025') {
        return res.status(404).json({ message: 'Category not found' });
      }

      res.status(500).json({
        message: "Internal server error",
        error: error.message
      });
    }
  }
}

module.exports = new CategoryController();
