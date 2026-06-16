import React, { useEffect, useState } from 'react'
import AddLeadModal from './AddLeadModel';
import Leads from './Leads';
import { getLeads } from '../../services/LeadServices';

const LeadData = () => {


    const Empty_Form = {
        phone: "",
        name: "",
        location: "",
        state: "",
        whatsapp: "",
        email: "",
        urgency: "",
        designation: "",
        leadSource: "",
        language: "",
        units: "",
        model: "",
        notes: "",
    };


    const [formOpen, setFormOpen] = useState(false)
    const [form, setForm] = useState(Empty_Form)
    const [editing, setEditing] = useState('')
    const [leads, setLeads] = useState([]);
    const [search, setSearch] = useState('')
    const [refreshKey, setRefreshKey] = useState(0);

    const refreshDashboard = () => {
        setRefreshKey(prev => prev + 1);
    };


    const fetchLeads = async () => {
        const { data } = await getLeads();

        setLeads(data || []);
    };

    useEffect(() => {
        fetchLeads();
    }, []);


    return (
        <div>
            <Leads

                leads={leads}
                search={search}
                setSearch={setSearch}
                setEditing={setEditing}
                setForm={setForm}
                setFormOpen={setFormOpen}
            />
            <AddLeadModal

                open={formOpen}

                onClose={() => {

                    setFormOpen(false);

                    setEditing(null);

                }}

                form={form}

                setForm={setForm}

                editing={editing}
                refreshDashboard={refreshDashboard}
                fetchLeads={fetchLeads}
            />

        </div>
    )
}

export default LeadData