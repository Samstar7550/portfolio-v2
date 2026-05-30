export type Skill      = { name: string; note?: string; iconUrl?: string };
export type SkillGroup = { category: string; skills: Skill[] };
export type ExperienceItem = {
  role: string; company: string; period: string;
  type: "devops" | "design"; current: boolean;
  bullets: string[]; tags: string[];
  iconUrl?: string;
};
export type Project = {
  title: string; period: string; description: string;
  tech: string[]; link: string | null; linkLabel: string | null;
  type: "web" | "devops" | "design"; color: string; featured: boolean;
  iconUrl?: string;
  images?: string[];   // screenshots / wireframes — first is the card hero, all open in a lightbox
  figma?: string;      // optional Figma / prototype / Behance link
};
export type Certification = {
  title: string; badge: string; issuer: string;
  date: string; status: "issued" | "progress"; color: string;
};
export type Settings = { available: boolean; photoUrl?: string; resumeUrl?: string; palette?: string };

export type ProfileStat = { prefix: string; value: number; suffix: string; label: string };
export type EducationItem = { degree: string; school: string; score: string; years: string };
export type Profile = {
  // Hero
  name: string;
  roles: string[];
  tagline: string;
  heroBadge: string;
  statValue: string;
  statLabel: string;
  availableText: string;
  unavailableText: string;
  // About
  aboutTitle: string;
  bio: string[];            // paragraphs; **text** = bold, ==text== = accent pill
  quickInfo: string[];
  stats: ProfileStat[];
  education: EducationItem[];
  // Contact / social
  contactLine: string;
  email: string;
  linkedin: string;
  github: string;
};

// Coerce education to an array (tolerates the legacy single-object shape in Redis)
export function asEducation(p: Profile): EducationItem[] {
  const e = p.education as unknown;
  if (Array.isArray(e)) return e as EducationItem[];
  if (e && typeof e === "object") return [e as EducationItem];
  return [];
}

// ─── Color palettes ────────────────────────────────────────────────────────────
export type Palette = { id: string; name: string; light: string; dark: string };

export const PALETTES: Palette[] = [
  { id: "default",  name: "Blue / Teal",      light: "#0F64D2", dark: "#00C8D7" },
  { id: "violet",   name: "Violet / Fuchsia", light: "#7C3AED", dark: "#D946EF" },
  { id: "emerald",  name: "Emerald / Cyan",   light: "#059669", dark: "#22D3EE" },
  { id: "rose",     name: "Rose / Pink",      light: "#E11D48", dark: "#F472B6" },
  { id: "amber",    name: "Amber / Yellow",   light: "#D97706", dark: "#FDE047" },
  { id: "sky",      name: "Sky / Indigo",     light: "#0EA5E9", dark: "#6366F1" },
  { id: "fuchsia",  name: "Fuchsia / Rose",   light: "#C026D3", dark: "#FB7185" },
  { id: "orange",   name: "Orange / Amber",   light: "#EA580C", dark: "#FBBF24" },
  { id: "lime",     name: "Lime / Teal",      light: "#65A30D", dark: "#2DD4BF" },
  { id: "indigo",   name: "Indigo / Violet",  light: "#4F46E5", dark: "#C084FC" },
];

// CSS that overrides the accent for both light (:root) and dark (.dark) themes
export function paletteCss(p: Palette): string {
  return `:root{--accent:${p.light}}.dark{--accent:${p.dark}}`;
}

export type AwardItem = {
  title: string; issuer: string; date: string; description: string;
};
export type Testimonial = {
  quote: string; author: string; role: string; company: string; avatarUrl?: string;
};

export type ContentType =
  | "settings" | "profile" | "skills" | "experience" | "projects"
  | "certifications" | "awards" | "testimonials";

export const CONTENT_KEYS: Record<ContentType, string> = {
  settings:       "portfolio:content:settings",
  profile:        "portfolio:content:profile",
  skills:         "portfolio:content:skills",
  experience:     "portfolio:content:experience",
  projects:       "portfolio:content:projects",
  certifications: "portfolio:content:certifications",
  awards:         "portfolio:content:awards",
  testimonials:   "portfolio:content:testimonials",
};

export const DEFAULT_SETTINGS: Settings = { available: true };

