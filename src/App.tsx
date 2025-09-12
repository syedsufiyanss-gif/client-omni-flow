import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CRMLayout } from "./components/layout/CRMLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<CRMLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leads" element={<div className="p-6">Leads Management - Coming Soon</div>} />
            <Route path="/contacts" element={<div className="p-6">Contacts Management - Coming Soon</div>} />
            <Route path="/opportunities" element={<div className="p-6">Opportunities Pipeline - Coming Soon</div>} />
            <Route path="/projects" element={<div className="p-6">Project Management - Coming Soon</div>} />
            <Route path="/tasks" element={<div className="p-6">Task Management - Coming Soon</div>} />
            <Route path="/communications" element={<div className="p-6">Communications Hub - Coming Soon</div>} />
            <Route path="/quotes" element={<div className="p-6">Quotations - Coming Soon</div>} />
            <Route path="/invoices" element={<div className="p-6">Invoicing & Billing - Coming Soon</div>} />
            <Route path="/analytics" element={<div className="p-6">Analytics & Reports - Coming Soon</div>} />
            <Route path="/companies" element={<div className="p-6">Company Management - Coming Soon</div>} />
            <Route path="/settings" element={<div className="p-6">Settings - Coming Soon</div>} />
            <Route path="/support" element={<div className="p-6">Support & Helpdesk - Coming Soon</div>} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
