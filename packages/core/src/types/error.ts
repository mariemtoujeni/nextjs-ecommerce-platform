export class NotFoundError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'NotFoundError'
  }
}

export class BadRequestError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'BadRequestError'
  }
}

export class UnauthorizedError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'UnauthorizedError'
  }
}

export class InputParserError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'InputParserError'
  }
}

export class InternalServerError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'InternalServerError'
  }
}


export enum ErrorCodes {
    CLIENT_INEXISTANT = 'CLIENT_INEXISTANT',
    UTILISATEUR_NON_CONNECTE = 'UTILISATEUR_NON_CONNECTE',
    STOCK_INSUFFISANT = 'STOCK_INSUFFISANT',
    MODELE_INEXISTANT = 'MODELE_INEXISTANT',
    PANIER_INEXISTANT = 'PANIER_INEXISTANT',
    MAJ_PANIER_IMPOSSIBLE = 'MAJ_PANIER_IMPOSSIBLE',
    AUCUNE_ZONE_DE_LIVRAISON = 'AUCUNE_ZONE_DE_LIVRAISON',
    MAJ_PANIER_REDUCTIONS_IMPOSSIBLE = 'MAJ_PANIER_REDUCTIONS_IMPOSSIBLE',
    EMAIL_IMPOSSIBLE = 'EMAIL_IMPOSSIBLE',
    NEWSLETTER_INSCRIPTION_FAILED = 'NEWSLETTER_INSCRIPTION_FAILED',
    UPDATE_USER_ERROR = 'UPDATE_USER_ERROR',
    UNAUTHORIZED_USER_ACCESS = 'UNAUTHORIZED_USER_ACCESS',
    PAIEMENT_IMPOSSIBLE = 'PAIEMENT_IMPOSSIBLE'
}
