import type { ReactNode } from "react";

/** "3  Description" */
export function SectionHeading({
  n,
  children,
  as: Tag = "h2",
}: {
  n: string | number;
  children: ReactNode;
  as?: "h2" | "h3";
}) {
  return (
    <Tag className="sec-h">
      <span className="n">{n}</span>
      {children}
    </Tag>
  );
}
