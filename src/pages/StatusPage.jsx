import Navbar from "./Navbar";
import "./StatusPage.css";

function StatusPage({
  title,
  message,
  showAuthControls = true,
}) {
  return (
    <>
      <Navbar showAuthControls={showAuthControls} />
      <div className="status-page">
        <div className="status-card">
          <h1 className="status-title">{title}</h1>
          <p className="status-message">{message}</p>
        </div>
      </div>
    </>
  );
}

export default StatusPage;
