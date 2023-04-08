import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonColorSchemes = "blue" | "gray";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  colorScheme?: ButtonColorSchemes;
  as?: React.ElementType;
}

const colorSchemes: Record<ButtonColorSchemes, string> = {
  blue: "bg-blue-300 text-zinc-900 hover:bg-blue-400 focus:ring-blue-400 hover:disabled:bg-blue-400",
  gray: "bg-gray-300 text-zinc-900 hover:bg-gray-400 focus:ring-gray-400 hover:disabled:bg-gray-400",
};

export const Button = ({
  as,
  className,
  colorScheme = "blue",
  ...props
}: ButtonProps) => {
  const _className = twMerge(
    colorSchemes[colorScheme],
    "inline-flex h-10 transition-colors duration-200 items-center rounded-md px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed justify-center",
    className
  );

  const Element = as || "button";

  return <Element {...props} className={_className} />;
};
