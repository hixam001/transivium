import { api } from "./api";
import type { Issue, Machine } from "./model";

export type Point = { x: number; y: number };
export type Layout = Record<string, Point>;
export type MachineFile = {
  schemaVersion: 1;
  machine: Machine;
  layout?: Layout;
};

export const FILE_LIMIT = 512 * 1024;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export async function validateMachineFile(
  value: unknown,
): Promise<MachineFile> {
  if (!object(value) || !Object.hasOwn(value, "machine")) {
    throw new Error("Choose a Transivium machine file.");
  }
  if (value.schemaVersion !== 1) {
    throw new Error("This machine file version is unsupported. Use version 1.");
  }
  if (
    Object.keys(value).some(
      (key) => !["schemaVersion", "machine", "layout"].includes(key),
    )
  ) {
    throw new Error("The machine file contains unknown fields.");
  }
  const verdict = await api<{ valid: boolean; issues: Issue[] }>("validate", {
    machine: value.machine,
  });
  if (!verdict.valid)
    throw new Error(verdict.issues[0]?.message ?? "The machine is invalid.");
  const machine = value.machine as Machine;
  const layout = value.layout;
  if (layout !== undefined) {
    const ids = new Set(machine.states.map((state) => state.id));
    if (
      !object(layout) ||
      Object.entries(layout).some(
        ([id, point]) =>
          !ids.has(id) ||
          !object(point) ||
          Object.keys(point).length !== 2 ||
          typeof point.x !== "number" ||
          typeof point.y !== "number" ||
          !Number.isFinite(point.x) ||
          !Number.isFinite(point.y) ||
          Math.abs(point.x) > 1_000_000 ||
          Math.abs(point.y) > 1_000_000,
      )
    )
      throw new Error(
        "Layout must use known state IDs and finite coordinates within ±1,000,000.",
      );
  }
  return {
    schemaVersion: 1,
    machine,
    ...(layout === undefined ? {} : { layout: layout as Layout }),
  };
}

export function machineFile(machine: Machine, layout: Layout): MachineFile {
  const positions = Object.fromEntries(
    machine.states.flatMap(({ id }) =>
      Object.hasOwn(layout, id) ? [[id, layout[id]]] : [],
    ),
  );
  return {
    schemaVersion: 1,
    machine,
    ...(Object.keys(positions).length ? { layout: positions } : {}),
  };
}

export function downloadFile(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
