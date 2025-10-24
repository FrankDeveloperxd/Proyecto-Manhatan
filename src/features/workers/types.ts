export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  primary?: boolean;
};

export type Worker = {
  id?: string;

  // Datos personales
  fullName: string;
  dni: string;
  birthDate: string;   // ISO yyyy-mm-dd
  age?: number;
  address: string;
  phone: string;
  email: string;
  civilStatus: string;
  photoUrl?: string;

  // Médica
  bloodType: string;
  allergies: string[];
  conditions: string[];
  medications: string[];

  // Contactos
  emergencyContacts: EmergencyContact[];

  // Institucional
  companyName: string;
  area: string;
  role: string;
  code: string;
  registryNumber?: string;

  // Control de visibilidad / estado
  registered?: boolean;  // ✅ para la ficha
  public?: boolean;      // ✅ para lectura pública

  // Metadatos
  createdAt?: any;
  updatedAt?: any;
};