export const metadata = {
  title: 'Terms of Service | Electronica',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Terms of Service</h1>
      <div className="prose prose-slate dark:prose-invert">
        <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>By accessing and using Electronica&apos;s website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">2. User Accounts</h2>
        <p>When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms.</p>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-8">Please read these terms carefully before using our services. They outline your rights and responsibilities.</p>
        <h2 className="text-xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
        <p>The Service and its original content, features and functionality are and will remain the exclusive property of Electronica and its licensors.</p>
      </div>
    </div>
  );
}
