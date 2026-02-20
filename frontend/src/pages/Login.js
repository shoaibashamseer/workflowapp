import { useState } from "react";
import api from "../api/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");   // ✅ ADD THIS

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("auth/login/", {
        username,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_id", res.data.user_id);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("must_change_password", res.data.must_change_password);


      window.location.reload();
    } catch {
      setError("Invalid login");   // now works
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
