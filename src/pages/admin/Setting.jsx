import { useEffect, useState } from "react";
import {
    Lock, Phone, Plus, Trash2, Users, Sparkles, Save,
    Sliders, ChevronUp, ChevronDown, MessageCircle,
    SparklesIcon,
    Info,
} from "lucide-react";
import {
    getSettings,
    updateSettings,
    getSources,
    createSource,
    deleteSource,
} from "../../api/settings";
import { changePassword, changePhone } from "../../api/auth";

const Card = ({ title, icon: Icon, children }) => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
            {Icon && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                    <Icon size={16} />
                </span>
            )}
            <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

const Field = ({ label, ...rest }) => (
    <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
        <input
            {...rest}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400"
        />
    </label>
);

const Banner = ({ type, msg }) =>
    msg ? (
        <div
            className={`rounded-xl px-3 py-2 text-sm ${type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                }`}
        >
            {msg}
        </div>
    ) : null;

const Toggle = ({ checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-orange-500" : "bg-gray-300"
            }`}
        aria-pressed={checked}
    >
        <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[1.375rem]" : "left-0.5"
                }`}
        />
    </button>
);

// One advanced-setting row: title + description on the left, control on the right.
const SettingRow = ({ icon: Icon, title, desc, children }) => (
    <div className="flex items-start justify-between gap-4 border-b border-gray-50 py-4 last:border-0">
        <div className="flex items-start gap-3">
            {Icon && <Icon size={18} className="mt-0.5 shrink-0 text-gray-400" />}
            <div>
                <p className="text-sm font-medium text-gray-900">{title}</p>
                {desc && <p className="text-xs text-gray-500">{desc}</p>}
            </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
);

