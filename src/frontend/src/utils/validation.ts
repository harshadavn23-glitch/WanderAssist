// Shared validation utilities for WanderAssist
// Each validator returns { valid: boolean, message: string }

export interface ValidationResult {
  valid: boolean;
  message: string;
}

/** Required field — rejects empty strings, null, undefined */
export function isRequired(value: string | null | undefined): ValidationResult {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0
    ? { valid: true, message: "" }
    : { valid: false, message: "This field is required." };
}

/** Basic email format check */
export function isValidEmail(email: string): ValidationResult {
  const req = isRequired(email);
  if (!req.valid) return { valid: false, message: "Email is required." };
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email.trim())
    ? { valid: true, message: "" }
    : { valid: false, message: "Enter a valid email address." };
}

/** Phone: 10-digit Indian mobile number (optionally prefixed with +91 or 0) */
export function isValidPhone(phone: string): ValidationResult {
  const req = isRequired(phone);
  if (!req.valid) return { valid: false, message: "Phone number is required." };
  const digits = phone.replace(/[\s\-+]/g, "").replace(/^(91|0)/, "");
  if (!/^\d{10}$/.test(digits)) {
    return { valid: false, message: "Enter a valid 10-digit phone number." };
  }
  return { valid: true, message: "" };
}

/** Passport number: alphanumeric, 6–9 characters */
export function isValidPassportNo(passport: string): ValidationResult {
  const req = isRequired(passport);
  if (!req.valid)
    return { valid: false, message: "Passport number is required." };
  const pattern = /^[A-Z0-9]{6,9}$/i;
  return pattern.test(passport.trim())
    ? { valid: true, message: "" }
    : {
        valid: false,
        message: "Enter a valid passport number (6–9 alphanumeric characters).",
      };
}

/** Passport expiry: must be a future date in YYYY-MM-DD or MM/YYYY format */
export function isValidPassportExpiry(expiry: string): ValidationResult {
  const req = isRequired(expiry);
  if (!req.valid)
    return { valid: false, message: "Passport expiry date is required." };

  let expiryDate: Date | null = null;

  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(expiry)) {
    expiryDate = new Date(expiry);
  }
  // Try MM/YYYY
  else if (/^\d{2}\/\d{4}$/.test(expiry)) {
    const [month, year] = expiry.split("/");
    expiryDate = new Date(
      Number.parseInt(year, 10),
      Number.parseInt(month, 10) - 1,
      1,
    );
  }

  if (!expiryDate || Number.isNaN(expiryDate.getTime())) {
    return {
      valid: false,
      message: "Enter a valid expiry date (MM/YYYY or YYYY-MM-DD).",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expiryDate >= today
    ? { valid: true, message: "" }
    : {
        valid: false,
        message: "Passport has expired. Enter a future expiry date.",
      };
}

/** Generic date — must be a valid calendar date in YYYY-MM-DD format */
export function isValidDate(date: string): ValidationResult {
  const req = isRequired(date);
  if (!req.valid) return { valid: false, message: "Date is required." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return {
      valid: false,
      message: "Enter a valid date in YYYY-MM-DD format.",
    };
  }
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    return { valid: false, message: "Enter a valid date." };
  }
  return { valid: true, message: "" };
}

/** Future date — must be today or later */
export function isFutureDate(date: string): ValidationResult {
  const base = isValidDate(date);
  if (!base.valid) return base;
  const d = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d >= today
    ? { valid: true, message: "" }
    : { valid: false, message: "Date must be today or in the future." };
}

/** Credit/debit card number: 13–19 digits, passes Luhn check */
export function isValidCardNumber(num: string): ValidationResult {
  const req = isRequired(num);
  if (!req.valid) return { valid: false, message: "Card number is required." };
  const digits = num.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) {
    return {
      valid: false,
      message: "Enter a valid card number (13–19 digits).",
    };
  }
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number.parseInt(digits[i], 10);
    if (shouldDouble) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0
    ? { valid: true, message: "" }
    : { valid: false, message: "Card number is invalid." };
}

