import { supabase } from './supabase';

export interface EmployeeDto {
  full_name: string;
  position: string;
  branch_id: number;
  work_time: string;
}

export async function getEmployees() {
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      branches (
        id,
        address
      )
    `)
    .order('branch_id')
    .order('full_name');

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createEmployee(data: EmployeeDto) {
  const { error } = await supabase
    .from('employees')
    .insert(data);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateEmployee(
  id: number,
  data: EmployeeDto,
) {
  const { error } = await supabase
    .from('employees')
    .update(data)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteEmployee(id: number) {
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}