import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            baseTheme: 'dark',
            variables: {
              colorBackground: '#000000',
              colorInputBackground: 'rgba(255, 255, 255, 0.05)',
              colorInputText: '#ffffff',
              colorText: '#ffffff',
              colorPrimary: '#ffffff',
              colorTextSecondary: 'rgba(255, 255, 255, 0.6)',
              borderRadius: '0.5rem'
            },
            elements: {
              formButtonPrimary: 'bg-white text-black hover:bg-white/90',
              card: 'bg-transparent border border-white/10',
              headerTitle: 'text-white',
              headerSubtitle: 'text-white/60',
              socialButtonsBlockButton: 'border-white/20 text-white hover:bg-white/5',
              socialButtonsBlockButtonText: 'text-white',
              dividerLine: 'bg-white/20',
              dividerText: 'text-white/60',
              formFieldLabel: 'text-white',
              formFieldInput: 'bg-transparent border-white/20 text-white placeholder:text-white/50 focus:border-white/40',
              footerActionText: 'text-white/60',
              footerActionLink: 'text-white hover:text-white/80',
              alert: 'bg-red-500/10 border border-red-500/20 text-red-400',
              alertText: 'text-red-400'
            }
          }}
          redirectUrl="/chat"
        />
      </div>
    </div>
  );
}
