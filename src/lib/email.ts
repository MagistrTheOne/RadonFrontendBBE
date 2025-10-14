import { Resend } from 'resend';
import { WaitlistFormData } from './validations/waitlist';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWaitlistEmail(data: WaitlistFormData) {
  try {
    const emailContent = `
Новая заявка в Beta Radon AI

Имя: ${data.name}
Email: ${data.email}
Telegram: ${data.telegram || 'Не указан'}
Use Case: ${data.useCase || 'Не указан'}
Дата: ${new Date().toLocaleString('ru-RU')}

---
Radon Black Box Edition AI
`;

    const result = await resend.emails.send({
      from: 'Radon AI <noreply@radonai.com>',
      to: ['maxonyushko71@gmail.com'],
      subject: 'Новая заявка в Beta Radon AI',
      text: emailContent,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('Error sending waitlist email:', error);
    return { success: false, error: 'Failed to send email' };
  }
}
