export const NAME_REGEX = /^[A-Za-z ]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const OTP_REGEX = /^\d{4}$/;
export const MIN_PASSWORD_LENGTH = 6;

export const normalizeWhitespace = (value: string) => value.trim().replace(/\s+/g, " ");
export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const sanitizeNameInput = (value: string) => value.replace(/[^A-Za-z ]/g, "");
export const sanitizePhoneInput = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
  if (digitsOnly && !/[6-9]/.test(digitsOnly[0])) return "";
  return digitsOnly;
};
export const sanitizePincodeInput = (value: string) => value.replace(/\D/g, "").slice(0, 6);
export const sanitizeOtpInput = (value: string) => value.replace(/\D/g, "").slice(0, 4);

export const isValidName = (value: string) => NAME_REGEX.test(normalizeWhitespace(value));
export const isValidEmail = (value: string) => EMAIL_REGEX.test(normalizeEmail(value));
export const isValidPhone = (value: string) => PHONE_REGEX.test(value.trim());
export const isValidPincode = (value: string) => PINCODE_REGEX.test(value.trim());
export const isValidOtp = (value: string) => OTP_REGEX.test(value.trim());
export const isValidPassword = (value: string) => value.length >= MIN_PASSWORD_LENGTH;
