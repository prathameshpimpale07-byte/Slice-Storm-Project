import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Sign In — Slice Storm",
  description: "Sign in to your Slice Storm player account.",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
