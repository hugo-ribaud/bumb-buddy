export interface Appointment {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  location?: string;
  date_time: string; // ISO format
  end_time?: string; // ISO format
  reminder: boolean;
  reminder_time?: number; // minutes before
  notes?: string;
  created_at: string;
  updated_at: string;
  external_id?: string; // For integration with external services like Doctolib
  external_service?: string; // Name of the external service (e.g., "doctolib")
  external_url?: string; // URL to the appointment in the external service
  doctor_name?: string; // Name of the healthcare provider
  specialty?: string; // Medical specialty of the healthcare provider
}

export interface AppointmentInput {
  user_id: string;
  title: string;
  description?: string;
  location?: string;
  date_time: string;
  end_time?: string;
  reminder: boolean;
  reminder_time?: number;
  notes?: string;
  external_id?: string;
  external_service?: string;
  external_url?: string;
  doctor_name?: string;
  specialty?: string;
}

// Special types for working with calendar providers
export interface CalendarAppointment {
  id: string;
  title: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
  notes?: string;
}

// For appointments from Doctolib
export interface DoctolibAppointment {
  id: string;
  doctorName: string;
  specialty: string;
  dateTime: string; // ISO format
  location: string;
  notes?: string;
}
