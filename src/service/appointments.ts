import { supabase } from './supabase'; // <-- Проверьте путь к вашему файлу supabase.ts

// ==========================================
// ТИПЫ
// ==========================================


export interface Client {
  id: number;
  full_name: string;
  phone: string;
  email?: string;
  note?: string;
}

export interface Branch {
  id: number;
  address: string;
}

export interface Employee {
  id: number;
  full_name: string;
  branch_id: number;
  work_time?: string;
}

export interface Service {
  id: number;
  name: string;
  price: number;
  duration_minutes: number;
}

export interface Appointment {
  id: number;
  appointment_date: string;
  status: string;
  comment?: string;
  client_id: number;
  branch_id: number;
  employee_id: number;
  service_id: number;
  clients?: Client;
  branches?: Branch;
  employees?: Employee;
  services?: Service;
}

export type CreateClientDto = {
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
};

// ==========================================
// API ФУНКЦИИ
// ==========================================



export async function getBranches(): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('id');

  console.log('BRANCHES DATA:', data);
  console.log('BRANCHES ERROR:', error);

  if (error) {
    console.error(error);
    return [];
  }

  return (data || []).map((item: any) => ({
    id: item.id,
    address: item.address,
  }));
}

export async function getEmployeesByBranch(branchId: number): Promise<Employee[]> {
  if (!branchId) return [];
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('branch_id', branchId);
  if (error) {
    console.error('Ошибка при загрузке сотрудников:', error);
    return [];
  }
  return data || [];
}

export async function getServicesByBranch(branchId: number): Promise<Service[]> {
  if (!branchId) return [];
  // Если у вас есть связь branch_id в таблице services:
  const { data, error } = await supabase
    .from('services')
    .select('*');
    
  if (error) {
    console.error('Ошибка при загрузке услуг:', error);
    return [];
  }
  return data || [];
}

export async function getServicesByEmployee(employeeId: number): Promise<Service[]> {
  if (!employeeId) return [];
  const { data, error } = await supabase.from('services').select('*');
  if (error) return [];
  return data || [];
}

export async function getAppointments(branchId?: number): Promise<Appointment[]> {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      clients (*),
      branches (*),
      employees (*),
      services (*)
    `);

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }


  const { data, error } = await query;
  if (error) {
    console.error('Ошибка при загрузке записей:', error);
    return [];
  }
  console.log("www", data)
  return data || [];
}

export async function getClientByPhone(phone: string): Promise<Client | null> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) return null;
  return data;
}

export async function createClient(data: CreateClientDto): Promise<Client> {
  const { data: client, error } = await supabase
    .from('clients')
    .insert({
      full_name: data.fullName,
      phone: data.phone,
      email: data.email,
      note: data.note,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Клиент с такими данными уже существует.');
    }
    throw new Error('Не удалось добавить клиента.');
  }
  return client;
}

export async function getOrCreateClient(data: CreateClientDto): Promise<Client> {
  try {
    return await createClient(data);
  } catch (error: any) {
    if (error.message.includes('уже существует')) {
      const existing = await getClientByPhone(data.phone);
      if (existing) return existing;
    }
    throw error;
  }
}
export async function createAppointment(
  data: Omit<Appointment, 'id' | 'clients' | 'branches' | 'employees' | 'services'>
) {
  try {
  // Проверяем занятость сотрудника
  const { data: existingAppointment, error } = await supabase
    .from('appointments')
    .select('id')
    .eq('employee_id', data.employee_id)
    .eq('appointment_date', data.appointment_date)
    .maybeSingle();

  if (error) throw error;

  if (existingAppointment) {
    throw new Error('У сотрудника уже есть запись на это время');
  }

  const { data: appointment, error: createError } = await supabase
    .from('appointments')
    .insert(data)
    .select()
    .single();

  if (createError) throw createError;

  return appointment;

  }catch(err) {
    throw err
  }
}


export async function updateAppointment(
  id: number,
  data: {
    branch_id: number;
    employee_id: number;
    service_id: number;
    appointment_date: string;
    status: string;
    comment?: string;
  }
) {
  const { error } = await supabase
    .from('appointments')
    .update(data)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteAppointment(id: number) {
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}