/** Where the calls to action lead. Set per environment; nothing here invents an address. */
export const site = {
  /** The hosted app (Sign in). */
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  /** Contact sales, request an integration. */
  contactUrl: process.env.CONTACT_URL ?? "/#contact",
  /** Sign-up for the hosted plans (Professional, Business) and the free trial (one month of Business). */
  signupUrl: process.env.SIGNUP_URL ?? process.env.APP_URL ?? "http://localhost:3000",
  /** Installation instructions for self-hosted Community. */
  selfHostUrl: process.env.SELF_HOST_URL ?? process.env.CONTACT_URL ?? "/#contact",
};
