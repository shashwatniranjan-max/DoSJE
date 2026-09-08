import { useEffect, useState } from "react";
import { isInspectionFailedAlert, type InspectionFailedAlert } from "../lib/alerts.ts";
import { getSocket } from "../lib/socket.ts";

export function InspectionAlertBanner() {
  const [alert, setAlert] = useState<InspectionFailedAlert | null>(null);

  useEffect(() => {
    const socket = getSocket();

    const onFailed = (payload: unknown) => {
      if (isInspectionFailedAlert(payload)) {
        setAlert(payload);
      }
    };

    socket.on("inspection:failed", onFailed);
    return () => {
      socket.off("inspection:failed", onFailed);
    };
  }, []);

  if (!alert) {
    return null;
  }

  return (
    <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800" role="alert">
      Live alert: {alert.message} (institute {alert.instituteId})
    </div>
  );
}
