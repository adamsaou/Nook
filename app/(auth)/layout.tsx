/** Centered shell for the auth pages (login, signup). */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">{children}</main>
  );
}
