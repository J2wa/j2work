import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/db";
import { jobs } from "../lib/db/schema";
const drafts = [
  {
    id: "multimodal-annotator",
    title: "Multimodal Data Annotator",
    department: "Data Annotation",
    roleType: "Annotation",
    workSetting: "Project-Basis" as const,
    location: "Philippines",
    remote: true,
    summary:
      "Review and annotate video, image, and audio content to support better AI.",
    description:
      "Review multimedia content and apply project-specific labels. Follow detailed guidelines, flag uncertain examples, and collaborate with quality reviewers.",
    requirements:
      "Strong attention to detail\nClear written communication\nAbility to follow project guidelines\nReliable availability and internet connection",
  },
  {
    id: "model-evaluator",
    title: "AI Model Evaluator",
    department: "Model Evaluation",
    roleType: "Evaluation",
    workSetting: "Part-Time" as const,
    location: "Philippines",
    remote: true,
    summary:
      "Assess the quality and accuracy of AI responses with careful human judgment.",
    description:
      "Evaluate model outputs for accuracy, clarity, and guideline adherence. Provide concise, evidence-based feedback to improve model quality.",
    requirements:
      "Strong reading comprehension\nEvidence-based reasoning\nClear and specific feedback\nConsistency across repeated evaluations",
  },
  {
    id: "qa-specialist",
    title: "Multimodal QA Specialist",
    department: "Quality & Operations",
    roleType: "Quality Assurance",
    workSetting: "Full-Time" as const,
    location: "Philippines",
    remote: true,
    summary:
      "Support annotation quality through reviews, calibration, and constructive feedback.",
    description:
      "Review annotated tasks, identify recurring quality issues, and help evaluators apply project guidelines consistently.",
    requirements:
      "Experience reviewing annotation or evaluation work\nExcellent attention to detail\nConstructive written feedback\nAbility to communicate guideline clarifications",
  },
];
await db()
  .insert(jobs)
  .values(drafts.map((j) => ({ ...j, isActive: false })))
  .onConflictDoNothing();
console.log(
  "Created inactive job templates. Review terms and set is_active=1 only for real openings.",
);
process.exit(0);
