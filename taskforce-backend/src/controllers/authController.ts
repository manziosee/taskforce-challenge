import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendEmail } from '../utils/email';
import logger from '../utils/logger';
import { ErrorHandler, HttpError } from '../utils';

// In-memory token blacklist
const revokedTokens = new Set<string>();

export const register = async (req: Request, res: Response): Promise<Response | void> => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Generate a random code for the email
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Send registration confirmation email with the code
    await sendEmail(email, 'Welcome to TaskForce Wallet', code);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Error registering user: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error registering user', 'InternalServerError'), res);
  }
};

export const login = async (req: Request, res: Response): Promise<Response | void> => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '1h' });
    res.json({ token, user:{
      id:user._id,
      name:user.name,
      }});
  } catch (error) {
    logger.error(`Error logging in: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error logging in', 'InternalServerError'), res);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId } = req.user!;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Error changing password: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error changing password', 'InternalServerError'), res);
  }
};

export const logout = async (req: Request, res: Response): Promise<Response | void> => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(400).json({ error: 'No token provided' });
  }

  try {
    // Add the token to the revoked tokens list
    revokedTokens.add(token);
    logger.info(`User logged out. Token revoked: ${token}`);
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Error during logout: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error during logout', 'InternalServerError'), res);
  }
};

// Middleware to check if a token is revoked
export const isTokenRevoked = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (token && revokedTokens.has(token)) {
    ErrorHandler.handle(new HttpError(401, 'Token revoked', 'UnauthenticatedError'), res);
    return;
  }
  next();
};
export const updateProfile = async (req: Request, res: Response): Promise<Response | void> => {
  const { userId } = req.user!;
  const { name, email } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: 'User not found' });

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    logger.error(`Error updating profile: ${error}`);
    ErrorHandler.handle(new HttpError(500, 'Error updating profile', 'InternalServerError'), res);
  }
};