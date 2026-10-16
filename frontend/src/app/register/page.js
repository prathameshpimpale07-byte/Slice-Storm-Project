import AuthForm from "@/components/AuthForm";

export const metadata = {
  title: "Register — Slice Storm",
  description: "Create your Slice Storm player account.",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
