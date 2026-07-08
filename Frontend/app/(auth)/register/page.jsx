import RegisterForm from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account | Electronica',
  description: 'Join Electronica today to purchase premium gadgets.',
};

export default function RegisterPage() {
  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4 md:p-10 font-sans antialiased">
      <RegisterForm />
    </div>
  );
}
