import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./components/AuthProvider";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Users from "./pages/Users";
import Transactions from "./pages/Transactions";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { DataProvider } from "./components/DataProvider";
import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { bsc } from "@reown/appkit/networks";

const projectId = "0a22b2d60a1b3b87a850f5baba81f7f2";

const networks = [bsc];

const metadata = {
  name: "Charlie Presale Admin Dashboard",
  description: "Admin Dashboard of Presale powered by Charlie Unicorn AI",
  url: "https://admin-charlieunicornai-presale.vercel.app",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

createAppKit({
  adapters: [new EthersAdapter()],
  networks: networks as any,
  metadata,
  projectId,
  features: {
    analytics: true,
    email: false,
    socials: false,
    history: false,
    swaps: false,
    send: false,
  },
  themeMode: localStorage.getItem("theme") as any,
});

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="users" element={<Users />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
