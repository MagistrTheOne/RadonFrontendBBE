import SignInForm from '@/components/auth/SignInForm';

export const dynamic = 'force-dynamic';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignInForm />
      </div>
    </div>
  );
}
