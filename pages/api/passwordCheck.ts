import { passwordCheckHandler } from "next-password-protect";

export default passwordCheckHandler(process.env.STAGING_PASSWORD, {
  cookieName: "authorization",
});
