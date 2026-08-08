import { supabase } from './supabase'; // Укажите ваш путь к клиенту Supabase

export interface ServicePayload {
  branch_id?: number;
  name: string;
  price: number;
  duration_minutes: number;
  description: string;
}

// Получение списка услуг с филиалами через связующую таблицу branch_services
export const getServices = async () => {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      price,
      duration_minutes,
      description,
      branch_services (
        branch_id,
        branches (
          id,
          address
        )
      )
    `);

  if (error) {
    console.error('Ошибка при получении услуг:', error);
    throw error;
  }

  // Преобразуем плоскую структуру под интерфейс компонента
  return (data || []).map((service: any) => {
    const branchInfo = service.branch_services?.[0]?.branches || {
      id: 0,
      address: 'Без филиала',
    };
    const branchId = service.branch_services?.[0]?.branch_id || 0;

    return {
      id: service.id,
      name: service.name,
      price: service.price,
      duration_minutes: service.duration_minutes,
      description: service.description,
      branch_id: branchId,
      branches: branchInfo,
    };
  });
};

// Получение списка филиалов для селекта в модальном окне
export const getBranches = async () => {
  const { data, error } = await supabase.from('branches').select('id, address');
  if (error) throw error;
  return data || [];
};

// Создание услуги + привязка к филиалу через branch_services
export const createService = async (payload: ServicePayload) => {
  const { data: newService, error: serviceError } = await supabase
    .from('services')
    .insert([
      {
        name: payload.name,
        price: payload.price,
        duration_minutes: payload.duration_minutes,
        description: payload.description,
      },
    ])
    .select()
    .single();

  if (serviceError) throw serviceError;

  if (payload.branch_id && payload.branch_id > 0) {
    const { error: relationError } = await supabase
      .from('branch_services')
      .insert([
        {
          service_id: newService.id,
          branch_id: payload.branch_id,
        },
      ]);

    if (relationError) throw relationError;
  }

  return newService;
};

// Обновление услуги + обновление привязки к филиалу
export const updateService = async (id: number, payload: ServicePayload) => {
  const { error: serviceError } = await supabase
    .from('services')
    .update({
      name: payload.name,
      price: payload.price,
      duration_minutes: payload.duration_minutes,
      description: payload.description,
    })
    .eq('id', id);

  if (serviceError) throw serviceError;

  if (payload.branch_id) {
    await supabase.from('branch_services').delete().eq('service_id', id);

    if (payload.branch_id > 0) {
      await supabase.from('branch_services').insert([
        {
          service_id: id,
          branch_id: payload.branch_id,
        },
      ]);
    }
  }
};

// Удаление услуги (каскадно удалятся и записи из branch_services при каскадных ключах)
export const deleteService = async (id: number) => {
  const { error } = await supabase.from('services').delete().eq('id', id);
  if (error) throw error;
};