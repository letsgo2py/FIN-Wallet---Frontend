import "./Toast.css";

export default function Toast({ message, type = "error", show }) {
  if (!show || !message) return null;

  return (
    <div className={`toast toast-${type}`}>
      {message}
    </div>
  );
}