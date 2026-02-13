import { isValidTimeZone } from "@/lib/domain/date";

export const WORKSPACE_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
] as const;

export type WorkspaceCurrency = (typeof WORKSPACE_CURRENCIES)[number];

export interface WorkspaceTaxPreset {
  id: string;
  name: string;
  rate: number;
  isDefault: boolean;
}

export interface ParsedWorkspaceSettingsMetadata {
  address: string;
  phone: string;
  currency: WorkspaceCurrency;
  taxPresets: WorkspaceTaxPreset[];
  timeZone: string | null;
  extras: Record<string, unknown>;
}

export interface WorkspaceSettingsMetadataInput {
  address?: string;
  phone?: string;
  currency?: string | null;
  taxPresets?: WorkspaceTaxPreset[];
  timeZone?: string | null;
  extras?: Record<string, unknown>;
}

export const DEFAULT_WORKSPACE_CURRENCY: WorkspaceCurrency = "USD";

const MANAGED_METADATA_KEYS = new Set([
  "address",
  "phone",
  "currency",
  "taxPresets",
  "timezone",
  "timeZone",
]);

function parseMetadataObject(
  metadata: unknown,
): Record<string, unknown> | null {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      const parsed = JSON.parse(metadata);
      return parseMetadataObject(parsed);
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    return metadata as Record<string, unknown>;
  }

  return null;
}

function normalizeTimeZone(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!isValidTimeZone(trimmed)) {
    return null;
  }

  return trimmed;
}

export function normalizeWorkspaceCurrency(
  value: unknown,
): WorkspaceCurrency {
  if (typeof value !== "string") {
    return DEFAULT_WORKSPACE_CURRENCY;
  }

  const upper = value.trim().toUpperCase();
  if ((WORKSPACE_CURRENCIES as readonly string[]).includes(upper)) {
    return upper as WorkspaceCurrency;
  }

  return DEFAULT_WORKSPACE_CURRENCY;
}

function normalizeRate(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (parsed < 0 || parsed > 100) {
    return null;
  }

  const rounded = Math.round(parsed * 100) / 100;
  if (Math.abs(rounded - parsed) > 1e-8) {
    return null;
  }

  return rounded;
}

function normalizePresetId(value: unknown, fallbackIndex: number): string {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return `preset-${fallbackIndex + 1}`;
}

export function normalizeWorkspaceTaxPresets(
  value: unknown,
): WorkspaceTaxPreset[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const presets: WorkspaceTaxPreset[] = [];
  const usedIds = new Set<string>();

  for (let index = 0; index < value.length; index += 1) {
    const rawPreset = value[index];
    if (!rawPreset || typeof rawPreset !== "object") {
      continue;
    }

    const record = rawPreset as Record<string, unknown>;
    const name =
      typeof record.name === "string" ? record.name.trim() : "";
    if (!name) {
      continue;
    }

    const rate = normalizeRate(record.rate);
    if (rate === null) {
      continue;
    }

    let id = normalizePresetId(record.id, index);
    if (usedIds.has(id)) {
      let suffix = 2;
      while (usedIds.has(`${id}-${suffix}`)) {
        suffix += 1;
      }
      id = `${id}-${suffix}`;
    }

    usedIds.add(id);
    presets.push({
      id,
      name,
      rate,
      isDefault: Boolean(record.isDefault),
    });
  }

  const defaultIndex = presets.findIndex((preset) => preset.isDefault);
  if (defaultIndex >= 0) {
    return presets.map((preset, index) => ({
      ...preset,
      isDefault: index === defaultIndex,
    }));
  }

  return presets;
}

export function parseWorkspaceSettingsMetadata(
  metadata: unknown,
): ParsedWorkspaceSettingsMetadata {
  const metadataObject = parseMetadataObject(metadata) ?? {};

  const timeZone =
    normalizeTimeZone(metadataObject.timezone) ??
    normalizeTimeZone(metadataObject.timeZone);

  const extras = Object.fromEntries(
    Object.entries(metadataObject).filter(
      ([key]) => !MANAGED_METADATA_KEYS.has(key),
    ),
  );

  return {
    address:
      typeof metadataObject.address === "string"
        ? metadataObject.address.trim()
        : "",
    phone:
      typeof metadataObject.phone === "string"
        ? metadataObject.phone.trim()
        : "",
    currency: normalizeWorkspaceCurrency(metadataObject.currency),
    taxPresets: normalizeWorkspaceTaxPresets(metadataObject.taxPresets),
    timeZone,
    extras,
  };
}

export function serializeWorkspaceSettingsMetadata(
  input: WorkspaceSettingsMetadataInput,
): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  if (input.extras && typeof input.extras === "object") {
    for (const [key, value] of Object.entries(input.extras)) {
      if (!MANAGED_METADATA_KEYS.has(key)) {
        metadata[key] = value;
      }
    }
  }

  metadata.address = (input.address ?? "").trim();
  metadata.phone = (input.phone ?? "").trim();
  metadata.currency = normalizeWorkspaceCurrency(input.currency);

  const normalizedPresets = normalizeWorkspaceTaxPresets(input.taxPresets ?? []);
  metadata.taxPresets = normalizedPresets.map((preset) => ({
    id: preset.id,
    name: preset.name,
    rate: preset.rate,
    isDefault: preset.isDefault,
  }));

  const timeZone = normalizeTimeZone(input.timeZone);
  if (timeZone) {
    metadata.timezone = timeZone;
  }

  return metadata;
}
