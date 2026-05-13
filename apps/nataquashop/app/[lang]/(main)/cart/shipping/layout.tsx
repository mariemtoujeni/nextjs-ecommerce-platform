import { getUserUseCase } from '@repo/core/usecases';
import { redirect } from 'next/navigation'
import { ReactNode } from 'react';

interface CartShippingLayoutProps {
  children: ReactNode;
}


export default async function CartShippingLayout({ children }: CartShippingLayoutProps) {
  const user = await getUserUseCase();

  if (!user || user.is_anonymous) {
    redirect('/cart/resume')
  }

  return <>{children}</>
}
