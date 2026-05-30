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
};
export type Settings = { available: boolean; photoUrl?: string };
export type ContentType = "settings" | "skills" | "experience" | "projects";

export const CONTENT_KEYS: Record<ContentType, string> = {
  settings:   "portfolio:content:settings",
  skills:     "portfolio:content:skills",
  experience: "portfolio:content:experience",
  projects:   "portfolio:content:projects",
};

export const DEFAULT_SETTINGS: Settings = { available: true };

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

export const DEFAULTS: Record<ContentType, unknown> = {
  settings:   DEFAULT_SETTINGS,
  skills:     DEFAULT_SKILLS,
  experience: DEFAULT_EXPERIENCE,
  projects:   DEFAULT_PROJECTS,
};
