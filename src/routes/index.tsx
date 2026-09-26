import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { FencePanel } from "@/components/fence-panel";
import { ideas } from "@/lib/deadhead";
import { assessDrop, defaultFence, loadFence, saveFence, suburbNamed } from "@/lib/melbourne";
import type { Fence } from "@/lib/melbourne";
import {
  defaultVehicle,
  exampleOffer,
  loadLog,
  loadOffer,
  loadVehicle,
  num,
  saveLog,
  saveOffer,
  saveVehicle,
  score,
} from "@/lib/card";
import type { LogItem, Offer, Vehicle, VerdictKind } from "@/lib/card";

export const Route = createFileRoute("/")({ component: Card });

type Tab = "offer" | "area" | "shift" | "menu";
type Sheet = "menu" | "vehicle" | "why";

function money(n: number, digits = 2) {
  const sign = n < 0 ? "−" : "";
  return `${sign}$${Math.abs(n).toFixed(digits)}`;
}

function hourLabel(n: number) {
  return `${money(Math.round(n), 0)}/hr`;
}

const copy: Record<VerdictKind, { label: string; tone: string; ink: string }> = {
  take: { label: "TAKE", tone: "bg-[#E7F6EE] text-[#067A42]", ink: "Clears your floor with room." },
  borderline: { label: "BORDERLINE", tone: "bg-[#FFF6D6] text-[#7A5B00]", ink: "Only if the drop leaves you somewhere you want." },
  skip: { label: "SKIP", tone: "bg-[#FDECEA] text-[#A3180E]", ink: "Same headline. The hour does not pay." },
  short: { label: "NEED MORE", tone: "bg-[#F6F6F6] text-[#545454]", ink: "Payout, miles, and minutes have to be on the card before this is a call." },
};

