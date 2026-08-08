import { supabase } from './supabase'; // Проверьте путь к вашему клиенту Supabase

export interface Branch {
  id: number;
  name: string;
}

export interface Employee {
  id: number;
  full_name: string;
  branch_id: number;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface StatisticsFilter {
  dateRecordFrom?: string;
  dateRecordTo?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  branch?: string;
  employee?: string;
  service?: string;
  displayMode?: 'days' | 'weeks' | 'months';
  chartType?: 'line' | 'bar';
}

export interface RawAppointment {
  id: number;
  appointment_date: string;
  status: string;
  branch_id: number;
  employee_id: number;
  service_id: number;
  clients?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  services?: {
    name: string;
    price: number;
    duration_minutes: number;
  };
}

export interface ChartDataPoint {
  label: string;
  count: number;
  totalPrice: number;
  totalDuration: number;
}

export interface StatisticsSummary {
  totalCount: number;
  totalPrice: number;
  totalDuration: number;
  chartData: ChartDataPoint[];
}

// Загрузка списков для селектов
export async function getFilterOptions() {
  const [branchesRes, employeesRes, servicesRes] = await Promise.all([
    supabase.from('branches').select('*').order('name'),
    supabase.from('employees').select('*').order('full_name'),
    supabase.from('services').select('*').order('name'),
  ]);

  return {
    branches: (branchesRes.data as Branch[]) || [],
    employees: (employeesRes.data as Employee[]) || [],
    services: (servicesRes.data as Service[]) || [],
  };
}

// Вспомогательная функция группировки по периодам
function getGroupKey(dateStr: string, mode: 'days' | 'weeks' | 'months'): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Неизвестно';

  if (mode === 'months') {
    return d.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
  }

  if (mode === 'weeks') {
    const startOfWeek = new Date(d);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    return `Неделя с ${startOfWeek.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}`;
  }

  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Основная функция загрузки и агрегации статистики
export async function getStatistics(filters: StatisticsFilter): Promise<StatisticsSummary> {
  let query = supabase.from('appointments').select(`
    id,
    appointment_date,
    status,
    branch_id,
    employee_id,
    service_id,
    clients!inner (full_name, email, phone),
    services (name, price, duration_minutes)
  `);

  if (filters.branch && filters.branch !== 'all') {
    query = query.eq('branch_id', Number(filters.branch));
  }
  if (filters.employee && filters.employee !== 'all') {
    query = query.eq('employee_id', Number(filters.employee));
  }
  if (filters.service && filters.service !== 'all') {
    query = query.eq('service_id', Number(filters.service));
  }
  if (filters.dateRecordFrom) {
    query = query.gte('appointment_date', `${filters.dateRecordFrom}T00:00:00`);
  }
  if (filters.dateRecordTo) {
    query = query.lte('appointment_date', `${filters.dateRecordTo}T23:59:59`);
  }
  if (filters.clientName) {
    query = query.ilike('clients.full_name', `%${filters.clientName}%`);
  }
  if (filters.email) {
    query = query.ilike('clients.email', `%${filters.email}%`);
  }
  if (filters.phone) {
    query = query.ilike('clients.phone', `%${filters.phone}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Ошибка при получении статистики:', error);
    throw error;
  }

  const appointments = (data as unknown as RawAppointment[]) || [];

  let totalCount = 0;
  let totalPrice = 0;
  let totalDuration = 0;

  const groupedMap: Record<string, ChartDataPoint> = {};

  appointments.forEach((app) => {
    totalCount += 1;
    const price = app.services?.price || 0;
    const duration = app.services?.duration_minutes || 0;

    totalPrice += price;
    totalDuration += duration;

    const groupKey = getGroupKey(app.appointment_date, filters.displayMode || 'days');

    if (!groupedMap[groupKey]) {
      groupedMap[groupKey] = {
        label: groupKey,
        count: 0,
        totalPrice: 0,
        totalDuration: 0,
      };
    }

    groupedMap[groupKey].count += 1;
    groupedMap[groupKey].totalPrice += price;
    groupedMap[groupKey].totalDuration += duration;
  });

  return {
    totalCount,
    totalPrice,
    totalDuration,
    chartData: Object.values(groupedMap),
  };
}