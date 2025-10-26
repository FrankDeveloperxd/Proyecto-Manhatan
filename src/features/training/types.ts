export type Training = {
  id: string;
  type: "training";
  title: string;
  description?: string;

  // fechas y horas
  startDate: string;        // YYYY-MM-DD
  endDate?: string;         // YYYY-MM-DD (opcional)
  startTime?: string;       // HH:mm (opcional)
  endTime?: string;         // HH:mm (opcional)

  // modalidad: presencial / virtual / mixta
  modality?: "presencial" | "virtual" | "mixta";

  hours: number;            // horas totales
  certifies: boolean;       // emite certificado
  mandatory: boolean;       // obligatorio
  steps: number;            // número de pasos
  area?: string;            // opcional

  createdBy: string;        // uid
  createdAt: number;        // Date.now()
};

export type TrainingEnrollment = {
  trainingId: string;
  status: "enrolled" | "in_progress" | "completed";
  progress: number;
  hoursDone: number;
  certified: boolean;
  lastUpdate: number;
};

export type Worker = {
  id: string;
  name: string;
  email?: string;
  area?: string;
  public?: boolean;
  trainingEnrollments?: TrainingEnrollment[];
  trainingIds?: string[];
};

export type WorkerStats = {
  inProgress: number;
  certificates: number;
  hoursCompleted: number;
  coursesCompleted: number;
};
