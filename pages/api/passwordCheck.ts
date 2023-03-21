import { passwordCheckHandler } from "next-password-protect";

export default passwordCheckHandler(process.env.PRODUCTION_PASSWORD, {
  cookieName: "authorization",
});
