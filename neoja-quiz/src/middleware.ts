import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import Urls from './app/remote/Urls';

export async function middleware(request: NextRequest) {
  try {
    console.log('🔍 Middleware executing for path:', request.nextUrl.pathname)
    
    // Get the device ID from cookies
    const deviceId = request.cookies.get('deviceId')?.value;
    console.log("📱 Device ID from cookies:", deviceId)
    
    // If no device ID, allow access to register page
    if (!deviceId) {
      console.log("➡️ No device ID found, allowing access to register page")
      return NextResponse.next()
    }

    try {
      const response = await fetch(Urls.CHECK_DEVICE, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: deviceId
        })
      });

      const data = await response.json();
      console.log("📦 API Response data:", data)
      console.log("✅ API Response status:", response.status)
      
      if (data.status === 'success' && data.token) {
        // User is logged in, redirect to scan
        console.log("🔄 User logged in, redirecting to /arena")
        return NextResponse.redirect(new URL('/arena', request.url))
      }

      if (data.status === 'success' && data.requiresRegistration) {
        // User needs to register, redirect to register
        console.log("🔄 Registration required, redirecting to /register")
        return NextResponse.redirect(new URL('/register', request.url))
      }
    } catch (error) {
      console.error("❌ API call failed:", error)
      // If API call fails, allow access to register page
      return NextResponse.next()
    }

    console.log("➡️ Continuing to next middleware/page")
    return NextResponse.next()
  } catch (error) {
    console.error("❌ Middleware error:", error)
    return NextResponse.next()
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/', '/register']
} 