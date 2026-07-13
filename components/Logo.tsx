export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <a className="vr-logo" href="#home" aria-label="Visuals Reimagined studio, home">
      <span aria-hidden="true">V<span>R</span></span>
      {!compact && <small>Studio</small>}
    </a>
  );
}
