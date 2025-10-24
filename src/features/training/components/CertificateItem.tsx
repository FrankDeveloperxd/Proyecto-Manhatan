import { Cert } from "../mockData";

const Score = ({ value }: { value: number }) =>
  <span className="badge badge--emerald">{value}/100</span>;

export default function CertificateItem({ cert }: { cert: Cert }) {
  return (
    <article className="card card-hover">
      <header className="flex items-start gap-3">
        <div className="h-12 w-12 rounded-2xl grid place-items-center bg-amber-300/95 text-neutral-900 shrink-0">🏆</div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-medium text-neutral-900 leading-tight">{cert.title}</h3>
            <Score value={cert.score} />
          </div>
          <p className="text-xs text-neutral-500">Completado: {cert.date}</p>
        </div>
      </header>
    </article>
  );
}
