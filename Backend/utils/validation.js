export const NAME_REGEX = /^[A-Za-z ]+$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;
export const OTP_REGEX = /^\d{4}$/;
export const MIN_PASSWORD_LENGTH = 6;

export const normalizeWhitespace = (value = "") => value.trim().replace(/\s+/g, " ");
export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const isValidName = (value = "") => NAME_REGEX.test(normalizeWhitespace(value));
export const isValidEmail = (value = "") => EMAIL_REGEX.test(normalizeEmail(value));
export const isValidPhone = (value = "") => PHONE_REGEX.test(value.trim());
export const isValidPincode = (value = "") => PINCODE_REGEX.test(value.trim());
export const isValidOtp = (value = "") => OTP_REGEX.test(value.trim());
export const isValidPassword = (value = "") => value.length >= MIN_PASSWORD_LENGTH;
