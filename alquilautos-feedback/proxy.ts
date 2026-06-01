import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/unauthorized",
  //"/sign-up(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/moderacion(.*)",
  "/resenas(.*)",
  "/entidades(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

  if (req.nextUrl.pathname.startsWith("/sign-up")){
    return Response.redirect(new URL("/sign-in", req.url));
  }

  if (isPublicRoute(req)) {
    return;
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    await auth.protect();
    return;
  }

  if (isAdminRoute(req)) {
    const metadata = sessionClaims?.publicMetadata as { role? : string };
    const role = metadata?.role;

    if (role !== "adminFeedback") {
      return Response.redirect(new URL("/unauthorized", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};