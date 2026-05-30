export type VisitorRecord = {
  id: string;
  country: string;
  city: string;
  flag: string;
  browser: string;
  os: string;
  device: string;
  ref: string;
  ts: number;
};

export function parseUA(ua: string): { browser: string; os: string; device: string } {
  const browser =
    /Edg\//.test(ua)                            ? "Edge"    :
    /OPR\/|Opera/.test(ua)                       ? "Opera"   :
    /Chrome\//.test(ua)                          ? "Chrome"  :
    /Firefox\//.test(ua)                         ? "Firefox" :
    /Safari\//.test(ua) && /Version\//.test(ua)  ? "Safari"  :
                                                   "Other";

  const os =
    /Windows/.test(ua)                               ? "Windows" :
    /Android/.test(ua)                               ? "Android" :
    /iPhone/.test(ua)                                ? "iOS"     :
    /iPad/.test(ua)                                  ? "iPadOS"  :
    /Mac OS X/.test(ua)                              ? "macOS"   :
    /Linux/.test(ua)                                 ? "Linux"   :
                                                       "Other";

  const device =
    /Mobile|Android|iPhone/.test(ua) ? "Mobile"  :
    /iPad|Tablet/.test(ua)           ? "Tablet"  :
                                       "Desktop";

  return { browser, os, device };
}

function flag(code: string): string {
  if (!code || code.length !== 2) return "🌍";
  const upper = code.toUpperCase();
  return (
    String.fromCodePoint(0x1F1E6 + upper.charCodeAt(0) - 65) +
    String.fromCodePoint(0x1F1E6 + upper.charCodeAt(1) - 65)
  );
}

export async function getGeo(
  ip: string
): Promise<{ country: string; city: string; flag: string }> {
  const local = !ip || ip === "::1" || ip === "127.0.0.1"
    || ip.startsWith("192.168.") || ip.startsWith("10.");
  if (local) return { country: "Local", city: "Dev", flag: "🏠" };

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,city`,
      { signal: AbortSignal.timeout(2500) }
    );
    const d = await res.json();
    if (d.status === "success") {
      return { country: d.country, city: d.city ?? "", flag: flag(d.countryCode) };
    }
  } catch { /* geo lookup failed — don't block the response */ }

  return { country: "Unknown", city: "", flag: "🌍" };
}

export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  }) + " UTC";
}