function Card() {
  const [tab, setTab] = useState<Tab>("offer");
  const [sheet, setSheet] = useState<Sheet>("menu");
  const [fence, setFence] = useState<Fence>(defaultFence);
  const [dropId, setDropId] = useState("werribee");
  const [offer, setOffer] = useState<Offer>(exampleOffer);
  const [vehicle, setVehicle] = useState<Vehicle>(defaultVehicle);
  const [log, setLog] = useState<LogItem[]>([]);
  const [note, setNote] = useState("");
  const [ready, setReady] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    if (!dirty.current) {
      setOffer(loadOffer());
      setVehicle(loadVehicle());
    }
    setLog(loadLog());
    setFence(loadFence());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveOffer(offer);
  }, [offer, ready]);

  useEffect(() => {
    if (ready) saveVehicle(vehicle);
  }, [vehicle, ready]);

  useEffect(() => {
    if (ready) saveFence(fence);
  }, [fence, ready]);

  const result = useMemo(() => score(offer, vehicle), [offer, vehicle]);
  const verdict = copy[result.kind];
  const gap = result.hourly - vehicle.floor;

  function patchOffer(partial: Partial<Offer>) {
    dirty.current = true;
    setOffer((prev) => ({ ...prev, ...partial }));
    setNote("");
  }

  function patchVehicle(partial: Partial<Vehicle>) {
    dirty.current = true;
    setVehicle((prev) => ({ ...prev, ...partial }));
  }

  function record(decision: "accepted" | "declined") {
    if (result.kind === "short") {
      setNote("Add the payout and the miles first.");
      return;
    }
    const item: LogItem = {
      id: `${Date.now()}`,
      at: Date.now(),
      decision,
      payout: offer.payout,
      hourly: result.hourly,
      net: result.net,
      kind: result.kind,
      pickupMiles: offer.pickupMiles,
    };
    const next = [item, ...log].slice(0, 40);
    setLog(next);
    saveLog(next);
    setNote(decision === "accepted" ? "Logged as accepted. The Driver app tap is still yours." : "Logged as declined. Nothing was sent.");
    setTab("shift");
  }

  function openTab(next: Tab) {
    setTab(next);
    if (next === "menu") setSheet("menu");
  }

  return (
    <div className="mx-auto flex h-dvh max-w-[430px] flex-col bg-[#0C0C0C] text-[#111] antialiased">
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0">
          <CityMap />
          <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3">
            <div className="rounded-full bg-black/85 px-3 py-1.5 text-[13px] font-medium text-white">Online</div>
            <div className="rounded-full bg-white px-3 py-1.5 text-[13px] font-semibold shadow-sm">FareSense</div>
          </div>
        </div>
        <section className="absolute inset-x-0 bottom-0 flex max-h-[64%] flex-col rounded-t-2xl bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.28)]">
          <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-[#E5E5E5]" />
          {tab === "offer" ? (
            <OfferScreen
              offer={offer}
              vehicle={vehicle}
              result={result}
              verdict={verdict}
              gap={gap}
              note={note}
              onOffer={patchOffer}
              onAccept={() => record("accepted")}
              onDecline={() => record("declined")}
              onExample={() => patchOffer(exampleOffer)}
              onLong={() => patchOffer({ ...exampleOffer, pickupMiles: 8 })}
            />
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {tab === "area" ? (
                <div className="px-3 py-3">
                  <FencePanel
                    fence={fence}
                    dropId={dropId}
                    onFence={setFence}
                    onDrop={setDropId}
                    onPrice={() => {
                      const back = assessDrop(fence, dropId);
                      const name = suburbNamed(dropId).name;
                      setNote(
                        back.in
                          ? `${name} is inside the fence. No empty ride home.`
                          : `${name} is ${back.backKm.toFixed(0)} km outside. The ride back is about ${back.backMin} min.`,
                      );
                      setTab("offer");
                    }}
                  />
                </div>
              ) : null}
              {tab === "shift" ? <ShiftScreen log={log} onClear={() => { setLog([]); saveLog([]); }} /> : null}
              {tab === "menu" && sheet === "menu" ? (
                <MenuSheet
                  onVehicle={() => setSheet("vehicle")}
                  onWhy={() => setSheet("why")}
                />
              ) : null}
              {tab === "menu" && sheet === "vehicle" ? (
                <VehicleScreen vehicle={vehicle} onChange={patchVehicle} miles={result.miles} irs={result.irs} onBack={() => setSheet("menu")} />
              ) : null}
              {tab === "menu" && sheet === "why" ? <WhyScreen onBack={() => setSheet("menu")} /> : null}
            </div>
          )}
        </section>
      </div>
      <nav className="grid shrink-0 grid-cols-4 border-t border-white/10 bg-[#0C0C0C] pb-[max(8px,env(safe-area-inset-bottom))] text-white">
        <TabButton id="offer" label="Offer" active={tab === "offer"} onClick={openTab} icon="pin" />
        <TabButton id="area" label="Area" active={tab === "area"} onClick={openTab} icon="area" />
        <TabButton id="shift" label="Shift" active={tab === "shift"} onClick={openTab} icon="clock" />
        <TabButton id="menu" label="Menu" active={tab === "menu"} onClick={openTab} icon="menu" />
      </nav>
    </div>
  );
}

