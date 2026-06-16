import { supabase } from "../components/supabase/supabaseConnection";

export const createLead = async (leadData) => {
    return await supabase
        .from("leads")
        .insert([leadData])
        .select()
        .single();
};

export const getLeads = async () => {
    return await supabase
        .from("leads")
        .select("*")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
};

export const updateLead = async (id, data) => {
    return await supabase
        .from("leads")
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);
};