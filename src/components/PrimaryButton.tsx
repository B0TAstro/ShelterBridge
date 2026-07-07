import type { ButtonHTMLAttributes } from "react";
import "./PrimaryButton.css";

export function PrimaryButton({
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`sb-btn ${className}`.trim()} {...rest} />;
}
