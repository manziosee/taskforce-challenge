"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubcategory = exports.updateSubcategory = exports.updateCategory = exports.deleteCategory = exports.addCategory = exports.getCategories = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const error_handler_1 = require("../utils/http/error-handler");
const logger_1 = __importDefault(require("../utils/logger"));
const getCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const categories = yield Category_1.default.find({ userId });
        res.json(categories);
    }
    catch (error) {
        logger_1.default.error(`Error fetching categories: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error fetching categories', 'InternalServerError'), res);
    }
});
exports.getCategories = getCategories;
const addCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, name, type, subcategories } = req.body;
    try {
        // Check if category already exists
        const existingCategory = yield Category_1.default.findOne({ userId, name });
        if (existingCategory) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Category already exists', 'ValidationError'), res);
        }
        const category = new Category_1.default({
            userId,
            name,
            type,
            subcategories: subcategories || []
        });
        yield category.save();
        res.status(201).json(category);
    }
    catch (error) {
        logger_1.default.error(`Error adding category: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error adding category', 'InternalServerError'), res);
    }
});
exports.addCategory = addCategory;
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const category = yield Category_1.default.findByIdAndDelete(id);
        if (!category) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Category not found', 'NotFoundError'), res);
        }
        res.json({ message: 'Category deleted successfully' });
    }
    catch (error) {
        logger_1.default.error(`Error deleting category: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error deleting category', 'InternalServerError'), res);
    }
});
exports.deleteCategory = deleteCategory;
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, type } = req.body;
    try {
        // Check if new name already exists
        if (name) {
            const existingCategory = yield Category_1.default.findOne({
                userId: req.body.userId,
                name
            });
            if (existingCategory && existingCategory._id.toString() !== id) {
                return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Category name already exists', 'ValidationError'), res);
            }
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (type)
            updateData.type = type;
        const category = yield Category_1.default.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Category not found', 'NotFoundError'), res);
        }
        res.json(category);
    }
    catch (error) {
        logger_1.default.error(`Error updating category: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error updating category', 'InternalServerError'), res);
    }
});
exports.updateCategory = updateCategory;
const updateSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, subcategoryIndex } = req.params;
    const { value } = req.body;
    try {
        const category = yield Category_1.default.findById(id);
        if (!category) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Category not found', 'NotFoundError'), res);
        }
        const index = parseInt(subcategoryIndex, 10);
        if (isNaN(index)) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Invalid subcategory index', 'BadRequestError'), res);
        }
        if (index < 0 || index >= category.subcategories.length) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Subcategory index out of range', 'BadRequestError'), res);
        }
        category.subcategories[index] = value;
        yield category.save();
        res.json(category);
    }
    catch (error) {
        logger_1.default.error(`Error updating subcategory: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error updating subcategory', 'InternalServerError'), res);
    }
});
exports.updateSubcategory = updateSubcategory;
const deleteSubcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, subcategoryIndex } = req.params;
    try {
        const category = yield Category_1.default.findById(id);
        if (!category) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(404, 'Category not found', 'NotFoundError'), res);
        }
        const index = parseInt(subcategoryIndex, 10);
        if (isNaN(index)) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Invalid subcategory index', 'BadRequestError'), res);
        }
        if (index < 0 || index >= category.subcategories.length) {
            return error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(400, 'Subcategory index out of range', 'BadRequestError'), res);
        }
        category.subcategories.splice(index, 1);
        yield category.save();
        res.json(category);
    }
    catch (error) {
        logger_1.default.error(`Error deleting subcategory: ${error}`);
        error_handler_1.ErrorHandler.handle(new error_handler_1.HttpError(500, 'Error deleting subcategory', 'InternalServerError'), res);
    }
});
exports.deleteSubcategory = deleteSubcategory;
