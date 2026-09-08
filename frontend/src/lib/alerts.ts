export type InspectionFailedAlert = {
  instituteId: string;
  inspectorId: string;
  status: "FAILED";
  message: string;
  timestamp: string;
};

export function isInspectionFailedAlert(value: unknown): value is InspectionFailedAlert {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.instituteId === "string" &&
    typeof record.inspectorId === "string" &&
    record.status === "FAILED" &&
    typeof record.message === "string" &&
    typeof record.timestamp === "string"
  );
}
