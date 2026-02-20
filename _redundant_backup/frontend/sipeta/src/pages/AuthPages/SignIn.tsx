import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

interface SignInProps {
  onLogin?: () => void;
}

export default function SignIn({ onLogin }: SignInProps) {
  return (
    <>
      <AuthLayout>
        <SignInForm onLogin={onLogin} />
      </AuthLayout>
    </>
  );
}
