import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FencePanel } from "@/components/fence-panel";
import { analyze, defaultInputs, ideas, loadInputs, presets, saveInputs, zones } from "@/lib/deadhead";
import type { Inputs, Preset, Zone } from "@/lib/deadhead";
import { assessDrop, defaultFence, KM_PER_MILE, loadFence, saveFence } from "@/lib/melbourne";
import type { Fence } from "@/lib/melbourne";

export const Route = createFileRoute("/desk")({ component: Desk });

function Desk() {
  const [tab, setTab] = useState<"fence" | "trip" | "ideas">("fence");
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [fence, setFence] = useState<Fence>(defaultFence);
  const [dropId, setDropId] = useState("werribee");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadInputs();
    if (saved) setInputs(saved);
    setFence(loadFence());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveInputs(inputs);
  }, [inputs, ready]);

  useEffect(() => {
    if (ready) saveFence(fence);
  }, [fence, ready]);

  const verdict = useMemo(() => analyze(inputs), [inputs]);

  function priceDrop(id = dropId, next = fence) {
    const back = assessDrop(next, id);
    setInputs((prev) => ({
      ...prev,
      backMiles: Math.round((back.backKm / KM_PER_MILE) * 10) / 10,
      backMin: back.backMin,
      zone: back.in ? "earning" : "dead",
    }));
  }

  return (
    <div className="mx-auto min-h-dvh max-w-[430px] bg-bg px-4 py-4 text-fg">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Original desk</p>
          <h1 className="font-serif text-4xl leading-none">Deadhead</h1>
        </div>
        <Link to="/originals" className="text-sm text-mint">
          Backups
        </Link>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Kept beside the offer card. Fence, the empty ride back, and the fifteen ideas. The FareSense site on GitHub was not replaced.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-surface p-1 text-center text-sm">
        {(["fence", "trip", "ideas"] as const).map((id) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={"rounded-full py-2 capitalize " + (tab === id ? "bg-mint text-mint-ink" : "text-muted")}>
            {id}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "fence" ? (
          <FencePanel
            fence={fence}
            dropId={dropId}
            onFence={setFence}
            onDrop={setDropId}
            onPrice={() => priceDrop()}
          />
        ) : null}
        {tab === "trip" ? (
          <Trip
            inputs={inputs}
            verdict={verdict}
            onChange={(partial) => setInputs((prev) => ({ ...prev, ...partial }))}
            onPreset={(preset) => setInputs((prev) => ({ ...prev, ...preset.offer }))}
            onZone={(zone) => setInputs((prev) => ({ ...prev, zone }))}
          />
        ) : null}
        {tab === "ideas" ? (
          <ol className="space-y-3">
            {ideas.map((idea) => (
              <li key={idea.n} className="rounded-card border border-line bg-surface px-4 py-3">
                <p className="text-xs tracking-widest text-muted">{idea.n}</p>
                <h2 className="font-serif text-2xl">{idea.name}</h2>
                <p className="mt-1 text-sm">{idea.asks}</p>
                <p className="mt-2 text-sm text-muted">{idea.missing}</p>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
      <p className="mt-6 pb-6 text-center text-sm text-muted">
        <Link to="/" className="text-mint">
          Offer card
        </Link>
      </p>
    </div>
  );
}

function Trip({
  inputs,
  verdict,
  onChange,
  onPreset,
  onZone,
}: {
  inputs: Inputs;
  verdict: ReturnType<typeof analyze>;
  onChange: (partial: Partial<Inputs>) => void;
  onPreset: (preset: Preset) => void;
  onZone: (zone: Zone) => void;
}) {
  const tone =
    verdict.kind === "take" || verdict.kind === "stay"
      ? "border-mint bg-mint text-mint-ink"
      : verdict.kind === "strand"
        ? "border-amber bg-amber text-amber-ink"
        : "border-line bg-surface text-fg";
  return (
    <div className="space-y-3">
      <section className={"rounded-card border px-5 py-5 " + tone}>
        <p className="text-xs font-semibold tracking-widest uppercase">{verdict.kind}</p>
        <h2 className="mt-1 font-serif text-4xl leading-none">{verdict.title}</h2>
        <p className="mt-3 text-sm leading-relaxed">{verdict.text}</p>
      </section>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Meter label="Card" value={`$${Math.round(verdict.tripHour)}/hr`} />
        <Meter label="After the ride back" value={`$${Math.round(verdict.trueHour)}/hr`} />
        <Meter label="Empty cost" value={`$${verdict.emptyCost.toFixed(0)}`} />
        <Meter label="True net" value={`$${verdict.trueNet.toFixed(0)}`} />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {presets.map((preset) => (
          <button key={preset.id} type="button" onClick={() => onPreset(preset)} className="w-40 shrink-0 rounded-card border border-line bg-surface px-3 py-3 text-left">
            <b className="block text-sm">{preset.name}</b>
            <span className="mt-1 block text-xs leading-snug text-muted">{preset.blurb}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Num label="Payout" value={inputs.payout} onChange={(payout) => onChange({ payout })} />
        <Num label="Tip" value={inputs.tip} onChange={(tip) => onChange({ tip })} />
        <Num label="Trip miles" value={inputs.tripMiles} onChange={(tripMiles) => onChange({ tripMiles })} />
        <Num label="Trip min" value={inputs.tripMin} onChange={(tripMin) => onChange({ tripMin })} />
        <Num label="Pickup miles" value={inputs.pickupMiles} onChange={(pickupMiles) => onChange({ pickupMiles })} />
        <Num label="Pickup min" value={inputs.pickupMin} onChange={(pickupMin) => onChange({ pickupMin })} />
        <Num label="Back miles" value={inputs.backMiles} onChange={(backMiles) => onChange({ backMiles })} />
        <Num label="Back min" value={inputs.backMin} onChange={(backMin) => onChange({ backMin })} />
        <Num label="Tolls" value={inputs.tolls} onChange={(tolls) => onChange({ tolls })} />
        <Num label="Floor" value={inputs.floor} onChange={(floor) => onChange({ floor })} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {zones.map((zone) => (
          <button key={zone.id} type="button" onClick={() => onZone(zone.id)} className={"rounded-card border px-2 py-3 text-left text-xs " + (inputs.zone === zone.id ? "border-mint text-mint" : "border-line text-muted")}>
            <b className="block text-sm text-fg">{zone.title}</b>
            {zone.detail}
          </button>
        ))}
      </div>
    </div>
  );
}

function Meter({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-inset px-3 py-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="font-serif text-2xl">{value}</p>
    </div>
  );
}

function Num({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block rounded-card border border-line bg-surface px-3 py-2">
      <span className="text-xs text-muted">{label}</span>
      <input
        inputMode="decimal"
        className="mt-1 w-full bg-transparent text-base outline-none"
        value={Number.isFinite(value) ? String(Math.round(value * 1000) / 1000) : ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
      />
    </label>
  );
}
