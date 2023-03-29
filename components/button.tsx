import React, { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {}

export const Button = (props: ButtonProps) => {
  const className = twMerge(
    "bg-blue-500 text-zinc-100 hover:bg-blue-600 focus:ring-blue-500",
    "inline-flex items-center rounded-md px-4 py-2 text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:disabled:bg-blue-500",
    props.className
  );

  return <button {...props} className={className} />;
};
