// App entry point
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PushNotificationNavigator } from "@/components/push/PushNotificationNavigator";
import { AuthProvider } from "@/contexts/AuthContext";
import { CalendarProvider } from "@/contexts/CalendarContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Today from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Namaz from "./pages/Namaz";
import Goals from "./pages/Goals";
import CompletedGoals from "./pages/CompletedGoals";
import Calendar from "./pages/Calendar";
import DynamicGoalsSettings from "./pages/DynamicGoalsSettings";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminElans from "./pages/admin/AdminElans";
import AdminTags from "./pages/admin/AdminTags";
import AdminUsers from "./pages/admin/AdminUsers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
      <CalendarProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <PushNotificationNavigator>
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
                path="/goals/completed"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <CompletedGoals />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/goals/dynamic-goals"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <DynamicGoalsSettings />
                    </AppLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <AppLayout>
                      <Calendar />
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
              <Route path="/elan" element={<Navigate to="/admin/elans" replace />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="elans" element={<AdminElans />} />
                <Route path="tags" element={<AdminTags />} />
                <Route path="users" element={<AdminUsers />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </PushNotificationNavigator>
          </BrowserRouter>
        </TooltipProvider>
      </CalendarProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
