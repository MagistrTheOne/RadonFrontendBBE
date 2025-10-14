"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waitlistSchema, WaitlistFormData } from '@/lib/validations/waitlist';
import { Send, CheckCircle } from 'lucide-react';

export default function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema)
  });

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ошибка при отправке заявки');
      }

      setIsSuccess(true);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="glass-panel-strong rounded-2xl p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">
          Спасибо за заявку!
        </h3>
        <p className="text-white/70 mb-6">
          Мы отправили вам подтверждение на email. Скоро свяжемся с вами для участия в бета-тестировании.
        </p>
        <button
          onClick={() => setIsSuccess(false)}
          className="px-6 py-2 glass-panel glass-hover text-white rounded-lg"
        >
          Отправить еще одну заявку
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel-strong rounded-2xl p-8">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-white mb-4">
          Записаться в Beta
        </h3>
        <p className="text-white/70">
          Получите ранний доступ к Radon AI и станьте частью революции в области искусственного интеллекта.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
            Имя *
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Ваше имя"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
            Email *
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="your@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Telegram field */}
        <div>
          <label htmlFor="telegram" className="block text-sm font-medium text-white mb-2">
            Telegram (опционально)
          </label>
          <input
            {...register('telegram')}
            type="text"
            id="telegram"
            className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="@username"
          />
          {errors.telegram && (
            <p className="mt-1 text-sm text-red-400">{errors.telegram.message}</p>
          )}
        </div>

        {/* Use case field */}
        <div>
          <label htmlFor="useCase" className="block text-sm font-medium text-white mb-2">
            Как планируете использовать Radon AI? (опционально)
          </label>
          <textarea
            {...register('useCase')}
            id="useCase"
            rows={3}
            className="w-full px-4 py-3 glass-panel rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none"
            placeholder="Расскажите о ваших планах использования AI..."
          />
          {errors.useCase && (
            <p className="mt-1 text-sm text-red-400">{errors.useCase.message}</p>
          )}
        </div>

        {/* Consent checkbox */}
        <div className="flex items-start space-x-3">
          <input
            {...register('consent')}
            type="checkbox"
            id="consent"
            className="mt-1 w-4 h-4 text-white bg-transparent border border-white/30 rounded focus:ring-white/20"
          />
          <label htmlFor="consent" className="text-sm text-white/70">
            Я согласен на обработку персональных данных и получение уведомлений о бета-тестировании *
          </label>
        </div>
        {errors.consent && (
          <p className="text-sm text-red-400">{errors.consent.message}</p>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 glass-panel rounded-lg border border-red-400/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full px-6 py-4 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              <span>Отправляем...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Записаться в Beta</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
