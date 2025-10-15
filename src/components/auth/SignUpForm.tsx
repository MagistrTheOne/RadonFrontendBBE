'use client';

import { SignUp } from '@clerk/nextjs';

export default function SignUpForm() {
  return (
    <SignUp
      appearance={{
        variables: {
          colorBackground: '#000000',
          colorInputBackground: 'rgba(255, 255, 255, 0.05)',
          colorInputText: '#ffffff',
          colorText: '#ffffff',
          colorPrimary: '#ffffff',
          colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '0.75rem',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        elements: {
          formButtonPrimary: 'bg-white text-black hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl',
          formButtonPrimaryText: 'text-black font-semibold',
          card: 'bg-black/80 backdrop-blur-xl border border-white/10 shadow-2xl',
          headerTitle: 'text-white text-2xl font-bold',
          headerSubtitle: 'text-white/70 text-base',
          socialButtonsBlockButton: 'border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 backdrop-blur-sm',
          socialButtonsBlockButtonText: 'text-white font-medium',
          dividerLine: 'bg-white/20',
          dividerText: 'text-white/60 text-sm',
          formFieldLabel: 'text-white font-medium',
          formFieldInput: 'bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm',
          footerActionText: 'text-white/70',
          footerActionLink: 'text-white hover:text-white/90 transition-colors duration-200',
          alert: 'bg-red-500/10 border border-red-500/30 text-red-400 backdrop-blur-sm',
          alertText: 'text-red-400',
          identityPreviewText: 'text-white/80',
          identityPreviewEditButton: 'text-white/60 hover:text-white/90',
          formFieldSuccessText: 'text-green-400',
          formFieldErrorText: 'text-red-400',
          formFieldWarningText: 'text-yellow-400',
          otpCodeFieldInput: 'bg-white/5 border-white/20 text-white focus:border-white/40 focus:bg-white/10',
          otpCodeFieldInputs: 'gap-2',
          formResendCodeLink: 'text-white/70 hover:text-white/90',
          formFieldOptional: 'text-white/50',
          formFieldHintText: 'text-white/60'
        }
      }}
      redirectUrl="/chat"
    />
  );
}
