import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
import { AuthService } from './auth.service';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookie.util';
import { env } from '../../config/env';

const authService = new AuthService();

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await authService.register(data);
      
      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);
      
      res.status(201).json({
        message: 'User registered successfully',
        user: result.user,
        accessToken: result.accessToken, // Also send in response for flexibility
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
  
  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data = req.body;
      const result = await authService.login(data);
      
      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);
      
      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
  
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.cookies?.accessToken;
      
      if (token) {
        await authService.logout(token);
      }
      
      clearAuthCookies(res);
      
      res.json({ message: 'Logout successful' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken;
      
      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }
      
      const result = await authService.refreshToken(refreshToken);
      
      // Set new cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);
      
      res.json({
        message: 'Token refreshed successfully',
        accessToken: result.accessToken,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
  
  async me(req: AuthRequest, res: Response): Promise<void> {
    authService.me(req.user!.id).then(userProfile => {
      res.json({ user: userProfile });
    });
  }
  
  // OAuth Callback Handler
  oauthCallback(req: AuthRequest, res: Response): void {
    try {
      const user = req.user as any;
      const result = authService.generateTokens(user);
      
      // Set cookies
      setAuthCookies(res, result.accessToken, result.refreshToken);
      
      // Redirect to frontend with success
      res.redirect(`${env.FRONTEND_URL}/auth/success`);
    } catch (error: any) {
      res.redirect(`${env.FRONTEND_URL}/auth/error`);
    }
  }
}