export const DEFAULT_PROFILE: Profile = {
  name: "Samuvel L",
  roles: ["DevOps Engineer", "Cloud Engineer", "System Engineer"],
  tagline: "Building the pipelines that ship code",
  heroBadge: "Top 2% · TCS Ignite · #6 / 280",
  statValue: "#6 / 280",
  statLabel: "TCS Ignite Rank",
  availableText: "Available for DevOps & Cloud roles · Remote · India",
  unavailableText: "Not currently open to new roles",
  aboutTitle: "System Engineer @ TCS",
  bio: [
    "I chose DevOps because I wanted to be where **code becomes real** — where a developer's push becomes a running service. At TCS I've grown from Graduate Trainee to System Engineer in 20 months, building **hands-on challenge environments** with Kubernetes, Docker, Ansible, Jenkins, GitLab, and Azure — making tools break, recover, and behave in edge cases. That's deeper technical exposure than most junior engineers get.",
    "I work across the full **Microsoft DevOps stack** — configuring Azure Pipelines, managing repos and boards, and storing build artifacts. I hold the ==AZ-900== and ==GitHub Copilot== certifications and am preparing for **AZ-104** to deepen my Azure infrastructure skills.",
    "My background in **full-stack development** (Next.js, React, TypeScript) and **UI/UX design** gives me an edge most DevOps engineers don't have — I understand the entire delivery lifecycle, from design to deployment. Now looking for a hands-on **DevOps or Cloud Engineer role** where I can own infrastructure and solve real delivery problems.",
  ],
  quickInfo: [
    "System Engineer @ Tata Consultancy Services",
    "Remote · India",
    "AZ-900 Certified · GitHub Copilot Certified",
  ],
  stats: [
    { prefix: "Top ", value: 2,  suffix: "%",     label: "TCS Ignite Cohort" },
    { prefix: "#",    value: 6,  suffix: "/280",  label: "TCS Ignite Ranking" },
    { prefix: "",     value: 89, suffix: "%",     label: "B.Sc. Score" },
    { prefix: "",     value: 2,  suffix: "+ yrs", label: "Design Experience" },
  ],
  education: [
    {
      degree: "B.Sc Computer Science",
      school: "Sankara College of Arts & Science",
      score: "89%",
      years: "2021 – 2024",
    },
  ],
  contactLine: "Open to DevOps & Cloud roles · Remote · India",
  email: "contact@samuvel.in",
  linkedin: "https://linkedin.com/in/samuvel7550",
  github: "https://github.com/Samstar7550",
};

export const DEFAULT_SKILLS: SkillGroup[] = [
  { category: "DevOps Tools", skills: [
    { name: "Kubernetes" }, { name: "Docker" }, { name: "Ansible" },
    { name: "Jenkins" }, { name: "GitLab" }, { name: "Azure DevOps" },
  ]},
  { category: "Cloud", skills: [{ name: "Microsoft Azure", note: "AZ-900 ✓" }] },
  { category: "CI/CD", skills: [
    { name: "GitHub Actions" }, { name: "Jenkins", note: "Pipelines" }, { name: "GitLab", note: "GitLab CI" },
  ]},
  { category: "Web Dev", skills: [
    { name: "Next.js" }, { name: "React" }, { name: "TypeScript" }, { name: "MongoDB" }, { name: "Tailwind CSS" },
  ]},
  { category: "Design", skills: [{ name: "Figma" }, { name: "Adobe Photoshop" }] },
];

