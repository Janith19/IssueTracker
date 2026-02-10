import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(50, "Password too long"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const onSubmit = async (data: LoginFormData) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950">
      <div className="max-w-md w-full">
        <div className="text-center mb-6 ">
          <h2 className="text-4xl font-extrabold text-white tracking-tight">
            Issue Tracker
          </h2>
          <p className="text-white text-lg mt-2">
            Sign in to manage your issues
          </p>
        </div>
        {/*Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-8 shadow-2xl">
          {/*Form Data */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {/*Error */}
            {error && (
              <div className="bg-red-500/15 border border-red-500/30 text-red-300 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            {/*Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <div className="">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  placeholder="JohnDoe@example.com"
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.email.message}
                </p>
              )}
            </div>
            {/*Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...register("password")}
                  className="w-full rounded-lg bg-white/5 border border-white/15 px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  placeholder="......."
                />
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-300 hover:text-gray-100 transition cursor-pointer bg-transparent border-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-400">
                  {errors.password.message}
                </p>
              )}
            </div>
            {/*Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full border border-white/15 rounded-lg font-semibold bg-blue-950 hover:bg-blue-800 px-8 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition cursor-pointer"
            >
              {isSubmitting || loading ? "Signing in..." : "Sign in"}
            </button>
            {/*Sign Up Link */}
            <p className="text-center text-sm text-slate-400 pt-2">
              Don't have an account?
              <Link
                to="/register"
                className="hover:text-white text-blue-400 font-medium transition cursor-pointer"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
