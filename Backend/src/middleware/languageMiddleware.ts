import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request interface with language property
 */
export interface RequestWithLanguage extends Request {
  language?: string;
}

/**
 * Middleware to extract language from request headers
 * Looks for 'Accept-Language' or 'X-Language' headers
 * Defaults to 'pt' (Portuguese) if not specified
 */
export const languageMiddleware = (req: RequestWithLanguage, res: Response, next: NextFunction) => {
  // Check for custom language header first (X-Language)
  let language = req.headers['x-language'] as string;
  
  // If not found, check Accept-Language header
  if (!language) {
    const acceptLanguage = req.headers['accept-language'] as string;
    if (acceptLanguage) {
      // Extract the first language code (e.g., "pt-BR,pt;q=0.9,en;q=0.8" -> "pt")
      const parts = acceptLanguage.split(',')[0];
      if (parts) {
        const langParts = parts.split('-');
        if (langParts[0]) {
          language = langParts[0].toLowerCase();
        }
      }
    }
  }
  
  // Default to Portuguese if no language specified
  req.language = language || 'pt';
  
  // Validate language code (only allow supported languages)
  const supportedLanguages = ['pt', 'en', 'es'];
  if (!supportedLanguages.includes(req.language)) {
    req.language = 'pt';
  }
  
  console.log(`🌍 Language middleware: ${req.method} ${req.path} -> language: ${req.language} (from headers: x-language=${req.headers['x-language']}, accept-language=${req.headers['accept-language']})`);
  
  next();
};