/** Card expiry: MM/YY or MM/YYYY, must be a future month */
export function isValidExpiry(expiry: string): ValidationResult {
  const req = isRequired(expiry);
  if (!req.valid)
    return { valid: false, message: "Card expiry date is required." };
  const pattern = /^(0[1-9]|1[0-2])\/?(\d{2}|\d{4})$/;
  if (!pattern.test(expiry.trim())) {
    return {
      valid: false,
      message: "Enter expiry in MM/YY or MM/YYYY format.",
    };
  }
  const [mm, yy] = expiry.split("/");
  const month = Number.parseInt(mm, 10) - 1;
  const year =
    yy.length === 2 ? 2000 + Number.parseInt(yy, 10) : Number.parseInt(yy, 10);
  const expiryDate = new Date(year, month + 1, 0); // last day of expiry month
  const today = new Date();
  today.setDate(1);
  today.setHours(0, 0, 0, 0);
  return expiryDate >= today
    ? { valid: true, message: "" }
    : {
        valid: false,
        message: "Card has expired. Enter a future expiry date.",
      };
}

/** CVV: 3 or 4 digits */
export function isValidCVV(cvv: string): ValidationResult {
  const req = isRequired(cvv);
  if (!req.valid) return { valid: false, message: "CVV is required." };
  return /^\d{3,4}$/.test(cvv.trim())
    ? { valid: true, message: "" }
    : { valid: false, message: "CVV must be 3 or 4 digits." };
}

/** UPI ID: user@provider format */
export function isValidUPI(upiId: string): ValidationResult {
  const req = isRequired(upiId);
  if (!req.valid) return { valid: false, message: "UPI ID is required." };
  const pattern = /^[\w.\-]+@[\w.\-]+$/;
  return pattern.test(upiId.trim())
    ? { valid: true, message: "" }
    : { valid: false, message: "Enter a valid UPI ID (e.g. name@upi)." };
}

/** Age validation from date-of-birth string (YYYY-MM-DD) */
export function isValidAge(
  dob: string,
  minAge: number,
  maxAge?: number,
): ValidationResult {
  const dateCheck = isValidDate(dob);
  if (!dateCheck.valid)
    return { valid: false, message: "Date of birth is required." };

  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;

  if (age < minAge) {
    return {
      valid: false,
      message: `Minimum age is ${minAge} years. Please check the date of birth.`,
    };
  }
  if (maxAge !== undefined && age > maxAge) {
    return {
      valid: false,
      message: `Maximum age is ${maxAge} years. Please check the date of birth.`,
    };
  }
  return { valid: true, message: "" };
}

/** Positive number — rejects zero, negative, and non-numeric values */
export function isPositiveNumber(val: string | number): ValidationResult {
  const n = typeof val === "string" ? Number.parseFloat(val) : val;
  if (Number.isNaN(n))
    return { valid: false, message: "Please enter a valid number." };
  return n > 0
    ? { valid: true, message: "" }
    : { valid: false, message: "Value must be greater than zero." };
}

/** Indian PIN code: exactly 6 digits */
export function isValidPIN(pin: string): ValidationResult {
  const req = isRequired(pin);
  if (!req.valid) return { valid: false, message: "PIN code is required." };
  return /^\d{6}$/.test(pin.trim())
    ? { valid: true, message: "" }
    : { valid: false, message: "Enter a valid 6-digit PIN code." };
}

/**
 * Validate password strength.
 * Rules: min 8 chars, at least one uppercase (A-Z), one lowercase (a-z),
 * one digit (0-9), one symbol (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * Returns an array of unmet rule descriptions — empty array means all pass.
 */
export function validatePassword(password: string): string[] {
  const unmet: string[] = [];
  if (password.length < 8) unmet.push("At least 8 characters");
  if (!/[A-Z]/.test(password))
    unmet.push("At least one uppercase letter (A-Z)");
  if (!/[a-z]/.test(password))
    unmet.push("At least one lowercase letter (a-z)");
  if (!/[0-9]/.test(password)) unmet.push("At least one digit (0-9)");
  if (!/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(password))
    unmet.push("At least one symbol (!@#$%^&*...)");
  return unmet;
}
