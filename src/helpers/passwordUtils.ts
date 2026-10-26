import * as Yup from "yup";

export interface PasswordCriterion {
  id: "length" | "uppercase" | "lowercase" | "number" | "special";
  label: string;
  met: boolean;
}

export interface PasswordEvaluation {
  criteria: PasswordCriterion[];
  metCount: number;
  totalCriteria: number;
  progressPercent: number;
  strength: "empty" | "weak" | "fair" | "good" | "strong";
  strengthLabel: string;
  colorClass: string;
  barColorClass: string;
  isValid: boolean;
}

export const getPasswordCriteria = (password: string = ""): PasswordCriterion[] => [
  {
    id: "length",
    label: "At least 8 characters",
    met: password.length >= 8,
  },
  {
    id: "uppercase",
    label: "A capital letter (A-Z)",
    met: /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    label: "A small letter (a-z)",
    met: /[a-z]/.test(password),
  },
  {
    id: "number",
    label: "A number (0-9)",
    met: /[0-9]/.test(password),
  },
  {
    id: "special",
    label: "A special character (!@#$...)",
    met: /[^A-Za-z0-9]/.test(password),
  },
];

export const evaluatePassword = (password: string = ""): PasswordEvaluation => {
  const criteria = getPasswordCriteria(password);
  const metCount = criteria.filter((c) => c.met).length;
  const totalCriteria = criteria.length;
  const progressPercent = password.length === 0 ? 0 : Math.round((metCount / totalCriteria) * 100);

  if (!password || password.length === 0) {
    return {
      criteria,
      metCount: 0,
      totalCriteria,
      progressPercent: 0,
      strength: "empty",
      strengthLabel: "None",
      colorClass: "text-gray-400 dark:text-gray-500",
      barColorClass: "bg-gray-300 dark:bg-gray-700",
      isValid: false,
    };
  }

  if (metCount <= 2) {
    return {
      criteria,
      metCount,
      totalCriteria,
      progressPercent,
      strength: "weak",
      strengthLabel: "Weak",
      colorClass: "text-red-500",
      barColorClass: "bg-red-500",
      isValid: false,
    };
  }

  if (metCount === 3) {
    return {
      criteria,
      metCount,
      totalCriteria,
      progressPercent,
      strength: "fair",
      strengthLabel: "Fair",
      colorClass: "text-amber-500",
      barColorClass: "bg-amber-500",
      isValid: false,
    };
  }

  if (metCount === 4) {
    return {
      criteria,
      metCount,
      totalCriteria,
      progressPercent,
      strength: "good",
      strengthLabel: "Good",
      colorClass: "text-blue-500",
      barColorClass: "bg-blue-500",
      isValid: false,
    };
  }

  return {
    criteria,
    metCount,
    totalCriteria,
    progressPercent: 100,
    strength: "strong",
    strengthLabel: "Strong",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    barColorClass: "bg-emerald-500",
    isValid: true,
  };
};

export const validatePasswordRequirements = (password: string): { isValid: boolean; error?: string } => {
  if (!password || password.length === 0) {
    return { isValid: false, error: "Password is required" };
  }
  if (password.length < 8) {
    return { isValid: false, error: "Password must be at least 8 characters" };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one capital letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one small letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" };
  }
  return { isValid: true };
};

export const passwordValidationSchema = Yup.string()
  .required("Password is required.")
  .min(8, "Password must be at least 8 characters.")
  .matches(/[A-Z]/, "Password must contain at least one capital letter.")
  .matches(/[a-z]/, "Password must contain at least one small letter.")
  .matches(/[0-9]/, "Password must contain at least one number.")
  .matches(/[^A-Za-z0-9]/, "Password must contain at least one special character.");

export const optionalPasswordValidationSchema = Yup.string()
  .test(
    "password-rules",
    "Password must be at least 8 characters and include a capital letter, a small letter, a number, and a special character.",
    (val) => {
      if (!val || val.trim() === "") return true;
      const evaluation = evaluatePassword(val);
      return evaluation.isValid;
    }
  )
  .nullable();
