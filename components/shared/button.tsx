import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonColorSchemes = "blue" | "gray";
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  colorScheme?: ButtonColorSchemes;
  as?: React.ElementType;
}

const colorSchemes: Record<ButtonColorSchemes, string> = {
  blue: "bg-blue-500 text-zinc-100 hover:bg-blue-600 focus:ring-blue-500 hover:disabled:bg-blue-500",
  gray: "bg-gray-500 text-zinc-100 hover:bg-gray-600 focus:ring-gray-500 hover:disabled:bg-gray-500",
};

export const Button = ({
  as,
  className,
  colorScheme = "blue",
  ...props
}: ButtonProps) => {
  const _className = twMerge(
    colorSchemes[colorScheme],
    "inline-flex transition-colors duration-200 items-center rounded-md px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed justify-center",
    className
  );

  const Element = as || "button";

  return <Element {...props} className={_className} />;
};
