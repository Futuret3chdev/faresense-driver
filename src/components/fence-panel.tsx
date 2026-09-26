import { useMemo } from "react";
import {
  assessDrop,
  fencePresets,
  groups,
  project,
  radiusEllipse,
  resolveFence,
  suburbNamed,
  suburbs,
} from "@/lib/melbourne";
import type { Fence } from "@/lib/melbourne";

export function FencePanel({
  fence,
  dropId,
  onFence,
  onDrop,
  onPrice,
}: {
  fence: Fence;
  dropId: string;
  onFence: (fence: Fence) => void;
  onDrop: (id: string) => void;
  onPrice: () => void;
}) {
  const rows = useMemo(() => resolveFence(fence), [fence]);
  const start = suburbNamed(fence.startId);
  const drop = assessDrop(fence, dropId);
  const inside = rows.filter((row) => row.in);
  const outside = rows.filter((row) => !row.in);
  const offGroups = groups.filter((group) => !fence.groups[group.id]).map((group) => group.name);
  const startPoint = project(start.lat, start.lng);
  const ring = radiusEllipse(fence.radiusKm);
  const tooOpen = inside.length > rows.length * 0.8;

  return (
    <div>
      <section
        className={
          "rounded-card border px-5 py-5 " +
          (tooOpen ? "border-amber bg-amber text-amber-ink" : "border-mint bg-mint text-mint-ink")
        }
      >
        <p className={"text-xs font-semibold tracking-widest uppercase " + (tooOpen ? "text-amber-ink/70" : "text-mint-ink/70")}>
          Melbourne fence
        </p>
        <h2 className="mt-1 font-serif text-4xl leading-none tracking-tight">
          {start.name}
          <span className="text-3xl"> · {fence.radiusKm} km</span>
        </h2>
        <p className={"mt-3 text-sm leading-relaxed " + (tooOpen ? "text-amber-ink/90" : "text-mint-ink/90")}>
          {tooOpen
            ? `${inside.length} suburbs are in. That is the shift Uber already gives you: airport, Werribee, Dandenong, wherever the ping is.`
            : `${inside.length} suburbs stay in. ${outside.length} are a deadhead. ${
                offGroups.length ? `Off: ${offGroups.join(", ")}.` : "Every group is on, so only the radius is holding the line."
              }`}
        </p>
      </section>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Stat label="Inside" value={String(inside.length)} />
        <Stat label="Outside" value={String(outside.length)} />
        <Stat label="Drop" value={drop.in ? "In" : `${drop.backKm.toFixed(0)} km back`} />
        <Stat label="From start" value={`${drop.fromKm.toFixed(0)} km`} />
      </div>

      <section className="mt-3 rounded-card border border-line bg-surface p-3">
        <svg
          viewBox="0 0 100 100"
          role="img"
          aria-label={`${inside.length} Melbourne suburbs inside ${fence.radiusKm} kilometres of ${start.name}`}
          className="h-72 w-full"
        >
          <rect width="100" height="100" rx="4" className="fill-inset" />
          <ellipse
            cx={startPoint.x}
            cy={startPoint.y}
            rx={ring.rx}
            ry={ring.ry}
            className="fill-none stroke-amber"
            strokeWidth="0.6"
            strokeDasharray="1.4 1.1"
          />
          {rows.map((row) => {
            const point = project(row.suburb.lat, row.suburb.lng);
            const isStart = row.suburb.id === start.id;
            const isDrop = row.suburb.id === dropId;
            return (
              <circle
                key={row.suburb.id}
                cx={point.x}
                cy={point.y}
                r={isStart || isDrop ? 1.7 : 1.05}
                className={isDrop ? "fill-amber" : row.in ? "fill-mint" : "fill-line"}
              />
            );
          })}
        </svg>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span>Mint, you will work it</span>
          <span>Dim, refused</span>
          <span>A dim dot inside the ring means that group is off</span>
        </div>
      </section>

      <div className="mt-4 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {fencePresets.map((preset) => {
          const on = sameFence(preset.fence, fence);
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={on}
              onClick={() => onFence(preset.fence)}
              className={
                "w-44 shrink-0 rounded-2xl border px-3 py-3 text-left " +
                (on ? "border-mint bg-inset" : "border-line bg-surface")
              }
            >
              <span className="block text-sm font-semibold text-fg">{preset.name}</span>
              <span className="mt-1 block text-xs leading-snug text-muted">{preset.blurb}</span>
            </button>
          );
        })}
      </div>

      <section className="mt-3 rounded-card border border-line bg-surface px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">Starting position</h3>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Suburb you are willing to work from</span>
          <SuburbSelect
            value={fence.startId}
            onChange={(startId) => onFence({ ...fence, startId })}
          />
        </label>
        <label className="mt-4 block">
          <span className="mb-1.5 flex items-baseline justify-between text-xs font-medium text-muted">
            <span>Radius</span>
            <span className="font-serif text-lg text-fg tabular-nums">{fence.radiusKm} km</span>
          </span>
          <input
            type="range"
            min={4}
            max={40}
            step={1}
            value={fence.radiusKm}
            aria-valuemin={4}
            aria-valuemax={40}
            aria-valuenow={fence.radiusKm}
            aria-label="Radius in kilometres"
            onChange={(event) => onFence({ ...fence, radiusKm: Number(event.target.value) })}
            className="w-full accent-mint"
          />
        </label>
      </section>

      <section className="mt-3 rounded-card border border-line bg-surface px-4 py-4">
        <h3 className="text-sm font-semibold text-fg">Suburb groups</h3>
        <p className="mt-1 mb-3 text-xs leading-relaxed text-muted">
          On and inside the radius means you will take the drop. Off means Uber can offer it and you still treat the
          ride back as empty, even if it is close.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {groups.map((group) => {
            const on = fence.groups[group.id];
            const count = rows.filter((row) => row.suburb.group === group.id && row.in).length;
            const total = rows.filter((row) => row.suburb.group === group.id).length;
            return (
              <button
                key={group.id}
                type="button"
                aria-pressed={on}
                onClick={() => onFence({ ...fence, groups: { ...fence.groups, [group.id]: !on } })}
                className={
                  "min-h-11 rounded-2xl border px-3 py-3 text-left " +
                  (on ? "border-mint bg-inset" : "border-line bg-bg")
                }
              >
                <span className="block text-sm font-semibold text-fg">{group.name}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {on ? `${count} of ${total} in` : "Off"} · {group.hint}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-3 rounded-card border border-line bg-surface px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">Where the ping is actually going</h3>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-muted">Drop suburb</span>
          <SuburbSelect value={dropId} onChange={onDrop} />
        </label>
        <p className="mt-3 text-sm leading-relaxed text-fg">
          {drop.in
            ? `${drop.drop.name} is inside the fence, ${drop.fromKm.toFixed(0)} km from ${start.name}. No empty ride home.`
            : `${drop.drop.name} is ${drop.fromKm.toFixed(0)} km from ${start.name}. Getting back to ${drop.via} is ${drop.backKm.toFixed(0)} km, about ${drop.backMin} minutes, before you are in a suburb you still work.`}
        </p>
        <button
          type="button"
          onClick={onPrice}
          className="mt-3 min-h-11 w-full rounded-2xl bg-mint px-4 py-3 text-sm font-semibold text-mint-ink"
        >
          Price this ride back
        </button>
      </section>

      <section className="mt-3 rounded-card border border-line bg-surface px-4 py-4">
        <h3 className="mb-3 text-sm font-semibold text-fg">In the fence</h3>
        <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
          {inside.map((row) => (
            <span key={row.suburb.id} className="rounded-full border border-line bg-inset px-2.5 py-1 text-xs text-fg">
              {row.suburb.name}
            </span>
          ))}
        </div>
      </section>

      <footer className="mt-6 text-xs leading-relaxed text-faint">
        Suburb centres are approximate, not a street map. Distance is straight-line kilometres, then about 2.2 minutes
        per kilometre back to the nearest suburb still inside the fence. Not affiliated with Uber.
      </footer>
    </div>
  );
}

function sameFence(a: Fence, b: Fence) {
  return (
    a.startId === b.startId &&
    a.radiusKm === b.radiusKm &&
    groups.every((group) => a.groups[group.id] === b.groups[group.id])
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-3 py-3">
      <p className="text-xs font-medium tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-1 font-serif text-2xl tabular-nums tracking-tight text-fg">{value}</p>
    </div>
  );
}

export function SuburbSelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-xl border border-line bg-inset px-3 py-3 text-base text-fg outline-none focus:border-mint"
    >
      {groups.map((group) => (
        <optgroup key={group.id} label={group.name}>
          {suburbs
            .filter((suburb) => suburb.group === group.id)
            .map((suburb) => (
              <option key={suburb.id} value={suburb.id}>
                {suburb.name}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  );
}