function OfferScreen({
  offer,
  vehicle,
  result,
  verdict,
  gap,
  note,
  onOffer,
  onAccept,
  onDecline,
  onExample,
  onLong,
}: {
  offer: Offer;
  vehicle: Vehicle;
  result: ReturnType<typeof score>;
  verdict: (typeof copy)[VerdictKind];
  gap: number;
  note: string;
  onOffer: (partial: Partial<Offer>) => void;
  onAccept: () => void;
  onDecline: () => void;
  onExample: () => void;
  onLong: () => void;
}) {
  const over = gap >= 0;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div id="card-scroll" className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-black px-2 py-1 text-[12px] font-medium text-white">UberX</span>
            <span className="text-[13px] text-[#757575]">Exclusive</span>
          </div>
          <label className="mt-2 block">
            <span className="sr-only">Payout on the card</span>
            <span className="flex items-baseline">
              <span className="text-[28px] font-semibold tracking-[-0.04em]">$</span>
              <input
                inputMode="decimal"
                className="w-full bg-transparent text-[40px] font-semibold leading-none tracking-[-0.04em] outline-none"
                value={offer.payout.toFixed(2)}
                onChange={(e) => onOffer({ payout: num(e.target.value) })}
              />
            </span>
          </label>
          <p className="text-[13px] text-[#757575]">Upfront fare · tip not included</p>

          <div className={`mt-3 rounded-xl px-3 py-3 ${verdict.tone}`}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[13px] font-semibold tracking-[0.14em]">{verdict.label}</p>
              <p className="text-[22px] font-semibold tracking-[-0.03em] text-black">{result.kind === "short" ? "—" : hourLabel(result.hourly)}</p>
            </div>
            <p className="mt-1 text-[14px] leading-snug text-[#1A1A1A]">
              {result.kind === "short"
                ? verdict.ink
                : `${over ? money(gap, 0) + " over" : money(Math.abs(gap), 0) + " under"} your ${money(vehicle.floor, 0)} floor. ${verdict.ink}`}
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat label="Net" value={money(result.net)} />
            <Stat label="Per mile" value={money(result.perMile)} />
            <Stat label="Car" value={money(result.vehicleCost)} />
          </div>

          <div className="mt-3 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
            <Stop
              minutes={offer.pickupMin}
              miles={offer.pickupMiles}
              title="Pickup"
              detail="Unpaid. Counts as miles and minutes."
              dashed
              onMinutes={(pickupMin) => onOffer({ pickupMin })}
              onMiles={(pickupMiles) => onOffer({ pickupMiles })}
            />
            <Stop
              minutes={offer.tripMin}
              miles={offer.tripMiles}
              title="Trip"
              detail="Paid segment on the offer."
              onMinutes={(tripMin) => onOffer({ tripMin })}
              onMiles={(tripMiles) => onOffer({ tripMiles })}
            />
          </div>

          <p className="mt-3 text-[12px] leading-relaxed text-[#757575]">
            {money(result.costPerMile)}/mi = fuel {money(vehicle.fuel)} ÷ {trim(vehicle.mpg)} mpg + {money(vehicle.wear)} wear.
            IRS reference {money(result.irs)} is not cash.
          </p>

          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => {
              onExample();
              document.getElementById("card-scroll")?.scrollTo(0, 0);
            }} className="rounded-full bg-[#F6F6F6] px-3 py-2 text-[13px] font-medium">
              Brief example
            </button>
            <button type="button" onClick={() => {
              onLong();
              document.getElementById("card-scroll")?.scrollTo(0, 0);
            }} className="rounded-full bg-[#F6F6F6] px-3 py-2 text-[13px] font-medium">
              8-mile pickup
            </button>
          </div>
        </div>
        <div className="shrink-0 border-t border-[#E5E5E5] px-4 py-2">
          <button
            type="button"
            onClick={onAccept}
            className="h-14 w-full rounded-lg bg-[#276EF1] text-[17px] font-medium text-white active:scale-[0.99]"
          >
            Accept
          </button>
          <button type="button" onClick={onDecline} className="h-10 w-full text-[15px] font-medium text-[#545454]">
            Not this one
          </button>
          <p className="pb-1 text-center text-[11px] leading-snug text-[#757575]">
            {note || "Not affiliated with Uber. Accept only logs on this phone."}
          </p>
        </div>
    </div>
  );
}

