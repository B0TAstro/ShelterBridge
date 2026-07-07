import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function PrimaryButton({ variant = "primary", className = "", ...rest }: Props) {
  return <button className={`sb-btn sb-btn--${variant} ${className}`.trim()} {...rest} />;
}
