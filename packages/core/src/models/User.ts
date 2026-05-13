import { ErrorCodes, UnauthorizedError } from "../types/error";
import { z } from "zod"
import { signUpClubMemberSchema, signUpInputSchema } from "./Client";
import { AddressSignUpClubSchema, AddressSignUpInputSchema } from "./Address";
import { clubSignUpInputSchema } from "./Club";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  checkAdmin: z.boolean().optional(),
})

export type SignInRequest = z.infer<typeof signInSchema>

export interface UserWithPassword {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  password: string;
  is_anonymous: boolean;
  user_role: string;
}

export type UserWithoutPassword = Omit<UserWithPassword, 'password'>;

export enum UserRoles {
  SUPER_ADMIN = "admin.super",
  EDITOR = "admin.editor",
}


export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  lastName: z.string(),
  firstName: z.string(),
  Address: z.string(),
  postCode: z.string(),
  city: z.string(),
  country: z.string(),
});

export type SignUpRequest = z.infer<typeof signUpSchema>;

export type SignUpRequestWithoutPassword = Omit<SignUpRequest, 'password'>;

export class User {
  id: string;
  last_name: string;
  first_name: string;
  email: string;
  is_anonymous: boolean;
  user_role: string;

  constructor({ id, last_name, first_name, email, is_anonymous, user_role, }: UserWithoutPassword) {
    this.id = id;
    this.last_name = last_name;
    this.first_name = first_name;
    this.email = email;
    this.is_anonymous = is_anonymous;
    this.user_role = user_role;
  }

  validateRole(roles: string[]) {
    if (!roles.includes(this.user_role)) {
      throw new UnauthorizedError(ErrorCodes.UNAUTHORIZED_USER_ACCESS);
    }
  }

  get(): UserWithoutPassword {
    return {
      id: this.id,
      last_name: this.last_name,
      first_name: this.first_name,
      email: this.email,
      is_anonymous: this.is_anonymous,
      user_role: this.user_role,
    }
  }
}

export type NewUserClient = {
  numero_client: number;
  isNew: boolean
}
export type UserData = {
  email: string,
  password: string
}
export const SignUpPayloadSchema = z.object({
  user: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, { message: "TOO_SHORT" })
      .regex(/[A-Z]/, { message: "NO_UPPERCASE" })
      .regex(/[a-z]/, { message: "NO_LOWERCASE" })
      .regex(/[0-9]/, { message: "NO_NUMBER" })
      .regex(/[^A-Za-z0-9]/, { message: "NO_SPECIAL" }),
  }),
  client: signUpInputSchema,
  address: AddressSignUpInputSchema,

})
export type SignUpPayload = z.infer<typeof SignUpPayloadSchema>;

export const SignUpClubSchema = z.object({
  user: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, { message: "TOO_SHORT" })
      .regex(/[A-Z]/, { message: "NO_UPPERCASE" })
      .regex(/[a-z]/, { message: "NO_LOWERCASE" })
      .regex(/[0-9]/, { message: "NO_NUMBER" })
      .regex(/[^A-Za-z0-9]/, { message: "NO_SPECIAL" }),
  }),
  client: signUpClubMemberSchema,
  address: AddressSignUpClubSchema,
  club: clubSignUpInputSchema,
})
export type SignUpClub = z.infer<typeof SignUpClubSchema>;
export type ResetPasswordData = {
  prenom: string;
  site: string;
  lien_de_connexion: string;
};

export const ValidateInvitationSchema = z.object({
  code: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});
export type ValidateInvitation = z.infer<typeof ValidateInvitationSchema>;
export type ValidateInvitationInput = z.infer<typeof ValidateInvitationSchema>;
