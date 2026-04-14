/**
 * OperationalService - Historical logs for Job Genie
 * Used by Jitro AI for data-driven answers.
 */

export const OPERATIONAL_LOGS = [
  { id: "log_001", date: "2026-02-02", workerName: "Sunil Singh", hoursWorked: 9, site: "Warehouse A", status: "Completed" },
  { id: "log_002", date: "2026-02-02", workerName: "Ravi Kumar", hoursWorked: 8, site: "Warehouse B", status: "Completed" },
  { id: "log_003", date: "2026-02-05", workerName: "Priya Sharma", hoursWorked: 10, site: "Site C", status: "Completed" },
  { id: "log_004", date: "2026-02-12", workerName: "Sunil Singh", hoursWorked: 8, site: "Warehouse A", status: "Completed" },
  { id: "log_005", date: "2026-02-20", workerName: "Ravi Kumar", hoursWorked: 12, site: "Main Hub", status: "Completed" }
];

export const operationalService = {
  getLogsByDate: (date) => OPERATIONAL_LOGS.filter(l => l.date === date),
  getAllLogs: () => OPERATIONAL_LOGS
};
