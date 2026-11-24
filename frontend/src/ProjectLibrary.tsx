import { useEffect, useState } from "react";
import { FILE_LIMIT, validateMachineFile } from "./machineFile";
import type { MachineFile } from "./machineFile";
import { exampleNames, examples, kinds } from "./model";
import type { Machine } from "./model";

const storageKey = "transivium.projects.v1";
const projectLimit = 12;
const storageLimit = 2 * 1024 * 1024;
type Project = { name: string; file: MachineFile };

const library: { name: string; note: string; machine: Machine }[] = [
  ...examples
    .filter(({ id }) => ["D02", "D03", "D04", "D05", "D06"].includes(id))
    .map(({ id, machine }) => ({
      name: exampleNames[id],
      machine,
      note: (
        {
          D02: "Minimize a DFA with both an unreachable state and a reachable duplicate.",
          D03: "Export a regex for the full binary language.",
          D04: "Compare with the universal DFA to find an empty witness.",
          D05: "Trace the difference between accepting ε and accepting a symbol.",
          D06: "Export a regex and check why the alphabet still includes 1.",
        } as Record<string, string>
      )[id],
    })),
  {
    name: "Even number of ones",
    note: "Try 101 and 111. Track how a 1 changes parity while a 0 preserves it.",
    machine: {
      kind: "dfa",
      alphabet: ["0", "1"],
      startState: "even",
      finalStates: ["even"],
      states: [
        { id: "even", label: "Even" },
        { id: "odd", label: "Odd" },
      ],
      transitions: [
        { from: "even", symbol: "0", to: "even" },
        { from: "even", symbol: "1", to: "odd" },
        { from: "odd", symbol: "0", to: "odd" },
        { from: "odd", symbol: "1", to: "even" },
      ],
    },
  },
  {
    name: "Running parity output",
    note: "Run 1011 and compare the output with a Moore conversion.",
    machine: {
      kind: "mealy",
      alphabet: ["0", "1"],
      outputAlphabet: ["0", "1"],
      startState: "even",
      states: [
        { id: "even", label: "Even" },
        { id: "odd", label: "Odd" },
      ],
      transitions: [
        { from: "even", symbol: "0", to: "even", output: "0" },
        { from: "even", symbol: "1", to: "odd", output: "1" },
        { from: "odd", symbol: "0", to: "odd", output: "1" },
        { from: "odd", symbol: "1", to: "even", output: "0" },
      ],
    },
  },
];

function read(): Project[] {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return [];
  if (raw.length > storageLimit)
    throw new Error("Saved project storage exceeds its size limit.");
  const stored: unknown = JSON.parse(raw);
  if (
    !Array.isArray(stored) ||
    stored.length > projectLimit ||
    stored.some(
      (item) =>
        !item ||
        typeof item.name !== "string" ||
        item.name.length > 80 ||
        !item.file ||
        typeof item.file !== "object",
    ) ||
    new Set(stored.map((item) => item.name)).size !== stored.length
  ) {
    throw new Error("Saved project storage could not be read.");
  }
  return stored;
}

function write(projects: Project[]) {
  const value = JSON.stringify(projects);
  if (value.length > storageLimit)
    throw new Error(
      "Project storage is full. Download a machine file or delete a saved project.",
    );
  localStorage.setItem(storageKey, value);
}

