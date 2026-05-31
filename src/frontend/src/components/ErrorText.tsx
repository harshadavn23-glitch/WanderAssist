import type React from "react";

interface ErrorTextProps {
  message?: string;
}

/**
 * Inline field-level error message.
 * Renders a red hint below a form field when `message` is truthy, null otherwise.
 */
const ErrorText: React.FC<ErrorTextProps> = ({ message }) => {
  if (!message) return null;
  return (
    <p className="text-red-500 text-xs mt-1" role="alert">
      {message}
    </p>
  );
};

export default ErrorText;
