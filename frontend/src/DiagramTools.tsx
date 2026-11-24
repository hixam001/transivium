import { useState } from "react";
import type { Preset } from "./diagramLayout";
import { downloadFile } from "./machineFile";
import type { Layout } from "./machineFile";
import type { Machine } from "./model";

export default function DiagramTools({
  machine,
  layout,
  title,
  onPreset,
}: {
  machine: Machine;
  layout: Layout;
  title: string;
  onPreset: (preset: Preset) => void;
}) {
  const [preset, setPreset] = useState<Preset>("grid");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function download(format: "svg" | "png") {
    setPending(true);
    setError("");
    try {
      const { diagramSvg, diagramPng } = await import("./diagramImage");
      const image = diagramSvg(machine, layout, title);
      downloadFile(
        format === "png" ? await diagramPng(image) : image.blob,
        `transivium-diagram.${format}`,
      );
    } catch {
      setError(
        "The diagram could not be downloaded. Try SVG or a smaller layout.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="diagram-tools">
      <div className="reuse-actions">
        <label className="inline-field">
          Layout preset
          <select
            aria-label="Layout preset"
            value={preset}
            onChange={(event) => setPreset(event.target.value as Preset)}
          >
            <option value="grid">Grid</option>
            <option value="row">Row</option>
            <option value="circle">Circle</option>
          </select>
        </label>
        <button
          onClick={() => onPreset(preset)}
          disabled={!machine.states.length}
        >
          Apply layout
        </button>
        <button
          onClick={() => void download("svg")}
          disabled={!machine.states.length || pending}
        >
          Download SVG
        </button>
        <button
          onClick={() => void download("png")}
          disabled={!machine.states.length || pending}
        >
          Download PNG
        </button>
      </div>
      {pending && <p role="status">Preparing diagram download.</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
