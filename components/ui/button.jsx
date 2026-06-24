// Lightweight Button primitive (plain Tailwind, no Radix). Matches the named
// import the ported dashboard components expect.
const VARIANTS = {
  default: "bg-blue-600 text-white hover:bg-blue-700",
  outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "text-gray-700 hover:bg-gray-100",
};

const SIZES = {
  default: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  lg: "px-6 py-3 text-base",
};

export function Button({ variant = "default", size = "default", className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-60 ${
        VARIANTS[variant] || VARIANTS.default
      } ${SIZES[size] || SIZES.default} ${className}`}
      {...props}
    />
  );
}

export default Button;