export const DEFAULT_EXPERIENCE: ExperienceItem[] = [
  {
    role: "System Engineer", company: "Tata Consultancy Services",
    period: "Jan 2026 – Present", type: "devops", current: true,
    bullets: [
      "Lead design and delivery of advanced DevOps training programs covering Kubernetes, CI/CD, and Azure",
      "Build challenge environments across Docker, Kubernetes, Ansible, Jenkins, GitLab, and Azure DevOps",
      "Develop training curricula aligned with real-world production requirements",
    ],
    tags: ["Kubernetes", "CI/CD", "Azure", "Docker", "Ansible"],
  },
  {
    role: "Assistant System Engineer", company: "Tata Consultancy Services",
    period: "Sep 2025 – Dec 2025", type: "devops", current: false,
    bullets: [
      "Designed and delivered Azure cloud training covering VMs, networking, storage, IAM, and Azure CLI",
      "Created hands-on lab exercises for provisioning and configuring Azure environments",
    ],
    tags: ["Azure", "Cloud", "Networking", "IAM"],
  },
  {
    role: "Assistant System Engineer Trainee", company: "Tata Consultancy Services",
    period: "Jan 2025 – Aug 2025", type: "devops", current: false,
    bullets: [
      "Built hands-on challenge environments using Docker, Kubernetes, Ansible, Jenkins, and GitLab",
      "Designed training content on Docker architecture, Kubernetes orchestration, and Azure DevOps pipelines",
    ],
    tags: ["Docker", "Kubernetes", "Jenkins", "GitLab"],
  },
  {
    role: "Graduate Trainee", company: "Tata Consultancy Services",
    period: "Sep 2024 – Dec 2024", type: "devops", current: false,
    bullets: [
      "Ranked top 6 out of 280 in TCS Ignite onboarding — top 2% of entire cohort",
      "Selected for Talent Development team based on performance",
    ],
    tags: ["TCS Ignite", "Top 2%"],
  },
  {
    role: "Freelance Graphic Designer", company: "Self-Employed",
    period: "Sep 2022 – Sep 2024", type: "design", current: false,
    bullets: ["Delivered logo, web, and UI/UX design projects over 2 years using Figma and Adobe Photoshop"],
    tags: ["Figma", "UI/UX", "Adobe Photoshop"],
  },
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    title: "VizualizeHub", period: "Feb – Apr 2024",
    description: "Full-stack image editing SaaS application with AI-powered transformations, user authentication, and credit-based billing. Deployed with Vercel CD.",
    tech: ["Next.js", "TypeScript", "MongoDB", "Cloudinary", "Clerk", "Vercel"],
    link: "https://vizualizehub.vercel.app", linkLabel: "vizualizehub.vercel.app",
    type: "web", color: "#00C8D7", featured: true,
  },
  {
    title: "Feedback System", period: "Dec 2023",
    description: "Anonymous feedback web app with real-time email delivery. Clean, minimal UI with form validation and EmailJS integration for instant notifications.",
    tech: ["React", "JavaScript", "EmailJS", "Vercel"],
    link: "https://feedback-system-online-eight.vercel.app", linkLabel: "feedback-system-online-eight.vercel.app",
    type: "web", color: "#3178C6", featured: false,
  },
  {
    title: "DevOps Challenge Environment", period: "2025",
    description: "Designed broken Kubernetes and Docker environments for TCS engineer assessments. Engineers diagnosed and fixed real infrastructure issues — pod crashes, misconfigured services, failed pipelines.",
    tech: ["Kubernetes", "Docker", "Ansible", "Jenkins", "GitLab", "Azure DevOps"],
    link: null, linkLabel: null, type: "devops", color: "#326CE5", featured: true,
  },
  {
    title: "Student Attendance Management", period: "Dec 2023 – Jan 2024",
    description: "Full UI/UX design with real-time dashboard, analytics charts, and three-role login system (Admin, Teacher, Student). Built end-to-end in Figma with a complete design system.",
    tech: ["Figma", "UI/UX", "Design System", "Prototyping"],
    link: null, linkLabel: null, type: "design", color: "#F24E1E", featured: false,
  },
];

export const DEFAULT_CERTIFICATIONS: Certification[] = [
  { title: "Microsoft Azure Fundamentals", badge: "AZ-900", issuer: "Microsoft", date: "Aug 2025", status: "issued", color: "#0078D4" },
  { title: "GitHub Copilot Certified", badge: "GH", issuer: "GitHub", date: "Mar 2026", status: "issued", color: "#2088FF" },
  { title: "Azure Administrator Associate", badge: "AZ-104", issuer: "Microsoft", date: "In Progress", status: "progress", color: "#0078D4" },
  { title: "UI/UX Design", badge: "UX", issuer: "Internshala", date: "Mar 2023", status: "issued", color: "#FF7262" },
];

export const DEFAULT_AWARDS: AwardItem[] = [];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [];

export const DEFAULTS: Record<ContentType, unknown> = {
  settings:       DEFAULT_SETTINGS,
  profile:        DEFAULT_PROFILE,
  skills:         DEFAULT_SKILLS,
  experience:     DEFAULT_EXPERIENCE,
  projects:       DEFAULT_PROJECTS,
  certifications: DEFAULT_CERTIFICATIONS,
  awards:         DEFAULT_AWARDS,
  testimonials:   DEFAULT_TESTIMONIALS,
};
