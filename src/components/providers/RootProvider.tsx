'use client';

import { AuthProvider } from "@/context/AuthContext";
import AuthWrapper from "@/components/auth/AuthWrapper";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AuthWrapper>
        {children}
      </AuthWrapper>
    </AuthProvider>
  );
}