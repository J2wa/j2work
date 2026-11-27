export type RoleChecklistGroup = {
  category: string;
  roles: string[];
};

export const ROLE_CHECKLIST_GROUPS: readonly RoleChecklistGroup[] = [
  {
    category: "Data & Multimodal Annotation",
    roles: [
      "Multimodal Data Annotator",
      "Audio & Speech Transcriber",
      "Image & Video Segmentation Specialist",
      "Data Collection Contributor",
    ],
  },
  {
    category: "Model Evaluation & AI Training",
    roles: [
      "AI Model Evaluator",
      "RLHF & Prompt Engineer",
      "Red-Teaming & AI Safety Evaluator",
      "Bilingual / Multilingual AI Trainer",
    ],
  },
  {
    category: "Quality & Operations",
    roles: [
      "Multimodal QA Specialist",
      "Annotation Team Lead",
      "Project Operations Coordinator",
    ],
  },
  {
    category: "Engineering & Technical",
    roles: [
      "AI Data Pipeline Engineer",
      "Software / Web Engineer",
      "Machine Learning Engineer",
    ],
  },
  {
    category: "Domain Specialists",
    roles: [
      "STEM & Coding Specialist",
      "Medical & Healthcare Specialist",
      "Legal & Compliance Specialist",
      "Finance & Accounting Specialist",
      "Creative Writing & Editorial Specialist",
    ],
  },
] as const;

export const SPECIALIST_DOMAINS = [
  "Medicine & Healthcare",
  "Software Engineering & Computer Science",
  "Law & Regulatory Compliance",
  "Finance, Accounting & Economics",
  "Mathematics, Statistics & Data Science",
  "Biology, Chemistry & Life Sciences",
  "Physics & Core Engineering",
  "Linguistics, Translation & Languages",
  "Creative Writing & Journalism",
  "Business Strategy & Operations",
  "Education & Academic Research",
  "Other Specialized Domain",
] as const;

export const EXPERIENCE_LEVELS = [
  "0–2 years",
  "3–5 years",
  "6–10 years",
  "10+ years",
] as const;

export const CREDENTIAL_LEVELS = [
  "Bachelor’s degree",
  "Master’s degree",
  "Doctorate / PhD",
  "Licensed Professional (MD, JD, CPA, RN, Engr.)",
  "Industry Practitioner / Portfolio",
] as const;

export function buildRoleChecklistGroups(
  extraTitles: string[] = [],
): RoleChecklistGroup[] {
  const known = new Set<string>();
  const groups: RoleChecklistGroup[] = ROLE_CHECKLIST_GROUPS.map((group) => {
    for (const role of group.roles) known.add(role.toLowerCase());
    return { category: group.category, roles: [...group.roles] };
  });

  const extra = extraTitles
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && !known.has(t.toLowerCase()));

  if (extra.length > 0) {
    const uniqueExtra = [...new Set(extra)];
    groups.unshift({
      category: "Currently Open Roles",
      roles: uniqueExtra,
    });
  }

  return groups;
}

export function parseInterestedRoles(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return [
      ...new Set(
        raw
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, 30),
      ),
    ];
  }
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parseInterestedRoles(parsed);
  } catch {
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  }
  return [];
}

export function serializeInterestedRoles(roles: string[]): string {
  return JSON.stringify(parseInterestedRoles(roles));
}
