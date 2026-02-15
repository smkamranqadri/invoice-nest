export type WorkspaceTimeZoneFallbackReason =
  | "missing"
  | "invalid"
  | "workspace_not_found";

export interface WorkspaceTimeZoneFallbackLogPayload {
  event: "workspace_timezone_fallback";
  organizationId: string;
  reason: WorkspaceTimeZoneFallbackReason;
  rawTimeZone: string | null;
  fallbackTimeZone: "UTC";
}

export interface WorkspaceTimeZoneSnapshot {
  metadata: unknown;
  settings: {
    timeZone: string | null;
  };
}

type WarningLogger = (
  message: string,
  payload: WorkspaceTimeZoneFallbackLogPayload,
) => void;

function parseMetadataObject(
  metadata: unknown,
): Record<string, unknown> | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return parseMetadataObject(JSON.parse(metadata));
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }

  return null;
}

function extractRawTimeZone(metadata: unknown): string | null {
  const metadataObject = parseMetadataObject(metadata);
  if (!metadataObject) {
    return null;
  }

  const candidate =
    typeof metadataObject.timezone === "string"
      ? metadataObject.timezone
      : typeof metadataObject.timeZone === "string"
        ? metadataObject.timeZone
        : null;

  if (!candidate) {
    return null;
  }

  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function classifyWorkspaceTimeZoneFallback(
  workspace: WorkspaceTimeZoneSnapshot | null,
): {
  fallbackReason: WorkspaceTimeZoneFallbackReason;
  rawTimeZone: string | null;
} | null {
  if (!workspace) {
    return {
      fallbackReason: "workspace_not_found",
      rawTimeZone: null,
    };
  }

  if (workspace.settings.timeZone) {
    return null;
  }

  const rawTimeZone = extractRawTimeZone(workspace.metadata);
  if (!rawTimeZone) {
    return {
      fallbackReason: "missing",
      rawTimeZone: null,
    };
  }

  return {
    fallbackReason: "invalid",
    rawTimeZone,
  };
}

export function resolveWorkspaceTimeZone(
  organizationId: string,
  workspace: WorkspaceTimeZoneSnapshot | null,
  warningLogger: WarningLogger = console.warn,
): string {
  const fallback = classifyWorkspaceTimeZoneFallback(workspace);
  if (!fallback) {
    return workspace!.settings.timeZone!;
  }

  const payload: WorkspaceTimeZoneFallbackLogPayload = {
    event: "workspace_timezone_fallback",
    organizationId,
    reason: fallback.fallbackReason,
    rawTimeZone: fallback.rawTimeZone,
    fallbackTimeZone: "UTC",
  };

  warningLogger("Workspace timezone fallback to UTC", payload);
  return "UTC";
}
