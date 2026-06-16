import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { homeForRole } from "../../auth/roles.js";

const Login = () => {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg("");

    try {
      const cleanPhone = phone.trim();

      // ✅ NOW CALL BACKEND (NOT SUPABASE DIRECTLY)
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed");
        return;
      }

      // ✅ store session + role
      localStorage.setItem("session", JSON.stringify(data.session));
      localStorage.setItem("role", data.role);
      localStorage.setItem("user", JSON.stringify(data.user));

      // ✅ redirect based on role
      const role = data.role || "staff";

      localStorage.setItem("role", role);

      navigate(homeForRole(role));
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f5ee] px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8"
      >
        <h1 className="text-3xl font-bold text-center mb-2">Login</h1>

        <p className="text-center text-gray-500 mb-8">
          Login to your dashboard
        </p>

        {errorMsg && (
          <div className="mb-4 rounded-xl bg-red-50 text-red-600 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="mb-5">
          <label className="block mb-2 font-medium text-gray-700">
            Phone Number
          </label>

          <input
            type="tel"
            placeholder="Enter phone number"
            value={phone}
            required
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">
            Password
          </label>

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;