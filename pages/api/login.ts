import { loginHandler } from "next-password-protect";

export default loginHandler(process.env.PRODUCTION_PASSWORD, {
  cookieName: "authorization",
});
