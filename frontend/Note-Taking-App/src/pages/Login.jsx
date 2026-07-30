import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Welcome back"
      title="Pick up right"
      highlight="where you left off."
      subtitle="Your notes, tags, and folders are exactly how you left them. Just sign in."
    >
      <div className="mb-8 lg:hidden">
        <span className="font-['Space_Grotesk'] text-xl font-bold text-[#10151F]">Notewell</span>
      </div>

      <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#10151F] mb-1">Log in</h2>
      <p className="text-sm text-[#6B7080] mb-7">Good to see you again.</p>

      {justRegistered && !error && (
        <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          Account created. Log in to continue.
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-lg border border-[#E8553D]/20 bg-[#E8553D]/5 px-3.5 py-2.5 text-sm text-[#E8553D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
        <FormField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FFC93C] py-2.5 font-['Space_Grotesk'] font-semibold text-[#10151F] transition-colors hover:bg-[#F5BC1F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6B7080]">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-[#10151F] underline underline-offset-2">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;