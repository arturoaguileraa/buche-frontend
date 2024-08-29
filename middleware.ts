//CON CONEXION ctrl + k + c

import { NextRequestWithAuth, withAuth } from 'next-auth/middleware';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ProfileData } from './app/utils/jwtUtils';
import { refreshToken } from './app/api/api';

const secret = process.env.NEXTAUTH_SECRET;

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request, secret });

  if (request.nextUrl.pathname.startsWith("/auth/signin")) {
    const token = await getToken({ req: request });

    if (null !== token)
      return NextResponse.redirect(new URL("/home", request.url));
  }

  if (request.nextUrl.pathname === "/") {
    const token = await getToken({ req: request });

    if (null !== token)
      return NextResponse.redirect(new URL("/home", request.url));
  }

  // Si el usuario no tiene token, permitir la navegación a la página de inicio de sesión
  if (!token) {
    return withAuth(request, {
      pages: {
        signIn: "/auth/signin",
      },
    });
  }
  

  // Decodificar el token para obtener el rol del usuario
  let user = jwt.decode(token.accessToken as string) as ProfileData;
  let userRole = user.roles || 'PENDING';
  
  // Verificar si el token necesita ser refrescado y obtener un nuevo token si es necesario
  if(user.roles === "PENDING"){
    const newToken = await refreshToken(token);
    if (newToken) {
      token.accessToken = newToken;
    }
    user = jwt.decode(token.accessToken as string) as ProfileData;
    userRole = user.roles;
  }
  
  // Redirigir a la página de selección de rol si el rol es PENDING
  if (userRole === 'PENDING' && request.nextUrl.pathname !== "/select-role") {
    return NextResponse.redirect(new URL("/select-role", request.url));
  }

  // Redirigir a la página principal si el usuario ya ha seleccionado un rol
  if (userRole !== 'PENDING' && request.nextUrl.pathname === "/select-role") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/((?!_next|api|favicon.ico).*)'],
};



// SIN CONEXION
// export async function middleware(){

// }