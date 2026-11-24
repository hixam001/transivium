import { defaultPosition, groupTransitions } from "./diagramLayout";
import type { Layout } from "./machineFile";
import type { Machine } from "./model";

const namespace = "http://www.w3.org/2000/svg";

export function diagramSvg(machine: Machine, layout: Layout, title: string) {
  const add = (
    parent: Element | null,
    tag: string,
    attributes: Record<string, string | number>,
    text?: string,
  ) => {
    const node = document.createElementNS(namespace, tag);
    for (const [key, value] of Object.entries(attributes))
      node.setAttribute(key, String(value));
    if (text !== undefined) node.textContent = text;
    parent?.append(node);
    return node;
  };
  const positions = new Map(
    machine.states.map(({ id }, index) => [
      id,
      Object.hasOwn(layout, id) ? layout[id] : defaultPosition(index),
    ]),
  );
  const points = [...positions.values()];
  if (!points.length)
    throw new Error("Add a state before downloading a diagram.");
  const x = Math.min(...points.map((point) => point.x)) - 135;
  const y = Math.min(...points.map((point) => point.y)) - 105;
  const width = Math.max(...points.map((point) => point.x)) - x + 210;
  const height = Math.max(...points.map((point) => point.y)) - y + 180;
  const scale = Math.min(2, 4096 / Math.max(width, height));
  const pixelWidth = Math.max(1, Math.floor(width * scale));
  const pixelHeight = Math.max(1, Math.floor(height * scale));
  const svg = add(null, "svg", {
    viewBox: `${x} ${y} ${width} ${height}`,
    width: pixelWidth,
    height: pixelHeight,
    role: "img",
    "aria-labelledby": "diagram-title",
    "font-family": "system-ui, sans-serif",
  });
  add(svg, "title", { id: "diagram-title" }, title);
  add(svg, "rect", { x, y, width, height, fill: "#f7faff" });
  const marker = add(add(svg, "defs", {}), "marker", {
    id: "arrow",
    viewBox: "0 0 10 10",
    refX: 9,
    refY: 5,
    markerWidth: 6,
    markerHeight: 6,
    orient: "auto-start-reverse",
  });
  add(marker, "path", { d: "M 0 0 L 10 5 L 0 10 Z", fill: "#526989" });

  const arrows = add(svg, "g", {
    fill: "none",
    stroke: "#526989",
    "stroke-width": 2,
  });
  const labels = add(svg, "g", {
    fill: "#173050",
    "font-size": 12,
    "text-anchor": "middle",
  });
  for (const { source, target, labels: symbols } of groupTransitions(
    machine,
  ).values()) {
    const from = positions.get(source);
    const to = positions.get(target);
    if (!from || !to) continue;
    const sx = from.x + 84,
      sy = from.y + 22,
      tx = to.x,
      ty = to.y + 22;
    const loop = source === target;
    const bend = sx > tx ? 105 : 0;
    const d = loop
      ? `M ${sx - 12} ${sy - 18} C ${sx + 25} ${sy - 94}, ${sx - 103} ${sy - 94}, ${sx - 65} ${sy - 18}`
      : `M ${sx} ${sy} C ${sx + 42} ${sy + bend}, ${tx - 42} ${ty + bend}, ${tx} ${ty}`;
    add(arrows, "path", { d, "marker-end": "url(#arrow)" });
    const label = symbols.join(", ");
    add(
      labels,
      "text",
      {
        x: loop ? from.x + 42 : (sx + tx) / 2,
        y: loop ? sy - 79 : (sy + ty) / 2 + bend * 0.75 - 7,
        stroke: "#f7faff",
        "stroke-width": 4,
        "paint-order": "stroke",
      },
      label,
    );
  }

  for (const state of machine.states) {
    const point = positions.get(state.id)!;
    const group = add(svg, "g", {
      transform: `translate(${point.x},${point.y})`,
    });
    if (state.id === machine.startState) {
      add(group, "path", {
        d: "M -28 22 H -3",
        fill: "none",
        stroke: "#526989",
        "stroke-width": 2,
        "marker-end": "url(#arrow)",
      });
    }
    add(group, "rect", {
      width: 84,
      height: 44,
      rx: 16,
      fill: "#fff",
      stroke: "#245cd6",
      "stroke-width": 2,
    });
    if (machine.finalStates?.includes(state.id)) {
      add(group, "rect", {
        x: 4,
        y: 4,
        width: 76,
        height: 36,
        rx: 12,
        fill: "none",
        stroke: "#245cd6",
      });
    }
    const label = state.label || state.id;
    const displayed =
      [...label].length > 26 ? [...label].slice(0, 25).join("") + "…" : label;
    add(group, "title", {}, label);
    add(
      group,
      "text",
      {
        x: 42,
        y: state.output === undefined ? 27 : 19,
        "text-anchor": "middle",
        fill: "#173050",
        "font-size": 13,
        ...(displayed.length > 10
          ? { textLength: 67, lengthAdjust: "spacingAndGlyphs" }
          : {}),
      },
      displayed,
    );
    if (state.output !== undefined)
      add(
        group,
        "text",
        {
          x: 42,
          y: 34,
          "text-anchor": "middle",
          fill: "#526989",
          "font-size": 11,
        },
        `out ${state.output}`,
      );
  }
  return {
    blob: new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    }),
    pixelWidth,
    pixelHeight,
  };
}

export async function diagramPng({
  blob,
  pixelWidth,
  pixelHeight,
}: ReturnType<typeof diagramSvg>) {
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
    const context = canvas.getContext("2d");
    if (!context)
      throw new Error(
        "This browser could not render the PNG. Download SVG instead.",
      );
    context.drawImage(image, 0, 0);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) =>
          result
            ? resolve(result)
            : reject(
                new Error("Could not create a PNG. Download SVG instead."),
              ),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
