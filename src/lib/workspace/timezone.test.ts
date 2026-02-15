import { describe, expect, it, vi } from "vitest";

import {
  classifyWorkspaceTimeZoneFallback,
  resolveWorkspaceTimeZone,
} from "@/lib/workspace/timezone";

describe("classifyWorkspaceTimeZoneFallback", () => {
  it("classifies workspace_not_found when workspace lookup fails", () => {
    expect(classifyWorkspaceTimeZoneFallback(null)).toEqual({
      fallbackReason: "workspace_not_found",
      rawTimeZone: null,
    });
  });

  it("classifies missing when timezone is not configured", () => {
    const workspace = {
      metadata: { address: "HQ" },
      settings: { timeZone: null },
    };

    expect(classifyWorkspaceTimeZoneFallback(workspace)).toEqual({
      fallbackReason: "missing",
      rawTimeZone: null,
    });
  });

  it("classifies invalid when raw timezone is present but invalid", () => {
    const workspace = {
      metadata: { timezone: "Mars/Olympus" },
      settings: { timeZone: null },
    };

    expect(classifyWorkspaceTimeZoneFallback(workspace)).toEqual({
      fallbackReason: "invalid",
      rawTimeZone: "Mars/Olympus",
    });
  });
});

describe("resolveWorkspaceTimeZone", () => {
  it("returns configured timezone and emits no warning when valid", () => {
    const warningLogger = vi.fn();
    const workspace = {
      metadata: { timezone: "America/New_York" },
      settings: { timeZone: "America/New_York" },
    };

    const result = resolveWorkspaceTimeZone("org_123", workspace, warningLogger);

    expect(result).toBe("America/New_York");
    expect(warningLogger).not.toHaveBeenCalled();
  });

  it("emits structured warning payload for UTC fallback", () => {
    const warningLogger = vi.fn();
    const workspace = {
      metadata: { timezone: "Mars/Olympus" },
      settings: { timeZone: null },
    };

    const result = resolveWorkspaceTimeZone("org_123", workspace, warningLogger);

    expect(result).toBe("UTC");
    expect(warningLogger).toHaveBeenCalledWith(
      "Workspace timezone fallback to UTC",
      {
        event: "workspace_timezone_fallback",
        organizationId: "org_123",
        reason: "invalid",
        rawTimeZone: "Mars/Olympus",
        fallbackTimeZone: "UTC",
      },
    );
  });
});
