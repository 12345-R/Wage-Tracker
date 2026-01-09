
export interface Profile {
  id: string;
  email: string;
}

export interface Employee {
  id: string;
  employer_id: string;
  name: string;
  hourly_rate: number;
  created_at: string;
}

export interface WorkEntry {
  id: string;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  total_wage: number;
  created_at: string;
}

export interface WorkEntryWithEmployee extends WorkEntry {
  employees: {
    name: string;
    hourly_rate: number;
  };
}

export interface MonthlySummary {
  month: string;
  totalHours: number;
  totalWage: number;
  entryCount: number;
}
