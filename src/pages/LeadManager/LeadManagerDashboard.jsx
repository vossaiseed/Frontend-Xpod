import { ActivityIcon, CircleCheckBig, Clock, Hourglass, Star, TriangleAlert, UserRoundCheck, Users } from "lucide-react";
import AddLeadModal from "./AddLeadModel.jsx";
import { useDashboard } from "../../context/DashboardContext.jsx";
import { useLeads } from "../../context/LeadContext.jsx";


const LeadManagerDashboard = () => {
    // Form modal state comes from LeadContext; dashboard stats from DashboardContext.
    const { openCreate } = useLeads();

    const {
        stats: {
            pendingReview = 0,
            vipLeads = 0,
            assignedToday = 0,
            inactive = 0,
            converted = 0,
            activeStaff = 0,
        } = {},

        pipeline: {
            pending = 0,
            new: newLeads = 0,
            discussion = 0,
            followup = 0,
            converted: pipelineConverted = 0,
            failed = 0,
        } = {},
        recentActivity = [],
        inactiveLeads = [],
        salesStaff = [],
        loading,
    } = useDashboard();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-10">
                Loading...
            </div>
        );
    }





    return (
        <div className="space-y-6">

            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">

                <div className="rounded-xl border-2 border-[#fde68a] p-4">
                    <div className="mb-2">
                        <Clock color="#db7706" size={25} className="bg-[#fde68a] p-1" />
                    </div>
                    <p className="text-2xl text-[#db7706] font-bold">{pendingReview}</p>
                    <h3 className="text-sm text-gray-500">Pending Review</h3>
                </div>

                <div className="rounded-xl border-2 border-[#e9d5ff] p-4">
                    <div className="mb-2">
                        <Star size={25} className="bg-[#e9d5ff] text-[#9333ea] p-1" />
                    </div>
                    <p className="text-2xl text-[#9333ea] font-bold">{vipLeads}</p>
                    <h3 className="text-sm text-gray-500">VIP Leads</h3>
                </div>

                <div className="rounded-xl border-2 border-[#bfdbfe] p-4">
                    <div className="mb-2">
                        <UserRoundCheck size={25} className="bg-[#bfdbfe] text-[#2563eb] p-1" />
                    </div>
                    <p className="text-2xl text-[#2563eb] font-bold">{assignedToday}</p>
                    <h3 className="text-sm text-gray-500">Assigned Today</h3>
                </div>

                <div className="rounded-xl border-2 border-[#fecaca] p-4">
                    <div className="mb-2">
                        <ActivityIcon color="#dc2626" size={25} className="bg-[#fecaca] p-1" />
                    </div>
                    <p className="text-2xl text-[#dc2626] font-bold">{inactive}</p>
                    <h3 className="text-sm text-gray-500">Inactive 48h+</h3>
                </div>

                <div className="rounded-xl border-2 border-[#bbf7d0] p-4">
                    <div className="mb-2">
                        <CircleCheckBig size={25} className="bg-[#bbf7d0] text-[#16a34a] p-1" />
                    </div>
                    <p className="text-2xl text-[#16a34a] font-bold">{converted}</p>
                    <h3 className="text-sm text-gray-500">Converted</h3>
                </div>

                <div className="rounded-xl border-2 border-[#99f6e4] p-4">
                    <div className="mb-2">
                        <Users size={25} className="bg-[#99f6e4] text-[#2c9688] p-1" />
                    </div>
                    <p className="text-2xl text-[#2c9688] font-bold">{activeStaff}</p>
                    <h3 className="text-sm text-gray-500">Active Staff</h3>
                </div>

            </div>

            {/* Lead Pipeline */}
            <div className="rounded-xl bg-white p-4 shadow">
                <h2 className="mb-4 text-lg font-semibold">Lead Pipeline</h2>

                <div className="flex flex-wrap gap-4 text-center">
                    <div className="rounded-lg border border-[#fde68a]  bg-yellow-100 px-4 py-3 text-[#db7706]">
                        <p className="text-xl font-bold">{pending}</p>
                        <p className="text-md">Pending</p>
                    </div>

                    <div className="rounded-lg border border-[#bfdbfe] text-[#2563eb]  bg-blue-100 px-6 py-3">
                        <p className="text-2xl font-bold">{newLeads}</p>
                        <p className="text-md">New</p>
                    </div>

                    <div className="rounded-lg border border-[#bfdbfe] text-[#2563eb]  bg-indigo-100 px-6 py-3">
                        <p className="text-2xl font-bold">{discussion}</p>
                        <p className="text-md">Discussion</p>
                    </div>

                    <div className="rounded-lg bg-orange-100 px-6 py-3">
                        <p className="text-2xl font-bold">{followup}</p>
                        <p className="text-md">Follow-up</p>
                    </div>

                    <div className="rounded-lg bg-green-100 px-6 py-3">
                        <p className="text-2xl font-bold">{pipelineConverted}</p>
                        <p className="text-md">Converted</p>
                    </div>

                    <div className="rounded-lg bg-red-100 px-6 py-3">
                        <p className="text-2xl font-bold">{failed}</p>
                        <p className="text-md">Failed</p>
                    </div>

                </div>
            </div>

            {/* Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* LEFT SECTION */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Inactive Leads */}
                    <div className="rounded-xl border bg-white p-6 border-[#dc2626]">
                        <h2 className="mb-4 text-lg font-semibold text-red-600">
                            Inactive Leads ({inactiveLeads.length})
                        </h2>

                        {inactiveLeads.length === 0 ? (
                            <p className="text-gray-500">No inactive leads</p>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto space-y-3">
                                {inactiveLeads.map((lead) => (
                                    <div
                                        key={lead.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">{lead.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {lead.sales_staff_name || "Unassigned"}
                                            </p>
                                        </div>

                                        <button className="rounded bg-red-500 px-3 py-1 text-white">
                                            Reassign
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sales Staff Load */}
                    <div className="rounded-xl shadow bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Sales Staff Load
                        </h2>

                        {salesStaff.length === 0 ? (
                            <p className="text-gray-500">
                                No sales staff found
                            </p>
                        ) : (
                            salesStaff.map((staff) => {
                                const percentage =
                                    staff.capacity > 0
                                        ? (staff.assigned / staff.capacity) * 100
                                        : 0;

                                return (
                                    <div key={staff.id} className="mb-4">
                                        <div className="mb-1 flex justify-between">
                                            <span className="font-medium">
                                                {staff.name}
                                            </span>

                                            <span>
                                                {staff.assigned}/{staff.capacity}
                                            </span>
                                        </div>

                                        <div className="h-2 rounded-full bg-gray-200">
                                            <div
                                                className="h-2 rounded-full bg-red-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Top Performers */}
                    <div className="rounded-xl shadow bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Top Performers
                        </h2>

                        {salesStaff
                            .sort((a, b) => (b.score || 0) - (a.score || 0))
                            .slice(0, 5)
                            .map((staff, index) => (
                                <div
                                    key={staff.id}
                                    className="mb-3 flex items-center justify-between rounded-lg border p-4"
                                >
                                    <div>
                                        <p className="font-medium">
                                            #{index + 1} {staff.name}
                                        </p>

                                        <p className="text-sm text-gray-500">
                                            {staff.assigned}/{staff.capacity}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-orange-500">
                                            {staff.score || 0}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            score
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>

                </div>

                {/* RIGHT SECTION */}
                <div className="space-y-6">

                    {/* Recent Activity */}
                    <div className="rounded-xl shadow bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Recent Activity
                        </h2>

                        {recentActivity.length === 0 ? (
                            <p className="text-gray-500">
                                No recent activity
                            </p>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto">
                                {recentActivity.map((item) => (
                                    <div
                                        key={item.id}
                                        className="mb-4 border-b pb-2"
                                    >
                                        <p className="text-sm">
                                            <span className="font-semibold">
                                                {item.user}
                                            </span>{" "}
                                            updated {item.lead}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {item.time}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="rounded-xl shadow bg-white p-6">
                        <h2 className="mb-4 text-lg font-semibold">
                            Quick Actions
                        </h2>

                        <button
                            onClick={openCreate}
                            className="mb-3 w-full rounded-lg bg-[#d97706] py-2 font-medium text-white"
                        >
                            + Add Lead
                        </button>

                        <div className="space-y-3">

                            <div className="rounded-lg shadow p-2 flex gap-2">
                                <Hourglass size={20} />
                                Pending Review ({pendingReview})
                            </div>

                            <div className="rounded-lg border border-red-200 p-2 text-red-500 flex gap-2">
                                <TriangleAlert size={20} />
                                Inactive Alerts ({inactive})
                            </div>

                            <div className="rounded-lg shadow p-2 flex gap-2">
                                <Users size={20} />
                                Sales Team ({activeStaff})
                            </div>
                        </div>
                    </div>

                </div>

            </div>


            <AddLeadModal />

        </div>
    );
};

export default LeadManagerDashboard;