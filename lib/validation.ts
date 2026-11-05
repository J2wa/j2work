import { z } from "zod";
export const settings = ["Full-Time", "Part-Time", "Project-Basis"] as const;
export const MAX_RESUME_SIZE = 5 * 1024 * 1024;
export const resumeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(120),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (v) => !v || /^[+\d\s().-]{7,30}$/.test(v),
      "Enter a valid phone number.",
    ),
  preferredWorkSetting: z.enum(settings, {
    error: "Choose your preferred work setting.",
  }),
  referredBy: z.string().trim().max(120),
  talentPoolOptIn: z.boolean(),
});
export const signupSchema = profileSchema.extend({
  email: z.email("Enter a valid email address.").trim().toLowerCase().max(254),
  password: z.string().min(12, "Use at least 12 characters.").max(128),
});
export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim().toLowerCase(),
  password: z.string().min(1, "Enter your password.").max(128),
});
export const applicationSchema = z.object({
  jobId: z.string().min(1).max(80),
  coverNote: z.string().trim().max(3000).default(""),
});
export function resumeError(
  file: { name: string; size: number; type: string } | null,
) {
  if (!file) return "Upload your resume to continue.";
  if (file.size < 1 || file.size > MAX_RESUME_SIZE)
    return "Choose a file up to 5 MB.";
  if (!/\.(pdf|docx)$/i.test(file.name))
    return "Only PDF and DOCX files are accepted.";
  if (file.type && !resumeTypes.includes(file.type))
    return "Only PDF and DOCX files are accepted.";
  return null;
}

export const projectSchema = z.object({
  title: z.string().trim().min(3).max(160),
  department: z.string().trim().min(2).max(100),
  roleType: z.string().trim().min(2).max(100),
  workSetting: z.enum(settings),
  location: z.string().trim().min(2).max(160),
  remote: z.boolean(),
  summary: z.string().trim().min(10).max(500),
  description: z.string().trim().min(20).max(15000),
  requirements: z.string().trim().min(5).max(8000),
  isActive: z.boolean(),
});
