import { Course } from "../mockData";

const DateBadge = ({ children }: { children: React.ReactNode }) =>
  <span className="badge badge--slate">{children}</span>;

export default function UpcomingCourse({ course }: { course: Course }) {
  return (
    <article className="card card-hover">
      <header className="flex items-start gap-3">
        <div
          className="h-12 w-12 rounded-2xl grid place-items-center text-white shrink-0"
          style={{ background: "linear-gradient(135deg,#22d3ee,#a78bfa)" }}
        >
          📅
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-neutral-900 leading-tight">{course.title}</h3>
              <p className="text-sm text-neutral-500">{course.subtitle}</p>
            </div>
            {course.date && <DateBadge>{course.date}</DateBadge>}
          </div>

          <ul className="mt-2 text-sm text-neutral-500">
            <li>Duración: 24 h · Certificación: Sí · Cupos: 12</li>
          </ul>
        </div>
      </header>
    </article>
  );
}
