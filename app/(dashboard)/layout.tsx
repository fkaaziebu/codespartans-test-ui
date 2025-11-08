"use client";

import DashboardNavbar from "./(component)/dashboardHeader";
export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Header */}
      <header className=" p-1 border shadow-xl">
        <DashboardNavbar />
      </header>

      {/* Main content */}
      <main className="w-full flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white p-4">
        <p>Dashboard Footer</p>
      </footer>
    </div>
  );
}
