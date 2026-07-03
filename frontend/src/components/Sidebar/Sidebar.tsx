import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div
      style={{
        width: "240px",
        background: "#263238",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      <p><Link to="/">Dashboard</Link></p>
      <p><Link to="/employees">Employees</Link></p>
      <p><Link to="/users">Users</Link></p>
      <p><Link to="/login">Login</Link></p>
    </div>
  );
}

export default Sidebar;