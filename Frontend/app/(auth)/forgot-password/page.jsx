import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password | Electronica',
  description: 'Reset your Electronica account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4 md:p-10 font-sans antialiased">
      <ForgotPasswordForm />
    </div>
  );
}
