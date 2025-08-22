export interface ValidationResult {
  isValid: boolean;
  errorKey?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, errorKey: 'validation.emailRequired' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, errorKey: 'validation.emailInvalid' };
  }

  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.trim() === '') {
    return { isValid: false, errorKey: 'validation.passwordRequired' };
  }

  if (password.length < 6) {
    return { isValid: false, errorKey: 'validation.passwordTooShort' };
  }

  if (password.length > 255) {
    return { isValid: false, errorKey: 'validation.passwordTooLong' };
  }

  // Must contain at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  if (!hasLetter || !hasNumber) {
    return { isValid: false, errorKey: 'validation.passwordWeakPattern' };
  }

  return { isValid: true };
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, errorKey: 'validation.confirmPasswordRequired' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, errorKey: 'validation.passwordMismatch' };
  }

  return { isValid: true };
};
