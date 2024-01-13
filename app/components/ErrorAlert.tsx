import { XCircleIcon } from "@heroicons/react/24/outline";
import React from "react";

type ErrorAlertProps = {
  children?: React.ReactNode;
};
export default function ErrorAlert({ children }: ErrorAlertProps) {
  return (
    <div role="alert" className="alert alert-error">
      <XCircleIcon className="w-6 h-6 shrink-0" />
      {children}
    </div>
  );
}
