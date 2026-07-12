export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`input-style ${className}`}
      {...props}
    />
  );
}