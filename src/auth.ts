import { BrowserContext } from "playwright";

type SameSite = "Lax" | "Strict" | "None";

export async function applyAuthCookie(context: BrowserContext, url: string) {
    const name = process.env.AUTH_COOKIE_NAME;
    const value = process.env.AUTH_COOKIE_VALUE;
    const domain = process.env.AUTH_COOKIE_DOMAIN;
    const cookiePath = process.env.AUTH_COOKIE_PATH ?? "/";

    if (!name || !value || !domain) {
        throw new Error("Missing AUTH_COOKIE_NAME / AUTH_COOKIE_VALUE / AUTH_COOKIE_DOMAIN");
    }

    const secure = (process.env.AUTH_COOKIE_SECURE ?? "true").toLowerCase() === "true";
    const sameSite = (process.env.AUTH_COOKIE_SAMESITE ?? "Lax") as SameSite;

    // Visit the site origin once so the context is on the right “site”
    // (Helps with some apps and service workers; safe even if it redirects)
    const page = await context.newPage();
    await page.goto(new URL(url).origin, { waitUntil: "domcontentloaded" }).catch(() => { });
    await page.close();

    await context.addCookies([
        {
            name,
            value,
            domain,
            path: cookiePath,
            httpOnly: true,     // typical for auth cookies; set false if yours is not httpOnly
            secure,
            sameSite
            // You can also add `expires` if you have it (unix seconds). If omitted, it becomes a session cookie.
        }
    ]);
}