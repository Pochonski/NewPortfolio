import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
    "/perfumes-el-pocho.vercel.app/:path*",
    "/prestamos-mi-principe.vercel.app/:path*",
    "/scorehub-pocho.vercel.app/:path*",
    "/stickerhubs.vercel.app/:path*",
    "/fetchcpu-pocho.vercel.app/:path*",
    "/en/perfumes-el-pocho.vercel.app/:path*",
    "/en/prestamos-mi-principe.vercel.app/:path*",
    "/en/scorehub-pocho.vercel.app/:path*",
    "/en/stickerhubs.vercel.app/:path*",
    "/en/fetchcpu-pocho.vercel.app/:path*",
  ],
};
