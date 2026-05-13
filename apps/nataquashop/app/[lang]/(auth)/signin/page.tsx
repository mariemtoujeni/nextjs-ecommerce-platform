
import { getDictionary } from '../../../dictionaries';
import { LangParams } from '~/app/utils';
import SignIn from './SignIn';

type Props = {
  params: Promise<LangParams>
}

export default async function SigninPage({ params }: Props) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return <SignIn dict={dict} />
} 
