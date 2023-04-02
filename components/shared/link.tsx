import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface AppLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  (props, ref) => (
    <a
      ref={ref}
      tabIndex={0}
      {...props}
      className={twMerge(
        "font-medium text-gray-400 dark:text-gray-300 hover:underline",
        props.className
      )}
    />
  )
);