const Setting = () => {
    const [settings, setSettings] = useState({
        lead_assignment_mode: "pool",
        call_number: "",
        whatsapp_number: "",
        whatsapp_message: "",
        // Advanced
        auto_whatsapp_welcome: false,
        require_lead_manager_review: true,
        inactivity_alert_enabled: true,
        inactivity_alert_hours: 48,
        max_active_leads_per_staff: 100,
        lead_reassignment_permission: "lead_manager",
        lead_delete_protection: true,
    });
    const [advancedOpen, setAdvancedOpen] = useState(true);
    const [sources, setSources] = useState([]);
    const [newSource, setNewSource] = useState("");

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
    const [pwdMsg, setPwdMsg] = useState({ type: "", msg: "" });

    const [phone, setPhone] = useState({ newPhone: "", current: "" });
    const [phoneMsg, setPhoneMsg] = useState({ type: "", msg: "" });

    const [crmMsg, setCrmMsg] = useState({ type: "", msg: "" });
    const [contactMsg, setContactMsg] = useState({ type: "", msg: "" });

    const load = async () => {
        const [s, src] = await Promise.all([getSettings(), getSources()]);
        setSettings((p) => ({ ...p, ...s }));
        setSources(Array.isArray(src) ? src : []);
    };

    useEffect(() => {
        load();
    }, []);

    const set = (k, v) => setSettings((p) => ({ ...p, [k]: v }));

    const saveCrm = async () => {
        setCrmMsg({ type: "", msg: "" });
        try {
            await updateSettings({
                lead_assignment_mode: settings.lead_assignment_mode,
                auto_whatsapp_welcome: settings.auto_whatsapp_welcome,
                require_lead_manager_review: settings.require_lead_manager_review,
                inactivity_alert_enabled: settings.inactivity_alert_enabled,
                inactivity_alert_hours: Number(settings.inactivity_alert_hours) || 0,
                max_active_leads_per_staff: Number(settings.max_active_leads_per_staff) || 0,
                lead_reassignment_permission: settings.lead_reassignment_permission,
                lead_delete_protection: settings.lead_delete_protection,
            });
            setCrmMsg({ type: "ok", msg: "CRM settings saved." });
        } catch (e) {
            setCrmMsg({ type: "error", msg: e.message });
        }
    };

    const saveContact = async () => {
        setContactMsg({ type: "", msg: "" });
        try {
            await updateSettings({
                call_number: settings.call_number,
                whatsapp_number: settings.whatsapp_number,
                whatsapp_message: settings.whatsapp_message,
            });
            setContactMsg({ type: "ok", msg: "Contact settings saved." });
        } catch (e) {
            setContactMsg({ type: "error", msg: e.message });
        }
    };

    const addSource = async () => {
        const name = newSource.trim();
        if (!name) return;
        try {
            await createSource(name);
            setNewSource("");
            setSources(await getSources());
        } catch {
            /* ignore */
        }
    };

    const removeSource = async (id) => {
        await deleteSource(id);
        setSources((p) => p.filter((s) => s.id !== id));
    };

    const submitPassword = async (e) => {
        e.preventDefault();
        setPwdMsg({ type: "", msg: "" });
        if (pwd.next.length < 6)
            return setPwdMsg({ type: "error", msg: "New password must be at least 6 characters" });
        if (pwd.next !== pwd.confirm)
            return setPwdMsg({ type: "error", msg: "Passwords do not match" });
        try {
            await changePassword(pwd.current, pwd.next);
            setPwd({ current: "", next: "", confirm: "" });
            setPwdMsg({ type: "ok", msg: "Password updated." });
        } catch (e) {
            setPwdMsg({ type: "error", msg: e.message });
        }
    };

    const submitPhone = async (e) => {
        e.preventDefault();
        setPhoneMsg({ type: "", msg: "" });
        try {
            await changePhone(phone.newPhone, phone.current);
            setPhone({ newPhone: "", current: "" });
            setPhoneMsg({ type: "ok", msg: "Phone updated. Use it to log in next time." });
        } catch (e) {
            setPhoneMsg({ type: "error", msg: e.message });
        }
    };

    const ModeCard = ({ mode, title, desc, icon: Icon }) => {
        const active = settings.lead_assignment_mode === mode;
        return (
            <button
                type="button"
                onClick={() => set("lead_assignment_mode", mode)}
                className={`flex-1 rounded-xl border p-4 text-left transition-colors ${active ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:bg-gray-50"
                    }`}
            >
                <div className="flex items-center gap-2 font-semibold text-gray-900">
                    <Icon size={16} className="text-orange-600" />
                    {title}
                    {active && mode === "pool" && (
                        <span className="ml-auto rounded-md bg-orange-600 px-2 py-0.5 text-xs text-white">
                            Default
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
            </button>
        );
    };

    return (
        <div className="mx-auto max-w-2xl space-y-5">
            <h2 className="text-lg font-semibold text-gray-900">Settings</h2>

            {/* Lead Assignment Control */}
            <Card title="Lead Assignment Control" icon={Users}>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <ModeCard
                        mode="pool"
                        title="Lead Pool"
                        desc="New leads go into the Lead Pool. Sales staff manually claim the leads they want."
                        icon={Users}
                    />
                    <ModeCard
                        mode="auto"
                        title="Automatic Assignment"
                        desc="Leads auto-route to the best-matched staff by capacity, performance & VIP capability."
                        icon={SparklesIcon}
                    />
                </div>
                <div
                    className={`mt-4 rounded-xl border p-4 flex items-start gap-3 ${settings.lead_assignment_mode === "pool"
                        ? "border-amber-300 bg-amber-50 text-amber-800"
                        : "border-blue-300 bg-blue-50 text-blue-800"
                        }`}
                >
                    <Info className="mt-0.5 h-5 w-5" />

                    <div>
                        <p className="font-semibold text-xs">
                            {settings.lead_assignment_mode === "pool"
                                ? "Lead Pool is active."
                                : "Automatic Assignment is active."}
                        </p>

                        <p className="text-xs">
                            {settings.lead_assignment_mode === "pool"
                                ? "Lead Pool tab will be visible in Admin & Sales dashboards. Sales staff can manually claim leads."
                                : "Lead Pool tab will be hidden. New leads will be automatically assigned to suitable sales staff."}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Advanced Settings */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <button
                    type="button"
                    onClick={() => setAdvancedOpen((o) => !o)}
                    className="flex w-full items-center justify-between"
                >
                    <span className="flex items-center gap-2 font-semibold text-gray-900">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600">
                            <Sliders size={16} />
                        </span>
                        Advanced Settings
                    </span>
                    {advancedOpen ? (
                        <ChevronUp size={18} className="text-gray-400" />
                    ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                    )}
                </button>

                {advancedOpen && (
                    <div className="mt-3">
                        <SettingRow
                            icon={MessageCircle}
                            title="Auto WhatsApp Welcome"
                            desc="Automatically send a welcome WhatsApp message to the client after assignment."
                        >
                            <Toggle checked={!!settings.auto_whatsapp_welcome} onChange={(v) => set("auto_whatsapp_welcome", v)} />
                        </SettingRow>

                        <SettingRow
                            title="Require Lead Manager Review"
                            desc="Lead must pass Lead Manager review before being assigned to sales staff."
                        >
                            <Toggle checked={!!settings.require_lead_manager_review} onChange={(v) => set("require_lead_manager_review", v)} />
                        </SettingRow>

                        <SettingRow
                            title="Inactivity Alert"
                            desc="Notify Lead Manager if no updates happen within the selected hours."
                        >
                            <Toggle checked={!!settings.inactivity_alert_enabled} onChange={(v) => set("inactivity_alert_enabled", v)} />
                            <input
                                type="number"
                                value={settings.inactivity_alert_hours}
                                onChange={(e) => set("inactivity_alert_hours", e.target.value)}
                                disabled={!settings.inactivity_alert_enabled}
                                className="w-16 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-orange-400 disabled:bg-gray-50"
                            />
                            <span className="text-xs text-gray-400">hrs</span>
                        </SettingRow>

                        <SettingRow
                            title="Max Active Leads Per Staff"
                            desc="Maximum number of active leads allowed per sales staff member."
                        >
                            <input
                                type="number"
                                value={settings.max_active_leads_per_staff}
                                onChange={(e) => set("max_active_leads_per_staff", e.target.value)}
                                className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                            />
                        </SettingRow>

                        <SettingRow
                            title="Lead Reassignment Permission"
                            desc="Who is allowed to reassign leads to different sales staff."
                        >
                            <select
                                value={settings.lead_reassignment_permission}
                                onChange={(e) => set("lead_reassignment_permission", e.target.value)}
                                className="rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-orange-400"
                            >
                                <option value="lead_manager">Only Lead Manager</option>
                                <option value="admin">Only Admin</option>
                                <option value="both">Admin & Lead Manager</option>
                            </select>
                        </SettingRow>

                        <SettingRow
                            title="Lead Delete Protection"
                            desc="ON — Deleted items move to Trash and can be restored later. No permanent deletion."
                        >
                            <Toggle checked={!!settings.lead_delete_protection} onChange={(v) => set("lead_delete_protection", v)} />
                        </SettingRow>
                    </div>
                )}
            </div>

            {/* Save CRM Settings */}
            <div>
                <Banner type={crmMsg.type} msg={crmMsg.msg} />
                <button
                    onClick={saveCrm}
                    className="mt-2 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                    <Save size={15} /> Save CRM Settings
                </button>
            </div>

            {/* Lead Sources */}
            <Card title="Lead Sources">
                <div className="space-y-2">
                    {sources.length === 0 ? (
                        <p className="text-sm text-gray-400">No lead sources yet.</p>
                    ) : (
                        sources.map((s) => (
                            <div key={s.id} className="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2 text-sm">
                                <span className="text-gray-800">{s.name}</span>
                                <button
                                    onClick={() => removeSource(s.id)}
                                    className="text-gray-400 hover:text-red-500"
                                    aria-label="Remove source"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
                <div className="mt-3 flex gap-2">
                    <input
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addSource()}
                        placeholder="Add a lead source"
                        className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                    <button
                        onClick={addSource}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                        <Plus size={15} /> Add Source
                    </button>
                </div>
            </Card>

            {/* Change Admin Password */}
            <Card title="Change Admin Password" icon={Lock}>
                <form onSubmit={submitPassword} className="space-y-3">
                    <Banner type={pwdMsg.type} msg={pwdMsg.msg} />
                    <Field label="Current Password" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} required />
                    <Field label="New Password" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} required />
                    <Field label="Confirm New Password" type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} required />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                        <Lock size={15} /> Update Password
                    </button>
                </form>
            </Card>

            {/* Change Admin Phone */}
            <Card title="Change Admin Phone Number" icon={Phone}>
                <form onSubmit={submitPhone} className="space-y-3">
                    <p className="text-xs text-gray-500">This is the phone number used to log in as admin.</p>
                    <Banner type={phoneMsg.type} msg={phoneMsg.msg} />
                    <Field label="New Phone Number" value={phone.newPhone} onChange={(e) => setPhone({ ...phone, newPhone: e.target.value })} required />
                    <Field label="Current Password" type="password" value={phone.current} onChange={(e) => setPhone({ ...phone, current: e.target.value })} required />
                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700">
                        <Phone size={15} /> Update Phone
                    </button>
                </form>
            </Card>

            {/* Contact Button Settings */}
            <Card title="Contact Button Settings">
                <div className="space-y-3">
                    <Banner type={contactMsg.type} msg={contactMsg.msg} />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Call Number" value={settings.call_number || ""} onChange={(e) => set("call_number", e.target.value)} placeholder="9195260XXXXX" />
                        <Field label="WhatsApp Number" value={settings.whatsapp_number || ""} onChange={(e) => set("whatsapp_number", e.target.value)} placeholder="9195260XXXXX" />
                    </div>
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-gray-700">Default WhatsApp Message</span>
                        <textarea
                            rows={3}
                            value={settings.whatsapp_message || ""}
                            onChange={(e) => set("whatsapp_message", e.target.value)}
                            placeholder="Hello XPOD, I want to know more."
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-orange-400"
                        />
                    </label>
                    <button
                        onClick={saveContact}
                        className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                    >
                        <Save size={15} /> Save Settings
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Setting;
