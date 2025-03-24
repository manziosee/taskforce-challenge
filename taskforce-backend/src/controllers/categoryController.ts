import { Request, Response } from 'express';
import Category from '../models/Category';
import { HttpError, ErrorHandler } from '../utils/http/error-handler';
import logger from '../utils/logger';

export const getCategories = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const categories = await Category.find({ userId });
    res.json(categories);
  } catch (error) {
    logger.error(`Error fetching categories: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error fetching categories', 'InternalServerError'), res);
  }
};

export const addCategory = async (req: Request, res: Response) => {
  const { userId, name, type, subcategories } = req.body;

  try {
    // Check if category already exists
    const existingCategory = await Category.findOne({ userId, name });
    if (existingCategory) {
      return ErrorHandler.handle(
        new HttpError(400, 'Category already exists', 'ValidationError'),
        res
      );
    }

    const category = new Category({ 
      userId, 
      name, 
      type, 
      subcategories: subcategories || [] 
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    logger.error(`Error adding category: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error adding category', 'InternalServerError'), res);
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return ErrorHandler.handle(new HttpError(404, 'Category not found', 'NotFoundError'), res);
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting category: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error deleting category', 'InternalServerError'), res);
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, type } = req.body;

  try {
    // Check if new name already exists
    if (name) {
      const existingCategory = await Category.findOne({ 
        userId: req.body.userId, 
        name 
      });
      if (existingCategory && (existingCategory._id as string).toString() !== id) {
        return ErrorHandler.handle(
          new HttpError(400, 'Category name already exists', 'ValidationError'),
          res
        );
      }
    }

    const updateData: { name?: string; type?: string } = {};
    if (name) updateData.name = name;
    if (type) updateData.type = type;

    const category = await Category.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    );
    
    if (!category) {
      return ErrorHandler.handle(new HttpError(404, 'Category not found', 'NotFoundError'), res);
    }
    
    res.json(category);
  } catch (error) {
    logger.error(`Error updating category: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error updating category', 'InternalServerError'), res);
  }
};

export const updateSubcategory = async (req: Request, res: Response) => {
  const { id, subcategoryIndex } = req.params;
  const { value } = req.body;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return ErrorHandler.handle(new HttpError(404, 'Category not found', 'NotFoundError'), res);
    }

    const index = parseInt(subcategoryIndex, 10);
    if (isNaN(index)) {
      return ErrorHandler.handle(new HttpError(400, 'Invalid subcategory index', 'BadRequestError'), res);
    }

    if (index < 0 || index >= category.subcategories.length) {
      return ErrorHandler.handle(new HttpError(400, 'Subcategory index out of range', 'BadRequestError'), res);
    }

    category.subcategories[index] = value;
    await category.save();

    res.json(category);
  } catch (error) {
    logger.error(`Error updating subcategory: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error updating subcategory', 'InternalServerError'), res);
  }
};

export const deleteSubcategory = async (req: Request, res: Response) => {
  const { id, subcategoryIndex } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return ErrorHandler.handle(new HttpError(404, 'Category not found', 'NotFoundError'), res);
    }

    const index = parseInt(subcategoryIndex, 10);
    if (isNaN(index)) {
      return ErrorHandler.handle(new HttpError(400, 'Invalid subcategory index', 'BadRequestError'), res);
    }

    if (index < 0 || index >= category.subcategories.length) {
      return ErrorHandler.handle(new HttpError(400, 'Subcategory index out of range', 'BadRequestError'), res);
    }

    category.subcategories.splice(index, 1);
    await category.save();

    res.json(category);
  } catch (error) {
    logger.error(`Error deleting subcategory: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error deleting subcategory', 'InternalServerError'), res);
  }
};