"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export function ViewCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const counted = sessionStorage.getItem("pv_counted");

    const fetchOpts: RequestInit = counted
      ? { method: "GET" }
      : {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referrer: document.referrer || "" }),
        };

    fetch("/api/views", fetchOpts)
      .then((r) => r.json())
      .then((d: { count: number }) => {
        setCount(d.count);
        if (!counted) sessionStorage.setItem("pv_counted", "1");
      })
      .catch(() => {});
  }, []);

  if (!count) return null;

  return (
    <span
      className="flex items-center gap-1.5 text-xs"
      style={{ color: "var(--muted)" }}
      title="Total page visits"
    >
      <Eye size={11} />
      {count.toLocaleString()} visits
    </span>
  );
}
