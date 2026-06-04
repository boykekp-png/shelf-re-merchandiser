/**
 * EN: NextAuth Configuration
 *     Sets up credential-based authentication with email + password.
 *     Uses bcrypt for password verification and JWT for session management.
 *     Role is stored on both the JWT token and the session object.
 *
 * ID: Konfigurasi NextAuth
 *     Mengatur autentikasi berbasis kredensial dengan email + password.
 *     Menggunakan bcrypt untuk verifikasi password dan JWT untuk manajemen sesi.
 *     Peran disimpan di token JWT dan objek sesi.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

// EN: Exported handlers for API routes, auth() for server components, signIn for client.
// ID: Handler yang diekspor untuk rute API, auth() untuk komponen server, signIn untuk client.
export const { handlers, auth, signIn } = NextAuth({
  providers: [
    // EN: Email/password credential provider using bcrypt comparison.
    // ID: Provider kredensial email/password menggunakan perbandingan bcrypt.
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // EN: Validate required fields / ID: Validasi field wajib
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // EN: Look up user by email / ID: Cari pengguna berdasarkan email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null; // EN: User not found / ID: Pengguna tidak ditemukan
        }

        // EN: Compare hashed password / ID: Bandingkan password yang di-hash
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash,
        );

        if (!isValid) {
          return null; // EN: Wrong password / ID: Password salah
        }

        // EN: Return user object (stored in JWT). Note: role is a custom field.
        // ID: Kembalikan objek pengguna (disimpan di JWT). Catatan: role adalah field kustom.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    // EN: JWT callback — enrich the token with user id and role.
    // ID: Callback JWT — memperkaya token dengan id dan peran pengguna.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // EN: Custom field / ID: Field kustom
      }
      return token;
    },
    // EN: Session callback — copy token data into the session object.
    // ID: Callback sesi — salin data token ke objek sesi.
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role; // EN: Used for admin checks / ID: Digunakan untuk pengecekan admin
      }
      return session;
    },
  },
  pages: {
    signIn: '/login', // EN: Custom login page / ID: Halaman login kustom
  },
  session: {
    strategy: 'jwt', // EN: Stateless JWT sessions (no DB session table) / ID: Sesi JWT stateless (tanpa tabel sesi DB)
  },
  secret: process.env.NEXTAUTH_SECRET, // EN: Secret for signing JWTs / ID: Secret untuk menandatangani JWT
});