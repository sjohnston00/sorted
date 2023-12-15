import React from "react";
import { twMerge } from "tailwind-merge";

type SwitchProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
};

export default function Switch({
  label,
  description,
  badge,
  className,
  ...props
}: SwitchProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer">
        <span className="label-text">
          {label}{" "}
          {badge ? (
            <span className="badge badge-outline badge-primary ml-1">
              {badge}
            </span>
          ) : null}
        </span>
        <input
          type="checkbox"
          className={twMerge(className, "toggle")}
          {...props}
        />
      </label>
      {description ? (
        <span className="px-1 text-xs text-gray-500">{description}</span>
      ) : null}
    </div>
  );
}
