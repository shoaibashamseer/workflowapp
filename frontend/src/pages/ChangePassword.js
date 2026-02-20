import { useState } from "react";
import api from "../api/api";

function ChangePassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      await api.post("auth/change-password/", {
        new_password: password
      });

      localStorage.setItem("must_change_password", "false");
      window.location.reload();
    } catch {
      setError("Password must be at least 6 characters");
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <p>This is your first login. Please change your password.</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />

      <button onClick={submit}>Change Password</button>
    </div>
  );
}

export default ChangePassword;
