import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout.tsx";
import { AdminDashboard } from "./pages/AdminDashboard.tsx";
import { InspectorMobileView } from "./pages/InspectorMobileView.tsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route element={<AppLayout title="Admin dashboard" />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route element={<AppLayout title="Field inspection" />}>
          <Route path="/inspector" element={<InspectorMobileView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
