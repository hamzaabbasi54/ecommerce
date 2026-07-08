import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata = {
  title: 'Reset Password | Electronica',
  description: 'Enter your new password to regain access to Electronica.',
};

export default function ResetPasswordPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col justify-center items-center p-4 md:p-10 font-sans antialiased">
      <ResetPasswordForm />
    </div>
  );
}
