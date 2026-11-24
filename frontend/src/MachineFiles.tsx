import { useRef, useState } from "react";
import { kinds } from "./model";
import { downloadFile, FILE_LIMIT, validateMachineFile } from "./machineFile";
import type { MachineFile } from "./machineFile";

export default function MachineFiles({
  file,
  valid,
  onImport,
}: {
  file: () => MachineFile;
  valid: boolean;
  onImport: (next: MachineFile, name: string) => boolean;
}) {
  const [preview, setPreview] = useState<{
    data: MachineFile;
    name: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const picker = useRef<HTMLInputElement>(null);

  async function read(selected: File) {
    setError("");
    setPreview(null);
    setPending(true);
    try {
      if (selected.size > FILE_LIMIT)
        throw new Error("Machine files must be 512 KiB or smaller.");
      let value: unknown;
      try {
        value = JSON.parse(await selected.text());
      } catch {
        throw new Error("The selected file does not contain valid JSON.");
      }
      setPreview({
        data: await validateMachineFile(value),
        name: selected.name,
      });
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setPending(false);
    }
  }

  function exportMachine() {
    setError("");
    const blob = new Blob([JSON.stringify(file())], {
      type: "application/json",
    });
    if (blob.size > FILE_LIMIT) {
      setError(
        "This machine file exceeds 512 KiB. Reduce the machine before downloading.",
      );
      return;
    }
    downloadFile(blob, "transivium-machine.json");
  }

  return (
    <section
      className="panel reuse-panel"
      aria-labelledby="machine-files-heading"
    >
      <div className="panel-heading">
        <div>
          <h2 id="machine-files-heading">Machine files</h2>
          <p>
            Reuse a machine with version 1 JSON. Validate your draft before
            downloading.
          </p>
        </div>
      </div>
      <div className="reuse-body">
        <div className="reuse-actions">
          <input
            ref={picker}
            hidden
            type="file"
            accept=".json,application/json"
            aria-label="Machine JSON file"
            onChange={(event) => {
              const selected = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              if (selected) void read(selected);
            }}
          />
          <button disabled={pending} onClick={() => picker.current?.click()}>
            {pending ? "Checking file…" : "Choose machine JSON"}
          </button>
          <button disabled={!valid} onClick={exportMachine}>
            Download machine JSON
          </button>
        </div>
        {pending && <p role="status">Validating the selected machine.</p>}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {preview && (
          <div className="reuse-preview">
            <p>
              <strong>{preview.name}</strong> ·{" "}
              {kinds[preview.data.machine.kind]} ·{" "}
              {preview.data.machine.states.length} states
            </p>
            <div className="reuse-actions">
              <button
                className="primary"
                onClick={() => {
                  if (onImport(preview.data, preview.name)) setPreview(null);
                }}
              >
                Replace draft with file
              </button>
              <button onClick={() => setPreview(null)}>Cancel import</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
