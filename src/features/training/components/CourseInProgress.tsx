import { Course } from "../mockData";

const Badge = ({ children }: { children: React.ReactNode }) =>
  <span className="badge badge--indigo">{children}</span>;

export default function CourseInProgress({ course }: { course: Course }) {
  const pct = Math.max(0, Math.min(100, course.progress ?? 0));

  return (
    <article className="card card-hover">
      <header className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }}
          aria-hidden
        >
          🎯
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-neutral-900 leading-tight">{course.title}</h3>
              <p className="text-sm text-neutral-500">{course.subtitle}</p>
            </div>
            <Badge>En curso</Badge>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>Progreso</span>
              <span>{pct}%</span>
            </div>
            <div className="progress mt-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${pct}%` }} />
            </div>
          </div>

          <div className="mt-2 text-xs text-neutral-500 flex gap-4">
            {course.start && <span>Inicio: {course.start}</span>}
            {course.end && <span>Fin estimado: {course.end}</span>}
          </div>
        </div>
      </header>
    </article>
  );
}
