
export const validateEmail = (email) => {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  if (!phone) return false; 
  const regex = /^\+?[0-9\s\-]{10,15}$/;
  return regex.test(phone);
};

export const validatePassword = (password) => {
  if (!password) return false;
  return password.length >= 6; 
};

export const validateRequired = (value) => {
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== null && value !== undefined;
};

export const validatePositiveNumber = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
};