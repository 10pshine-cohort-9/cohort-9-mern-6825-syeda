import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(name, email, password);
      navigate("/login", { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="Get started"
      title="Write it down"
      highlight="before it slips."
      subtitle="Capture ideas the moment they happen. Sync across every device, search everything instantly."
    >
      <div className="mb-8 lg:hidden">
        <span className="font-['Space_Grotesk'] text-xl font-bold text-[#10151F]">Notewell</span>
      </div>

      <h2 className="font-['Space_Grotesk'] text-2xl font-bold text-[#10151F] mb-1">
        Create your account
      </h2>
      <p className="text-sm text-[#6B7080] mb-7">Free forever for your first 100 notes.</p>

      {error && (
        <div className="mb-5 rounded-lg border border-[#E8553D]/20 bg-[#E8553D]/5 px-3.5 py-2.5 text-sm text-[#E8553D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Lee"
          required
          autoComplete="name"
        />
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
          placeholder="At least 6 characters"
          required
          minLength={6}
          autoComplete="new-password"
        />

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-[#FFC93C] py-2.5 font-['Space_Grotesk'] font-semibold text-[#10151F] transition-colors hover:bg-[#F5BC1F] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-[#6B7080]">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-[#10151F] underline underline-offset-2">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;