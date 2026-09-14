import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import FeedbackPage from "./pages/Feedback";
import LandingPage from "./pages/Landing";
import QRPage from "./pages/QR";
import FeedbackManagementPage from "./pages/FeedbackManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/qr" element={<QRPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/feedback-management" element={<FeedbackManagementPage />} />
    </Routes>
  );
}
