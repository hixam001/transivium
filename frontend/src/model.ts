export type Kind = "dfa" | "nfa" | "enfa" | "mealy" | "moore";
export type State = { id: string; label?: string; output?: string };
export type Transition = {
  from: string;
  to: string;
  symbol: string | null;
  output?: string;
};
export type Machine = {
  kind: Kind;
  alphabet: string[];
  states: State[];
  startState: string;
  transitions: Transition[];
  finalStates?: string[];
  outputAlphabet?: string[];
};
export type Issue = { code: string; path: string; message: string };
export const kinds: Record<Kind, string> = {
  dfa: "DFA",
  nfa: "NFA",
  enfa: "ε-NFA",
  mealy: "Mealy",
  moore: "Moore",
};
export const isAcceptor = (m: Machine) =>
  ["dfa", "nfa", "enfa"].includes(m.kind);
export const isNondeterministic = (m: Machine) =>
  m.kind === "nfa" || m.kind === "enfa";
export function blank(kind: Kind): Machine {
  return {
    kind,
    alphabet: ["0", "1"],
    states: [{ id: "q0", ...(kind === "moore" ? { output: "0" } : {}) }],
    startState: "q0",
    transitions: [],
    ...(["dfa", "nfa", "enfa"].includes(kind)
      ? { finalStates: [] }
      : { outputAlphabet: ["0", "1"] }),
  };
}
export function removeState(machine: Machine, id: string): Machine {
  return {
    ...machine,
    states: machine.states.filter((s) => s.id !== id),
    startState: machine.startState === id ? "" : machine.startState,
    ...(isAcceptor(machine)
      ? { finalStates: machine.finalStates?.filter((s) => s !== id) }
      : {}),
    transitions: machine.transitions.filter(
      (t) => t.from !== id && t.to !== id,
    ),
  };
}
export const examples = Object.entries(
  import.meta.glob("../../contracts/fixtures/*.json", {
    eager: true,
    import: "default",
  }),
).map(([path, data]) => ({
  id: path.split("/").pop()!.replace(".json", ""),
  ...(data as { machine: Machine }),
}));
export const exampleNames: Record<string, string> = {
  D01: "Ends in 01",
  D02: "Redundant DFA",
  D03: "All binary strings",
  D04: "Empty language",
  D05: "Only empty input",
  D06: "Zero or more zeros",
  N01: "Branching NFA",
  E01: "Epsilon cycle",
  M01: "Bit inverter",
  O01: "State outputs",
};
