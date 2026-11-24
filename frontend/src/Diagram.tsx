import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type Graph from "./Graph";

const LazyGraph = lazy(() => import("./Graph"));

export default function Diagram(props: ComponentProps<typeof Graph>) {
  return (
    <Suspense
      fallback={
        <div className="graph" role="status">
          Loading machine diagram…
        </div>
      }
    >
      <LazyGraph {...props} />
    </Suspense>
  );
}