function Stop({
  minutes,
  miles,
  title,
  detail,
  dashed,
  onMinutes,
  onMiles,
}: {
  minutes: number;
  miles: number;
  title: string;
  detail: string;
  dashed?: boolean;
  onMinutes: (n: number) => void;
  onMiles: (n: number) => void;
}) {
  return (
    <div className="flex gap-3 py-3">
      <div className="flex w-3 flex-col items-center pt-1">
        <span className={`h-2.5 w-2.5 rounded-sm ${dashed ? "bg-[#AFAFAF]" : "bg-black"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <input
            inputMode="decimal"
            aria-label={`${title} minutes`}
            className="w-12 bg-transparent text-[16px] font-medium outline-none"
            value={trim(minutes)}
            onChange={(e) => onMinutes(num(e.target.value))}
          />
          <span className="text-[16px] font-medium">min</span>
          <span className="text-[#AFAFAF]">·</span>
          <input
            inputMode="decimal"
            aria-label={`${title} miles`}
            className="w-14 bg-transparent text-[16px] font-medium outline-none"
            value={trim(miles)}
            onChange={(e) => onMiles(num(e.target.value))}
          />
          <span className="text-[16px] text-[#545454]">mi</span>
        </div>
        <p className="text-[15px] font-medium">{title}</p>
        <p className="text-[13px] text-[#757575]">{detail}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F6F6F6] px-2 py-2">
      <p className="text-[11px] uppercase tracking-wide text-[#757575]">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold tracking-[-0.02em]">{value}</p>
    </div>
  );
}

function VehicleScreen({
  vehicle,
  onChange,
  miles,
  irs,
  onBack,
}: {
  vehicle: Vehicle;
  onChange: (partial: Partial<Vehicle>) => void;
  miles: number;
  irs: number;
  onBack: () => void;
}) {
  return (
    <Page title="Vehicle" lede="Set this once. Every offer on the map uses it." onBack={onBack}>
      <Field label="Fuel price" suffix="$/gal" value={vehicle.fuel} onChange={(fuel) => onChange({ fuel })} />
      <Field label="Real MPG" suffix="mpg" value={vehicle.mpg} onChange={(mpg) => onChange({ mpg })} />
      <Field label="Wear" suffix="$/mi" value={vehicle.wear} onChange={(wear) => onChange({ wear })} hint="Depreciation, tires, oil, a slice of insurance. Default $0.22 is a mid-size sedan after fuel." />
      <Field label="Hourly floor" suffix="$/hr" value={vehicle.floor} onChange={(floor) => onChange({ floor })} hint="The net hour you will actually defend. A suburban night and an airport shift should not share one number." />
      <Field label="Expected tip" suffix="$" value={vehicle.tip} onChange={(tip) => onChange({ tip })} hint="Unknown at accept. Zero is the honest default." />
      <p className="text-[13px] leading-relaxed text-[#545454]">
        On {trim(miles)} mi the H2 2026 IRS reference is {money(irs)} at $0.76/mi. A deduction is not a reimbursement. Cash leaves the tank now.
      </p>
    </Page>
  );
}

function ShiftScreen({ log, onClear }: { log: LogItem[]; onClear: () => void }) {
  const accepted = log.filter((item) => item.decision === "accepted");
  const net = accepted.reduce((sum, item) => sum + item.net, 0);
  return (
    <Page title="Shift" lede="Accepted and declined stay on this phone. Nothing is uploaded.">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Logged" value={String(log.length)} />
        <Stat label="Accepted" value={String(accepted.length)} />
        <Stat label="Net logged" value={money(net, 0)} />
      </div>
      {log.length === 0 ? (
        <p className="rounded-xl bg-[#F6F6F6] px-3 py-4 text-[14px] leading-relaxed text-[#545454]">
          No trips yet. Score an offer, then Accept or Not this one. Declined trips are the ones that would have pulled the hour down.
        </p>
      ) : (
        <ul className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
          {log.map((item) => (
            <li key={item.id} className="flex items-baseline justify-between gap-3 py-3">
              <div>
                <p className="text-[15px] font-medium">{item.decision === "accepted" ? "Accepted" : "Declined"}</p>
                <p className="text-[13px] text-[#757575]">
                  {copy[item.kind].label} · pickup {trim(item.pickupMiles)} mi · {new Date(item.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[15px] font-semibold">{money(item.payout)}</p>
                <p className="text-[13px] text-[#757575]">{hourLabel(item.hourly)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {log.length > 0 ? (
        <button type="button" onClick={onClear} className="text-[14px] font-medium text-[#D72113]">
          Clear this phone’s log
        </button>
      ) : null}
    </Page>
  );
}

function WhyScreen({ onBack }: { onBack: () => void }) {
  return (
    <Page title="Why" lede="The payout is a headline. Pickup is the fine print." onBack={onBack}>
      <p className="text-[15px] leading-relaxed">
        Pickup miles are real miles. Pickup minutes are real minutes. After you drive to the rider, is the hour above the floor you set?
      </p>
      <p className="text-[15px] leading-relaxed text-[#545454]">
        Trackers explain the shift after it ends. Auto-accept tools tap the Driver app for you. This does neither. The thumb stays on your side of the glass.
      </p>
      <p className="text-[15px] leading-relaxed text-[#545454]">
        Change the pickup from 3.4 to 8 miles on the same $14.80 and the call flips. That is the Friday trip that looked identical.
      </p>
      <p className="text-[13px] leading-relaxed text-[#757575]">
        Not affiliated with Uber Technologies, Inc. No account, no server, no rider data. Not tax, legal, or earnings advice. Produced by Futuret3ch and MemeTorrent.
      </p>
      <p className="flex justify-between text-[14px] font-medium">
        <Link to="/desk" className="text-black">
          Original desk
        </Link>
        <Link to="/originals" className="text-black">
          Backup references
        </Link>
      </p>
    </Page>
  );
}

function Page({ title, lede, onBack, children }: { title: string; lede: string; onBack?: () => void; children: ReactNode }) {
  return (
    <div className="px-4 py-4">
      {onBack ? (
        <button type="button" onClick={onBack} className="mb-3 text-[14px] font-medium text-[#545454]">
          Back
        </button>
      ) : null}
      <p className="text-[12px] font-medium tracking-[0.14em] text-[#757575]">FARESENSE</p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">{title}</h1>
      <p className="mt-1 text-[15px] leading-snug text-[#545454]">{lede}</p>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  suffix,
  value,
  hint,
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  hint?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[#545454]">{label}</span>
      <span className="mt-1 flex h-14 items-center rounded-lg bg-[#F6F6F6] px-3">
        <input
          inputMode="decimal"
          className="w-full bg-transparent text-[16px] font-medium outline-none"
          value={trim(value)}
          onChange={(e) => onChange(num(e.target.value))}
        />
        <span className="shrink-0 text-[14px] text-[#757575]">{suffix}</span>
      </span>
      {hint ? <span className="mt-1 block text-[12px] leading-relaxed text-[#757575]">{hint}</span> : null}
    </label>
  );
}

function MenuSheet({ onVehicle, onWhy }: { onVehicle: () => void; onWhy: () => void }) {
  return (
    <div className="px-4 py-4">
      <p className="text-[12px] font-medium tracking-[0.14em] text-[#757575]">DRIVER</p>
      <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.04em]">Menu</h1>
      <p className="mt-1 text-[14px] leading-snug text-[#545454]">Same map. Same sheet. A new tool is another row here, not a new app.</p>
      <div className="mt-4 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
        <MenuRow title="Vehicle" detail="Fuel, wear, and the floor on every offer." onClick={onVehicle} />
        <MenuRow title="Why" detail="What the card is, and what it will not tap." onClick={onWhy} />
        <Link to="/desk" className="flex items-center justify-between py-3">
          <span>
            <span className="block text-[16px] font-medium">Original desk</span>
            <span className="block text-[13px] text-[#757575]">The fence math and the fifteen ideas, kept.</span>
          </span>
          <span className="text-[#AFAFAF]">›</span>
        </Link>
        <Link to="/originals" className="flex items-center justify-between py-3">
          <span>
            <span className="block text-[16px] font-medium">Backup references</span>
            <span className="block text-[13px] text-[#757575]">Every FareSense commit, tagged and left alone.</span>
          </span>
          <span className="text-[#AFAFAF]">›</span>
        </Link>
      </div>
      <p className="mt-5 text-[12px] font-medium tracking-[0.14em] text-[#757575]">NEXT, SAME SHEET</p>
      <ul className="mt-2 divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
        {ideas.slice(0, 6).map((idea) => (
          <li key={idea.n} className="flex items-center justify-between gap-3 py-3">
            <span>
              <span className="block text-[16px] font-medium">{idea.name}</span>
              <span className="block text-[13px] leading-snug text-[#757575]">{idea.asks}</span>
            </span>
            <span className="shrink-0 rounded-full bg-[#F6F6F6] px-2 py-1 text-[11px] font-medium text-[#545454]">Soon</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuRow({ title, detail, onClick }: { title: string; detail: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between py-3 text-left">
      <span>
        <span className="block text-[16px] font-medium">{title}</span>
        <span className="block text-[13px] text-[#757575]">{detail}</span>
      </span>
      <span className="text-[#AFAFAF]">›</span>
    </button>
  );
}

function TabButton({
  id,
  label,
  active,
  onClick,
  icon,
}: {
  id: Tab;
  label: string;
  active: boolean;
  onClick: (id: Tab) => void;
  icon: "pin" | "area" | "clock" | "menu";
}) {
  return (
    <button type="button" onClick={() => onClick(id)} className={`flex h-14 flex-col items-center justify-center gap-1 ${active ? "text-white" : "text-[#AFAFAF]"}`}>
      <Icon name={icon} />
      <span className="text-[11px] font-medium">{label}</span>
    </button>
  );
}

function Icon({ name }: { name: "pin" | "area" | "clock" | "menu" }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "pin") {
    return (
      <svg {...common}>
        <path d="M4 16h16M6 16l2-5h8l2 5" />
        <circle cx="7.5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "area") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === "clock") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 7h14M5 12h14M5 17h14" />
    </svg>
  );
}

function CityMap() {
  return (
    <svg className="h-full w-full" viewBox="0 0 390 520" role="img" aria-label="Pickup and trip on a night map">
      <rect width="390" height="520" fill="#1E1E1E" />
      <path d="M0 40 C90 55 140 20 200 34 C270 50 310 18 390 28 L390 0 L0 0 Z" fill="#0F1B2A" />
      {Array.from({ length: 5 }, (_, i) => (
        <line key={`h${i}`} x1="0" x2="390" y1={70 + i * 36} y2={64 + i * 38} stroke="#2A2A2A" strokeWidth="8" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <line key={`v${i}`} x1={36 + i * 62} x2={28 + i * 64} y1="20" y2="280" stroke="#2F2F2F" strokeWidth="7" />
      ))}
      <rect x="150" y="96" width="54" height="28" rx="4" fill="#163024" />
      <path d="M64 168 C120 140 150 118 196 108 C250 90 290 70 330 52" fill="none" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 168 C120 140 155 120 196 108" fill="none" stroke="#AFAFAF" strokeWidth="5" strokeDasharray="2 10" strokeLinecap="round" />
      <circle cx="64" cy="168" r="7" fill="#FFFFFF" />
      <circle cx="196" cy="108" r="6" fill="#FFCB00" />
      <circle cx="330" cy="52" r="7" fill="#FFFFFF" />
      <g fontFamily="ui-sans-serif, system-ui" fontSize="12" fontWeight="600">
        <rect x="36" y="176" width="52" height="22" rx="11" fill="#000" />
        <text x="48" y="191" fill="#fff">You</text>
        <rect x="164" y="116" width="62" height="22" rx="11" fill="#000" />
        <text x="176" y="131" fill="#fff">Pickup</text>
        <rect x="292" y="22" width="52" height="22" rx="11" fill="#000" />
        <text x="304" y="37" fill="#fff">Drop</text>
      </g>
    </svg>
  );
}

function trim(n: number) {
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 1000) / 1000;
  return String(rounded);
}
