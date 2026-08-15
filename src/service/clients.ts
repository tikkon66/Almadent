import { supabase } from '../service/supabase';

// Добавить клиента
type CreateClientDto = {
    fullName: string;
    phone: string;
    email?: string;
    note?: string;
};
export async function createClient(data: CreateClientDto) {
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

        if (error.message.includes('permission denied')) {
            throw new Error('Нет доступа к клиентам. Проверьте права доступа.');
        }

        throw new Error('Не удалось добавить клиента.');
    }
    return client;
}


// удалить клиента
export async function deleteClient(id: number) {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.message.includes('permission denied')) {
            throw new Error('Нет доступа к удалению клиентов.');
        }

        throw new Error('Не удалось удалить клиента.');
    }

}


// изменение клиента 
export async function updateClient(
  id: number,
  data: {
    full_name: string;
    phone: string;
    email: string;
    note: string;
    is_blacklisted: boolean;
  }
) {
  const { error } = await supabase
    .from('clients')
    .update(data)
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}


// фильтрация
type GetClientsDto = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  note?: string;
  page?: number;
  limit?: number;
};

export async function getClients(filters: GetClientsDto = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 5;

  let query = supabase
    .from('clients')
    .select('*', { count: 'exact' })
    .order('id', { ascending: false });

  if (filters.id) {
    query = query.eq('id', Number(filters.id));
  }

  if (filters.fullName) {
    query = query.ilike('full_name', `%${filters.fullName}%`);
  }

  if (filters.email) {
    query = query.ilike('email', `%${filters.email}%`);
  }

  if (filters.phone) {
    query = query.ilike('phone', `%${filters.phone}%`);
  }

  if (filters.note) {
    query = query.ilike('note', `%${filters.note}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    clients: data,
    total: count ?? 0,
    page,
    limit,
    hasNext: (count ?? 0) > page * limit,
  };
}


export async function getClientsCount() {
  const { count, error } = await supabase
    .from('clients')
    .select('*', {
      count: 'exact',
      head: true,
    });

  if (error) throw error;

  return count ?? 0;
}


export async function getClientHistory(clientId: number) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      appointment_date,
      status,
      services (
        id,
        name,
        price
      ),
      employees (
        id,
        full_name
      )
    `)
    .eq('client_id', clientId)
    .order('appointment_date', { ascending: false });

  if (error) throw error;

  return data ?? [];
}