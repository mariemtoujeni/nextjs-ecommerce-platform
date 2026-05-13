import * as React from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Input, Heading } from "./ui";
import { Diamond } from "lucide-react";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaXTwitter, FaLinkedinIn, FaYoutube, } from "react-icons/fa6";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { Langs } from "~/app/utils";
import { getDictionary } from "~/app/dictionaries";
import Newsletter from "./newsletter";

interface FooterProps extends React.HTMLAttributes<HTMLDivElement> {
  lang: Langs; 
  isUserSignedIn: boolean,
}

export async function Footer({ className, isUserSignedIn, lang , ...props }: FooterProps) {
  const dict = await getDictionary(lang);
  
  return (
    <div className={cn( "flex flex-col mt-10 bg-black text-white", className )} {...props} >
      <div className="w-full max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <Image src="/images/logo/footer-logo.svg" alt="Logo" width={100} height={100}/>
          <div>
            <h4 className="font-semibold text-primary">
              {dict.globalfooter.alertTitle}
            </h4>
            <p className="mt-2 font-thin text-sm">
              <strong>{dict.globalfooter.newsletterDescA}</strong>{dict.globalfooter.newsletterDescB}
            </p>
          </div>
          <Newsletter newsletter={false} dict={dict} />
          <p className="font-thin text-xs">
            {dict.globalfooter.legalDisclaimer}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">

          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold mb-2">{dict.globalfooter.categories.services}</h4>{/* Nos services */}
            <a href={`/${lang}/customization`} className="font-thin">{dict.globalfooter.servicelinks[0]}</a>{/* Personnalisation */}
            <a href={`/${lang}/size-guide`} className="font-thin">{dict.globalfooter.servicelinks[1]}</a>{/* Guide des tailles */}
            <a href={`/${lang}/return-policy`} className="font-thin">{dict.globalfooter.servicelinks[2]}</a>{/* Politique de retours */}
            {/* <a href="#" className="font-thin">{dict.globalfooter.links[3]}</a> */}
          </div>

          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold mb-2">{dict.globalfooter.categories.advice}</h4> {/* Infos clients */}
            <a href={`/${lang}/about`} className="font-thin">{dict.globalfooter.adviseLinks[0]}</a> {/* À propos */}
            <a href={`/${lang}/legal/legal-notices`} className="font-thin">{dict.globalfooter.adviseLinks[1]}</a> {/* Mentions légales */}
            <a href={`/${lang}/legal/terms-and-conditions`} className="font-thin">{dict.globalfooter.adviseLinks[2]}</a> {/* Conditions générales */}
            <a href={`/${lang}/faq`} className="font-thin">{dict.globalfooter.adviseLinks[3]}</a> {/* FAQ */}
          </div>

          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold mb-2">{dict.globalfooter.categories.customerInfo}</h4> {/* Aide & Support */}
            <a href={isUserSignedIn ? `/${lang}/account/informations` : `/${lang}/signin`} className="font-thin">{dict.globalfooter.dataClientLinks[0]}</a>{/* Mon compte client */}
            <a href={isUserSignedIn ? `/${lang}/account/orders ` : `/${lang}/signin`} className="font-thin">{dict.globalfooter.dataClientLinks[1]}</a> {/* Suivi des commandes */}
            <a href={`/${lang}/return-policy`} className="font-thin">{dict.globalfooter.dataClientLinks[2]}</a>{/* Nous contacter */}
            {/*<a href="#" className="font-thin">{dict.globalfooter.links[3]}</a>*/}
          </div>

          <div className="flex flex-col space-y-2">
            <h4 className="font-semibold mb-2">{dict.globalfooter.categories.followUs}</h4> {/* Suivez-nous */}
            <a href="https://www.facebook.com/NATAQUASHOP/?locale=fr_FR" className="font-thin flex items-center gap-2" target="_blank" rel="noopener noreferrer">
              <FaFacebookF /> Facebook
            </a>
            <a href="https://www.instagram.com/nataquashop/?hl=fr" className="font-thin flex items-center gap-2" target="_blank" rel="noopener noreferrer">
              <FaInstagram /> Instagram
            </a>
              <a href="https://x.com/nataquashop" className="font-thin flex items-center gap-2" target="_blank" rel="noopener noreferrer">
              <FaXTwitter /> X
            </a>
            <a href="https://www.linkedin.com/in/caroline-barthelemy-b2169b1b9/" className="font-thin flex items-center gap-2" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn /> LinkedIn
            </a>
            <a href="https://www.youtube.com/channel/UCjai5-kurcRie3RG-FPODvQ" className="font-thin flex items-center gap-2" target="_blank" rel="noopener noreferrer">
              <FaYoutube /> Youtube
            </a>
          </div>
        </div>
      </div>
      <Separator className="w-full sm:w-[77rem] mx-auto bg-white" />

      <div className="w-full max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
        <div>© {new Date().getFullYear()} . {dict.globalfooter.copyright}</div>
        <div className="flex gap-4 text-center sm:text-left">         
          <a  className="hover:underline">{dict.globalfooter.cookies}</a>
        </div>
      </div>
    </div>
  );
}
