import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import type Graph from "./Graph";
import LoadBoundary from "./LoadBoundary";

const LazyGraph = lazy(() => import("./Graph"));

export default function Diagram(props: ComponentProps<typeof Graph>) {
  return (
    <LoadBoundary
      fallback={
        <div className="graph graph-unavailable" role="alert">
          The diagram could not load. Continue editing in the transition table;
          your draft is safe.
        </div>
      }
    >
      <Suspense
        fallback={
          <div className="graph" role="status">
            Loading machine diagram…
          </div>
        }
      >
        <LazyGraph {...props} />
      </Suspense>
    </LoadBoundary>
  );
}
