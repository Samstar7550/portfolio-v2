export type Lead = {
  id: string;
  name: string;
  email: string;
  source: "contact" | "widget";
  message?: string; // first 150 chars, contact-form only
  ts: number;
};

export const LEADS_KEY      = "portfolio:leads";
export const LEADS_LAST_RUN = "portfolio:digest:leads-last-run";
