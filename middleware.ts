import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

// Session timeout: 10 menit (dalam milidetik)
const SESSION_TIMEOUT = 10 * 60 * 1000; // 10 menit

export function middleware(request: NextRequest) {
    // URLs to ignore (public assets, login page, api routes that don't need auth)
    const publicPaths = [
        "/login",
        "/api/auth/login",
        "/api/auth/register",
        "/api/setup",
        "/favicon.ico",
        "/mimh 02.png" // Your logo
    ];

    const { pathname } = request.nextUrl;

    // Allow public paths
    if (publicPaths.some((path) => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Check for session cookie (using "token" as set in login route)
    const token = request.cookies.get("token");
    const lastActivityCookie = request.cookies.get("lastActivity");

    // If no token and trying to access protected route, redirect to login
    if (!token) {
        // Untuk API routes, return 401 instead of redirect
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Unauthorized - No token" },
                { status: 401 }
            );
        }

        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Cek waktu aktivitas terakhir
    if (lastActivityCookie) {
        const lastActivity = parseInt(lastActivityCookie.value);
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - lastActivity;

        // Jika sudah lebih dari 10 menit tidak ada aktivitas, redirect ke login
        if (timeSinceLastActivity > SESSION_TIMEOUT) {
            // Untuk API routes, return 401 instead of redirect
            if (pathname.startsWith("/api/")) {
                const response = NextResponse.json(
                    { error: "Session expired" },
                    { status: 401 }
                );
                response.cookies.delete("token");
                response.cookies.delete("lastActivity");
                return response;
            }

            const url = request.nextUrl.clone();
            url.pathname = "/login";

            // Hapus cookies yang sudah expired
            const response = NextResponse.redirect(url);
            response.cookies.delete("token");
            response.cookies.delete("lastActivity");

            return response;
        }
    } else {
        // Jika cookie lastActivity tidak ada tapi token ada, redirect ke login
        // (kemungkinan cookie lastActivity terhapus atau corrupt)

        // Untuk API routes, return 401 instead of redirect
        if (pathname.startsWith("/api/")) {
            const response = NextResponse.json(
                { error: "Invalid session" },
                { status: 401 }
            );
            response.cookies.delete("token");
            return response;
        }

        const url = request.nextUrl.clone();
        url.pathname = "/login";

        const response = NextResponse.redirect(url);
        response.cookies.delete("token");

        return response;
    }

    // Update lastActivity timestamp untuk setiap request yang valid
    const response = NextResponse.next();
    response.cookies.set("lastActivity", Date.now().toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24, // 1 hari (sama dengan token)
        path: "/",
        sameSite: "lax",
    });

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         */
        '/((?!_next/static|_next/image).*)',
    ],
};
