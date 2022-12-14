import { logger } from "../logger";
import { LogEntry } from "../gcp/cloudlogging";

/**
 * The correct API filter to use when GCFv2 is enabled and/or we want specific function logs
 * @param functionList list of functions seperated by comma
 * @return the correct filter for use when calling the list api
 */
export function getApiFilter(functionList?: string) {
  const baseFilter =
    'resource.type="cloud_function" OR ' +
    '(resource.type="cloud_run_revision" AND ' +
    'labels."goog-managed-by"="cloudfunctions")';

  if (functionList) {
    const apiFuncFilters = functionList.split(",").map((fn) => {
      return `resource.labels.function_name="${fn}" ` + `OR resource.labels.service_name="${fn}"`;
    });
    return baseFilter + `\n(${apiFuncFilters.join(" OR ")})`;
  }

  return baseFilter;
}

/**
 * Logs all entires with info severity to the CLI
 * @param entries a list of {@link LogEntry}
 */
export function logEntries(entries: LogEntry[]): void {
  if (!entries || entries.length === 0) {
    logger.info("No log entries found.");
    return;
  }
  for (let i = entries.length - 1; i >= 0; i--) {
    const entry = entries[i];
    const timestamp = entry.timestamp || "---";
    const severity = (entry.severity || "?").substring(0, 1);
    const name = entry.resource.labels.function_name || entry.resource.labels.service_name;
    const message =
      entry.textPayload ||
      JSON.stringify(entry.jsonPayload) ||
      JSON.stringify(entry.protoPayload) ||
      "";

    logger.info(`${timestamp} ${severity} ${name}: ${message}`);
  }
}
