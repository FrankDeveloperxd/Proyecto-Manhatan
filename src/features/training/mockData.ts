export type Course = {
  id: string;
  title: string;
  subtitle: string;
  progress?: number;     // 0..100 → si viene, está “En curso”
  modulesDone?: number;
  modulesTotal?: number;
  start?: string;
  end?: string;
  date?: string;         // para “Próximos”
};

export type Cert = {
  id: string;
  title: string;
  score: number;         // 0..100
  date: string;
};

export const mockCoursesInProgress: Course[] = [
  {
    id: "c-mineria",
    title: "Seguridad Industrial en Minería",
    subtitle: "Protocolos de seguridad y manejo de equipos",
    progress: 65,
    modulesDone: 13,
    modulesTotal: 20,
    start: "15 Sep 2024",
    end: "30 Oct 2024",
  },
  {
    id: "c-rcp",
    title: "Primeros Auxilios y RCP",
    subtitle: "Atención de emergencias médicas",
    progress: 40,
    modulesDone: 8,
    modulesTotal: 20,
    start: "20 Sep 2024",
    end: "15 Nov 2024",
  },
];

export const mockUpcoming: Course[] = [
  { id: "c-quimica",  title: "Manejo Sustancias Químicas",  subtitle: "Seguridad en el manejo y respuesta", date: "05 Nov 2024" },
  { id: "c-incendio", title: "Prevención y Combate de Incendios", subtitle: "Técnicas de prevención y respuesta", date: "12 Nov 2024" },
];

export const mockCerts: Cert[] = [
  { id: "alturas", title: "Seguridad en Alturas",       score: 95, date: "15 Ago 2024" },
  { id: "epp",     title: "Uso de Equipos de Protección", score: 88, date: "30 Jul 2024" },
  { id: "maq",     title: "Maquinaria Pesada",           score: 92, date: "10 Jun 2024" },
];

export const mockStats = {
  done: 12,
  inProgress: 2,
  certificates: 8,
  hours: 156,
};
