import type { Layout } from "./machineFile";
import { useEffect, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  MarkerType,
  BaseEdge,
  getBezierPath,
  EdgeLabelRenderer,
} from "@xyflow/react";
import type { Connection, NodeProps, EdgeProps } from "@xyflow/react";
import { ArrowRight } from "lucide-react";
import type { Machine, Transition } from "./model";
import "@xyflow/react/dist/style.css";

function MachineNode({ data }: NodeProps) {
  return (
    <div
      className={`machine-node ${data.final ? "final" : ""} ${data.active ? "active" : ""}`}
    >
      {data.start ? (
        <ArrowRight
          className="start-arrow"
          size={23}
          aria-label="Start state"
        />
      ) : null}
      <Handle type="target" position={Position.Left} />
      <span>{String(data.label)}</span>
      {data.output !== undefined ? (
        <small>out {String(data.output)}</small>
      ) : null}
      <Handle type="source" position={Position.Right} />
    </div>
  );
}
function MachineEdge(props: EdgeProps) {
  const {
    id,
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition,
    targetPosition,
    markerEnd,
  } = props;
  const loop = props.source === props.target;
  const [path, x, y] = loop
    ? [
        `M ${sx - 12} ${sy - 23} C ${sx + 42} ${sy - 110}, ${sx - 105} ${sy - 110}, ${sx - 52} ${sy - 23}`,
        sx - 24,
        sy - 85,
      ]
    : sx > tx
      ? [
          `M ${sx} ${sy} C ${sx + 40} ${sy + 110}, ${tx - 40} ${ty + 110}, ${tx} ${ty}`,
          (sx + tx) / 2,
          (sy + ty) / 2 + 82,
        ]
      : getBezierPath({
          sourceX: sx,
          sourceY: sy,
          targetX: tx,
          targetY: ty,
          sourcePosition,
          targetPosition,
          curvature: 0.3,
        });
  return (
    <>
      <BaseEdge
        id={id}
        path={String(path)}
        markerEnd={markerEnd}
        style={{
          stroke: props.data?.active ? "#245cd6" : "#8292ac",
          strokeWidth: props.data?.active ? 3 : 1.8,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="edge-label nodrag nopan"
          style={{
            transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
          }}
        >
          {String(props.label)}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
const nodeTypes = { machine: MachineNode };
const edgeTypes = { machine: MachineEdge };
const fitOptions = { padding: { top: 100, bottom: 105, x: 55 }, maxZoom: 1.2 };
export default function Graph({
  machine,
  select,
  connect,
  activeStates = [],
  activeTransitions = [],
  readOnly = false,
  label = "Machine graph",
  positions = {},
  onPositions,
}: {
  machine: Machine;
  select: (id: string) => void;
  connect: (c: Connection) => void;
  activeStates?: string[];
  activeTransitions?: Transition[];
  readOnly?: boolean;
  label?: string;
  positions?: Layout;
  onPositions?: (positions: Layout) => void;
}) {
  const viewOptions = readOnly
    ? { padding: { top: 60, bottom: 60, x: 35 }, maxZoom: 1 }
    : fitOptions;
  const flow = useRef<(() => void) | null>(null);
  useEffect(() => {
    const refit = () => {
      flow.current?.();
    };
    const frame = requestAnimationFrame(refit);
    window.addEventListener("resize", refit);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", refit);
    };
  }, [machine.states.length, machine.kind]);
  const nodes = machine.states.map((s, i) => ({
    id: s.id,
    ariaLabel: `State ${s.label || s.id}${s.id === machine.startState ? ", start" : ""}${machine.finalStates?.includes(s.id) ? ", accepting" : ""}${s.output !== undefined ? `, output ${s.output}` : ""}${activeStates.includes(s.id) ? ", active" : ""}`,
    type: "machine",
    position: Object.hasOwn(positions, s.id)
      ? positions[s.id]
      : {
          x: 90 + (i % 4) * 190,
          y: 150 + Math.floor(i / 4) * 170,
        },
    data: {
      label: s.label || s.id,
      output: s.output,
      start: s.id === machine.startState,
      final: machine.finalStates?.includes(s.id),
      active: activeStates.includes(s.id),
    },
  }));
  const edges = useMemo(() => {
    const groups = new Map<
      string,
      { source: string; target: string; labels: string[] }
    >();
    machine.transitions.forEach((t) => {
      const key = JSON.stringify([t.from, t.to]);
      const group = groups.get(key) ?? {
        source: t.from,
        target: t.to,
        labels: [],
      };
      group.labels.push(
        `${t.symbol ?? "ε"}${t.output !== undefined ? ` / ${t.output}` : ""}`,
      );
      groups.set(key, group);
    });
    return [...groups.entries()].map(([id, e]) => ({
      id,
      source: e.source,
      target: e.target,
      label: e.labels.join(", "),
      type: "machine",
      data: {
        active: activeTransitions.some(
          (t) => t.from === e.source && t.to === e.target,
        ),
      },
      markerEnd: { type: MarkerType.ArrowClosed, color: "#8292ac" },
    }));
  }, [machine.transitions, activeTransitions]);
  return (
    <div className="graph" role="region" aria-label={label}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={(_, n) => select(n.id)}
        onConnect={connect}
        onInit={(instance) => {
          flow.current = () => {
            void instance.fitView(viewOptions);
          };
        }}
        onNodesChange={(changes) => {
          const moved = changes
            .getByType("position")
            .flatMap((change) =>
              change.type === "position" && change.position
                ? [[change.id, change.position]]
                : [],
            );
          if (moved.length) onPositions?.(Object.fromEntries(moved));
        }}
        fitView
        fitViewOptions={viewOptions}
        minZoom={0.2}
        maxZoom={2}
        deleteKeyCode={null}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
      >
        <Background color="#d8e0ec" gap={22} size={1.2} />
        <Controls showInteractive={false} fitViewOptions={viewOptions} />
      </ReactFlow>
      {!readOnly && (
        <span className="canvas-hint">
          Drag states to arrange · connect handles to add an edge
        </span>
      )}
    </div>
  );
}
