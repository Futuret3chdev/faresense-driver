import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/originals")({ component: Originals });

const backups = [
  ["backup/initial", "4ac4412", "First commit. Futuret3ch and MemeTorrent."],
  ["backup/first-page", "526b2ed", "First mobile index."],
  ["backup/mobile-ship", "52e6e1c", "Mobile FareSense with CSS and JS."],
  ["backup/full-mobile", "3b90334", "Stub replaced with the full phone UI."],
  ["backup/driver-desk", "01099f6", "Driver Desk redesign and ShiftClose."],
  ["backup/desk-and-shiftclose", "d0fe784", "Desk hub, ShiftClose, shared store."],
  ["backup/redesign", "a3f96a4", "Redesigned offer, ShiftClose, and CSS."],
  ["backup/offer-and-hour", "1991c03", "Offer and Hour as they were before the fence. This is the original live pair."],
  ["backup/with-fence", "d7c100d", "Current main. Offer, Hour, and the Melbourne fence. Nothing after this tag has been pushed."],
];

function Originals() {
  return (
    <div className="mx-auto min-h-dvh max-w-[430px] bg-bg px-4 py-5 text-fg">
      <p className="text-xs font-semibold tracking-[0.16em] text-muted uppercase">Kept</p>
      <h1 className="mt-1 font-serif text-4xl leading-none">Originals</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The FareSense repo is unchanged. These tags point at every commit already on main. The offer card in this preview is a separate project and is not one of them.
      </p>
      <ul className="mt-5 space-y-3">
        {backups.map(([tag, sha, note]) => (
          <li key={tag} className="rounded-card border border-line bg-surface px-4 py-3">
            <a className="text-mint" href={`https://github.com/Futuret3chdev/faresense/tree/${tag}`}>
              {tag}
            </a>
            <p className="mt-1 font-mono text-xs text-muted">{sha}</p>
            <p className="mt-2 text-sm leading-relaxed">{note}</p>
          </li>
        ))}
      </ul>
      <div className="mt-5 space-y-2 text-sm">
        <p>
          Live main, still the fence version:{" "}
          <a className="text-mint" href="https://faresense-futuret3ch.vercel.app/">
            faresense-futuret3ch.vercel.app
          </a>
        </p>
        <p>
          Offer and Hour before the fence:{" "}
          <a className="text-mint" href="https://faresense-onshdst3c-futuret3ch.vercel.app/shiftclose">
            the earlier deployment
          </a>
        </p>
        <p className="text-muted">Both Vercel links still ask for the futuret3ch login.</p>
      </div>
      <p className="mt-6 flex justify-between pb-8 text-sm">
        <Link to="/" className="text-mint">
          Offer card
        </Link>
        <Link to="/desk" className="text-mint">
          Original desk
        </Link>
      </p>
    </div>
  );
}
