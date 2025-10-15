import SignUpForm from '@/components/auth/SignUpForm';

export const dynamic = 'force-dynamic';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignUpForm />
      </div>
    </div>
  );
}
