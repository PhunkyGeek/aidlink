"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Navbar from "@/components/Navbar/Navbar";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppProviders from "@/providers/AppProviders";

import { createNetworkConfig, SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { getFullnodeUrl } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserStore } from "@/store/useUserStore";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient();
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { address } = useUserStore();
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [showSidebar, setShowSidebar] = useState(true); // desktop

  useEffect(() => {
    if (address) {
      setShowSidebar(true);
    } else {
      setShowSidebar(false);
      setSidebarOpen(false); // also close mobile sidebar
    }
  }, [address]);
  

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect>
              <AppProviders>
                <Navbar
                  onMenuClick={() => setSidebarOpen(!sidebarOpen)}
                  onSidebarToggle={() => setShowSidebar(!showSidebar)}
                  isSidebarVisible={showSidebar}
                />

                <div className="flex min-h-screen">
                  {/* Desktop Sidebar */}
                  <div
                    className={`hidden md:block top-14 transition-all duration-300 ease-in-out ${
                      showSidebar ? "w-64" : "w-0"
                    }`}
                  >
                    <div
                      className={`h-screen fixed top-14 transition-opacity duration-300 ${
                        showSidebar
                          ? "opacity-100"
                          : "opacity-0 pointer-events-none"
                      }`}
                    >
                      {showSidebar && <Sidebar />}
                    </div>
                  </div>

                  {/* Mobile Sidebar Overlay */}
                  <div
                    className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
                      sidebarOpen
                        ? "opacity-100 pointer-events-auto bg-opacity-50"
                        : "opacity-0 pointer-events-none"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div
                      className={`absolute top-14 left-0 h-full w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => setSidebarOpen(false)}
                        className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 text-xl font-bold hover:text-red-500"
                      >
                        &times;
                      </button>
                      <Sidebar />
                    </div>
                  </div>

                  {/* Page Content */}
                  <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50 dark:bg-gray-900 overflow-auto transition-all duration-300">
                    {children}
                  </main>
                </div>
              </AppProviders>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
