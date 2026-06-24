// Lightweight Card primitives (plain Tailwind).
export function Card({ className = "", ...props }) {
  return <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`} {...props} />;
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`px-6 pt-6 pb-2 ${className}`} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-lg font-semibold text-gray-900 ${className}`} {...props} />;
}

export function CardDescription({ className = "", ...props }) {
  return <p className={`text-sm text-gray-500 ${className}`} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`px-6 pb-6 ${className}`} {...props} />;
}

export default Card;
