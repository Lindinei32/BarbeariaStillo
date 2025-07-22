// app/forgot-password/page.tsx

import ForgotPasswordForm from "../_components/ui/forgot-password-form";
import Header from "../_components/ui/header";

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="p-5">
        <Header />
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-8">
        <ForgotPasswordForm />
      </div>
    </>
  );
}