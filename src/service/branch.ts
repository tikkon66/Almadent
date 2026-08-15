import { supabase } from '../service/supabase';

// Добавить филиал
type BranchDto = {
    address: string;
};

export async function createBranch(data: BranchDto) {
    const { data: branch, error } = await supabase
        .from('branches')
        .insert({
            address: data.address,
        })
        .select()
        .single();

    if (error) {
        throw new Error('Не удалось создать филиал.');
    }

    return branch;
}


// изменить филиалs
export async function updateBranch(
    id: number,
    data: BranchDto,
) {
    try {
        const { error } = await supabase
            .from('branches')
            .update({
                address: data.address,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error('Не удалось обновить филиал.');
        }

    } catch (err) {
        throw err
    }
}

// удалить филиал
export async function deleteBranch(id: number) {
    const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

    if (error) {
        throw new Error('Не удалось удалить филиал.');
    }

    return true;
}


// получить все филиалы
export async function getBranches() {
    const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('id');

    if (error) {
        throw new Error('Не удалось получить филиалы.');
    }

    return data;
}


// получить филиалы по id
export async function getBranchById(id: number) {
    const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        throw new Error('Филиал не найден.');
    }

    return data;
}