// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Today from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Namaz from "./pages/Namaz";
import Goals from "./pages/Goals";
import Elan from "./pages/Elan";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CalendarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Auth />} />
              <Route path="/auth" element={<Navigate to="/" replace />} />
              <Route path="/auth/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route
                path="/auth/onboarding"
                element={
                  <ProtectedRoute>
                    <Onboarding />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/today"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Today />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Goals />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Profile />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/namaz"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Namaz />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/elan"
                element={
                  <ProtectedRoute>
                    <Elan />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CalendarProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
