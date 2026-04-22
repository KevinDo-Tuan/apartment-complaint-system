import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { RegistrationModal } from "./components/RegistrationModal";
import { useGetUserProfile, useIsRegistered } from "./hooks/useQueries";
import { ComplaintBoard } from "./pages/ComplaintBoard";
import { ComplaintDetail } from "./pages/ComplaintDetail";
import { HostDashboard } from "./pages/HostDashboard";
import { ProfilePage } from "./pages/ProfilePage";

function AppRoutes() {
  const { identity } = useInternetIdentity();
  const { data: isRegistered, isLoading: registeredLoading } =
    useIsRegistered();
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile();
  const [showRegistration, setShowRegistration] = useState(false);

  const isAuthenticated = !!identity;
  const isLoading = registeredLoading || profileLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      setShowRegistration(false);
      return;
    }
    if (
      !isLoading &&
      isAuthenticated &&
      isRegistered === false &&
      !userProfile
    ) {
      const timer = setTimeout(() => setShowRegistration(true), 400);
      return () => clearTimeout(timer);
    }
    if (isRegistered || userProfile) {
      setShowRegistration(false);
    }
  }, [isAuthenticated, isLoading, isRegistered, userProfile]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ComplaintBoard />} />
        <Route path="/host" element={<HostDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        <Route path="*" element={<ComplaintBoard />} />
      </Routes>

      {showRegistration && (
        <RegistrationModal onClose={() => setShowRegistration(false)} />
      )}
    </Layout>
  );
}

export default function App() {
  return <AppRoutes />;
}
