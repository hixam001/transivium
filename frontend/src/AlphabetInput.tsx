import { useState } from "react";

export default function AlphabetInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string[];
  onChange: (values: string[]) => void;
  label: string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  return (
    <input
      aria-label={label}
      placeholder={placeholder}
      value={focused ? text : value.join(", ")}
      onFocus={(e) => {
        setText(e.currentTarget.value);
        setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        onChange(next === "" ? [] : next.split(",").map((s) => s.trim()));
      }}
    />
  );
}
