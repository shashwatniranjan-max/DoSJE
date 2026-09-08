import { Outlet } from "react-router-dom";
import { InspectionAlertBanner } from "../components/InspectionAlertBanner.tsx";

type AppLayoutProps = {
  title: string;
};

export function AppLayout({ title }: AppLayoutProps) {
  return (
    <div className="min-h-svh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">DoSJE</p>
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <InspectionAlertBanner />
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}
