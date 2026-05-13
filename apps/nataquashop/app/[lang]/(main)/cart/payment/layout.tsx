import { getUserUseCase } from '@repo/core/usecases';
import { redirect } from 'next/navigation'
import { ReactNode } from 'react';

interface CartPaymentLayoutProps {
  children: ReactNode;
}


export default async function CartPaymentLayout({ children }: CartPaymentLayoutProps) {
  const user = await getUserUseCase();

  if (!user || user.is_anonymous) {
    redirect('/cart/resume');
  }

  return <>{children}</>
}
