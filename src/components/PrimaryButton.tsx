import type { ButtonHTMLAttributes } from "react";

export function PrimaryButton({
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`sb-btn ${className}`.trim()} {...rest} />;
}
