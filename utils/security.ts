import { Platform } from 'react-native';

class SecurityManager {
  // Sanitize user input to prevent XSS and injection attacks
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Check if running in secure environment
  isSecureEnvironment(): boolean {
    if (Platform.OS === 'web') {
      return window.location.protocol === 'https:' || 
             window.location.hostname === 'localhost';
    }
    return true; // Mobile apps are considered secure
  }

  // Generate secure random string
  generateSecureId(length: number = 16): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Validate file upload
  validateFileUpload(file: {
    type?: string;
    size?: number;
    name?: string;
  }): {
    isValid: boolean;
    error?: string;
  } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
    ];

    if (file.size && file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB',
      };
    }

    if (file.type && !allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not allowed',
      };
    }

    return { isValid: true };
  }

  // Rate limiting for API calls
  private rateLimitMap = new Map<string, number[]>();

  checkRateLimit(key: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
    const now = Date.now();
    const requests = this.rateLimitMap.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.rateLimitMap.set(key, validRequests);
    
    return true; // Request allowed
  }
}

export const security = new SecurityManager();