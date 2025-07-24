'use client';

import { AuthProvider } from "@/context/AuthContext";
import AuthWrapper from "@/components/auth/AuthWrapper";
import Navbar from "@/components/layout/Navbar";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Navbar />
        {children}
      </AuthWrapper>
    </AuthProvider>
  );
}