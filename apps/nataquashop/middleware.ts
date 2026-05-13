import { getInjection } from '@repo/core/types'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Langues supportées par l'application
const locales = ['fr', 'en']

// Langue par défaut
const defaultLocale = 'fr'

// Fonction pour obtenir la langue préférée de l'utilisateur
function getLocale(request: NextRequest): string {
  // Récupérer l'en-tête Accept-Language du navigateur
  const acceptLanguage = request.headers.get('accept-language')
  
  if (acceptLanguage) {
    // Parser les langues préférées
    const languages = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0]?.trim() || '')
      .filter(lang => lang && locales.includes(lang))
    
    // Retourner la première langue supportée ou la langue par défaut
    return languages.length > 0 ? languages[0]! : defaultLocale
  }
  
  return defaultLocale
}

export async function middleware(request: NextRequest) {
  // Récupérer le chemin de la requête
  const { pathname } = request.nextUrl
  
  // Vérifier si le chemin contient déjà une locale
  const pathnameHasLocale = /^\/[a-z]{2}(?:\/|$)/.test(pathname)

  // Si le chemin n'a pas de locale, rediriger vers la langue détectée
  if (!pathnameHasLocale ) {
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  } else if (pathnameHasLocale && !locales.includes(pathname.split('/')[1]!)) {
    const newPathname = pathname.replace(`/${pathname.split('/')[1]}`, `/${defaultLocale}`)
    return NextResponse.redirect(new URL(newPathname, request.url))
  }

  // Logique d'authentification existante
  const authService = await getInjection('IAuthenticationService');

  try {
    const { user, response } = await authService.updateSession(request);

    if(!user) {
      await authService.signInAnonymously();
    }

    return response;
  } catch( error ) {
    await authService.signInAnonymously();
  }

  return NextResponse.next({request});
}

// Configuration du middleware
export const config = {
  matcher: [
    // Ignorer tous les chemins internes (_next)
    '/((?!_next|api|favicon.ico|images|.*\\.).*)',
    // Optionnel : exécuter uniquement sur l'URL racine (/)
    // '/'
  ],
} 