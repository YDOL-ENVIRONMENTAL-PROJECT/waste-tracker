export default function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}