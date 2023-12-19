import React from "react";
import { twMerge } from "tailwind-merge";

type CheckboxProps = React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  label?: string;
};

export default function Checkbox({
  className = "",
  label,
  ...props
}: CheckboxProps) {
  return (
    <div className={twMerge(`form-control ${className}`)}>
      <label className="label cursor-pointer">
        <span className="label-text">{label}</span>
        <input type="checkbox" className="checkbox" {...props} />
      </label>
    </div>
  );
}
