import LoginForm from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login | Electronica',
  description: 'Log in to your Electronica account to securely manage your orders and preferences.',
};

export default function LoginPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4 md:p-10 font-sans antialiased">
      <LoginForm />
    </div>
  );
}
