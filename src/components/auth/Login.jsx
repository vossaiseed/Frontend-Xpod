import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase/supabaseConnection.js";
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

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id,email,role,phone,status")
        .eq("phone", cleanPhone)
        .single();

      if (profileError || !profile) {
        setErrorMsg("Phone number not found");
        return;
      }

      if (profile.status === "inactive") {
        setErrorMsg("Your account is inactive");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });

      if (error) {
        setErrorMsg("Invalid phone number or password");
        return;
      }

      navigate(homeForRole(profile.role));
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