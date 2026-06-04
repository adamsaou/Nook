import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outlined";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-foreground hover:brightness-95",
  secondary: "bg-foreground text-background hover:opacity-90",
  outlined: "border border-foreground/20 bg-surface text-foreground hover:bg-foreground/5",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-full px-6 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
