import { z } from "zod";

export enum TUserSecretType {
  WebLogin = "web-login",
  CreditCard = "credit-card",
  SecureNote = "secure-note"
}

export type TRawUserSecret = {
  id: string;
  name: string;
  type: TUserSecretType;
  userId: string;
  orgId: string;
  createdAt: Date;
  updatedAt: Date;
  credentials: z.output<typeof TUserSecretCredentialsSchema>;
};

export const TUserSecretCredentialsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(TUserSecretType.WebLogin),
    username: z.string(),
    password: z.string()
  }),
  z.object({
    type: z.literal(TUserSecretType.CreditCard),
    cardNumber: z.string().min(16).max(16).regex(/^\d+$/, "Card number must be a number"),
    expiryMonth: z.string().min(2).max(2).regex(/^\d+$/, "Expiry month must be a number"),
    expiryYear: z.string().min(2).max(2).regex(/^\d+$/, "Expiry year must be a number"),
    cvv: z.string().min(3).max(4).regex(/^\d+$/, "CVV must be a number")
  }),
  z.object({
    type: z.literal(TUserSecretType.SecureNote),
    note: z.string()
  })
]);

export type TCreateUserSecretRequest = { name: string } & z.input<
  typeof TUserSecretCredentialsSchema
>;