export default function ProjectLibrary({
  file,
  valid,
  onOpen,
  onSave,
}: {
  file: () => MachineFile;
  valid: boolean;
  onOpen: (file: MachineFile, name: string) => boolean;
  onSave: (name: string) => void;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState("");
  const [exampleIndex, setExampleIndex] = useState(0);
  const [preview, setPreview] = useState<Project | null>(null);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const example = library[exampleIndex];

  useEffect(() => {
    function refresh() {
      try {
        setProjects(read());
      } catch {
        setError(
          "Saved projects could not be read. Machine files are still available.",
        );
      }
    }
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  function save() {
    setError("");
    setMessage("");
    try {
      const current = read();
      const projectName = name.trim();
      if (!projectName) throw new Error("Enter a project name.");
      const previous = current.find((project) => project.name === projectName);
      if (
        previous &&
        !window.confirm(`Replace saved project “${projectName}”?`)
      )
        return;
      if (!previous && current.length >= projectLimit)
        throw new Error(
          "You can keep up to 12 projects. Delete one before saving another.",
        );
      const data = file();
      if (new Blob([JSON.stringify(data)]).size > FILE_LIMIT)
        throw new Error("This project exceeds 512 KiB.");
      const next = [
        { name: projectName, file: data },
        ...current.filter((project) => project.name !== projectName),
      ];
      write(next);
      setProjects(next);
      setSelected(projectName);
      setPreview(null);
      onSave(projectName);
      setMessage(`Saved “${projectName}” in this browser.`);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "Project could not be saved.",
      );
    }
  }

  async function open() {
    setPreview(null);
    setPending(true);
    setError("");
    setMessage("");
    try {
      const project = read().find((item) => item.name === selected);
      if (!project) throw new Error("Choose an available saved project.");
      const data = await validateMachineFile(project.file);
      setPreview({ name: project.name, file: data });
    } catch (problem) {
      setError((problem as Error).message);
    } finally {
      setPending(false);
    }
  }

  function remove() {
    if (!window.confirm(`Delete saved project “${selected}”?`)) return;
    setError("");
    setMessage("");
    try {
      const next = read().filter((project) => project.name !== selected);
      write(next);
      setProjects(next);
      setSelected("");
      setPreview(null);
      setMessage("Saved project deleted.");
    } catch {
      setError("The selected project could not be deleted.");
    }
  }

  return (
    <section className="panel reuse-panel" aria-labelledby="projects-heading">
      <div className="panel-heading">
        <div>
          <h2 id="projects-heading">Projects and examples</h2>
          <p>
            Save validated machines in this browser or load a practice example.
          </p>
        </div>
      </div>
      <div className="reuse-body">
        <form
          className="reuse-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (valid && !pending) save();
          }}
        >
          <label>
            Project name
            <input
              value={name}
              maxLength={80}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button disabled={!valid || pending}>Save project</button>
        </form>
        {projects.length > 0 && (
          <div className="reuse-form">
            <label>
              Saved project
              <select
                aria-label="Saved project"
                value={selected}
                disabled={pending}
                onChange={(event) => {
                  setSelected(event.target.value);
                  setPreview(null);
                }}
              >
                <option value="">Choose a project</option>
                {projects.map((project) => (
                  <option key={project.name}>{project.name}</option>
                ))}
              </select>
            </label>
            <button disabled={!selected || pending} onClick={() => void open()}>
              {pending ? "Checking project…" : "Open project"}
            </button>
            <button disabled={!selected || pending} onClick={remove}>
              Delete project
            </button>
          </div>
        )}
        {preview && (
          <div className="reuse-actions">
            <button
              className="primary"
              onClick={() => {
                if (onOpen(preview.file, preview.name)) {
                  setName(preview.name);
                  setPreview(null);
                }
              }}
            >
              Replace draft with project
            </button>
            <button onClick={() => setPreview(null)}>
              Cancel project open
            </button>
          </div>
        )}
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <div className="reuse-form">
          <label>
            Practice example
            <select
              aria-label="Practice example"
              value={exampleIndex}
              disabled={pending}
              onChange={(event) => setExampleIndex(Number(event.target.value))}
            >
              {library.map((entry, index) => (
                <option key={entry.name} value={index}>
                  {entry.name} · {kinds[entry.machine.kind]}
                </option>
              ))}
            </select>
          </label>
          <button
            disabled={pending}
            onClick={() =>
              onOpen(
                { schemaVersion: 1, machine: example.machine },
                example.name,
              )
            }
          >
            Load practice example
          </button>
        </div>
        <p className="field-hint">{example.note}</p>
      </div>
    </section>
  );
}
