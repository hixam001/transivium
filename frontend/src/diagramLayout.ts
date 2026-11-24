import type { Layout } from "./machineFile";
import type { Machine } from "./model";

export type Preset = "grid" | "row" | "circle";

export function presetLayout(machine: Machine, mode: Preset): Layout {
  const radius = Math.max(130, (machine.states.length * 155) / (2 * Math.PI));
  return Object.fromEntries(
    machine.states.map(({ id }, index) => {
      const angle = (index * 2 * Math.PI) / machine.states.length - Math.PI / 2;
      const point =
        mode === "circle" && machine.states.length > 1
          ? {
              x: radius + Math.cos(angle) * radius,
              y: radius + Math.sin(angle) * radius,
            }
          : mode === "row"
            ? { x: 90 + index * 190, y: 150 }
            : defaultPosition(index);
      return [id, point];
    }),
  );
}

export function defaultPosition(index: number) {
  return { x: 90 + (index % 4) * 190, y: 150 + Math.floor(index / 4) * 170 };
}

export function groupTransitions(machine: Machine) {
  const groups = new Map<
    string,
    { source: string; target: string; labels: string[] }
  >();
  for (const edge of machine.transitions) {
    const key = JSON.stringify([edge.from, edge.to]);
    const group = groups.get(key) ?? {
      source: edge.from,
      target: edge.to,
      labels: [],
    };
    group.labels.push(
      `${edge.symbol ?? "ε"}${edge.output === undefined ? "" : ` / ${edge.output}`}`,
    );
    groups.set(key, group);
  }
  return groups;
}
