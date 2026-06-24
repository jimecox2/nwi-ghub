// Lightweight Table primitives (plain Tailwind).
export function Table({ className = "", ...props }) {
  return <table className={`w-full border-collapse text-sm ${className}`} {...props} />;
}

export function TableHeader({ className = "", ...props }) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className = "", ...props }) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className = "", ...props }) {
  return <tr className={`border-b border-gray-100 ${className}`} {...props} />;
}

export function TableHead({ className = "", ...props }) {
  return <th className={`px-3 py-2 text-left font-semibold text-gray-700 ${className}`} {...props} />;
}

export function TableCell({ className = "", ...props }) {
  return <td className={`px-3 py-2 align-middle ${className}`} {...props} />;
}

export default Table;
