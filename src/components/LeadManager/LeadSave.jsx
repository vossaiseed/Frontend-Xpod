// import { X, Save } from "lucide-react";
// import { useLeads } from "../../context/LeadContext.jsx";

// const Field = ({ label, name, value, onChange }) => (
//   <div>
//     <label className="mb-1 block text-xs font-medium text-gray-500">
//       {label}
//     </label>
//     <input
//       name={name}
//       value={value || ""}
//       onChange={onChange}
//       className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:bg-white"
//     />
//   </div>
// );

// const LeadSave = () => {
//   const { formOpen, editing, form, setForm, closeForm, saveLead } = useLeads();

//   if (!formOpen || !editing) return null;

//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     await saveLead();
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
//       <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
//         <div className="flex items-center justify-between border-b px-5 py-4">
//           <h2 className="text-base font-bold text-gray-900">
//             Edit Lead — {form.name}
//           </h2>

//           <button onClick={closeForm} className="rounded-full bg-gray-100 p-2">
//             <X size={18} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-6 p-5">
//           <section>
//             <h3 className="mb-3 font-semibold text-gray-800">
//               Client Information
//             </h3>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <Field label="Client Name" name="name" value={form.name} onChange={handleChange} />
//               <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} />
//               <Field label="WhatsApp" name="whatsapp" value={form.whatsapp} onChange={handleChange} />
//               <Field label="Email" name="email" value={form.email} onChange={handleChange} />
//               <Field label="Location" name="location" value={form.location} onChange={handleChange} />
//               <Field label="State" name="state" value={form.state} onChange={handleChange} />
//             </div>
//           </section>

//           <section>
//             <h3 className="mb-3 font-semibold text-gray-800">Lead Details</h3>

//             <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//               <Field label="Designation" name="designation" value={form.designation} onChange={handleChange} />
//               <Field label="Primary Language" name="language" value={form.language} onChange={handleChange} />
//               <Field label="Urgency" name="urgency" value={form.urgency} onChange={handleChange} />
//               <Field label="Quantity" name="units" value={form.units} onChange={handleChange} />
//               <Field label="Lead Source" name="leadSource" value={form.leadSource} onChange={handleChange} />
//               <Field label="Model Details" name="model" value={form.model} onChange={handleChange} />
//             </div>
//           </section>

//           <section>
//             <h3 className="mb-3 font-semibold text-gray-800">Notes</h3>

//             <textarea
//               name="notes"
//               value={form.notes || ""}
//               onChange={handleChange}
//               className="min-h-[90px] w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-orange-400 focus:bg-white"
//             />
//           </section>

//           <div className="grid grid-cols-2 gap-3">
//             <button
//               type="button"
//               onClick={closeForm}
//               className="rounded-xl border px-4 py-2.5 text-sm font-medium"
//             >
//               Cancel
//             </button>

//             <button className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white">
//               <Save size={16} />
//               Save Changes
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LeadSave;