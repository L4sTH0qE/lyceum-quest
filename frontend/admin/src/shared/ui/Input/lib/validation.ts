export const validateTextInput = (value: string): boolean => {
  const textRegex = /^[a-zA-Zа-яА-ЯёЁ0-9]+$/;
  return textRegex.test(value);
};

export const validatePasswordInput = (value: string): boolean => {
  return value.length >= 6;
};

export const validateEmailInput = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};
