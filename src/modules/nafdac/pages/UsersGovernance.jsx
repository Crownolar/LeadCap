import Table from "../components/Table";
import Badge from "../components/Badge";
import Btn from "../components/Btn";
import { mockUsers } from "../data/mockData";
import PageHeader from "../components/PageHeader";
import { useState } from "react";

// GET /api/users is restricted to SUPER_ADMIN/HEAD_RESEARCHER; NAFDAC roles cannot list users. Using mock data until a NAFDAC user list endpoint exists.
const UsersGovernance = () => {
  const [showInvite, setShowInvite] = useState(false);

  return (
    <div>
      <PageHeader
        title="Users & Permissions"
        subtitle="Manage access, roles, and governance. Full audit trail of who did what."
        action={<Btn variant="primary" icon="plus" onClick={() => setShowInvite(!showInvite)}>Invite User</Btn>}
      />

      {showInvite && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-6">
          <p className="font-semibold text-emerald-800 text-sm mb-3">Invite New User</p>
          <div className="flex gap-3">
            <input placeholder="Email address" className="flex-1 text-sm border border-emerald-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-300 bg-white" />
            <select className="text-sm border border-emerald-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
              <option>POLICY_MAKER_NAFDAC</option>
              <option>LAB_ANALYST</option>
              <option>SUPERVISOR</option>
              <option>HEAD_RESEARCHER</option>
            </select>
            <Btn variant="primary">Send Invite</Btn>
            <Btn variant="ghost" onClick={() => setShowInvite(false)}>Cancel</Btn>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <Table
          headers={["User", "Role", "Last Active", "Status", "Actions"]}
          rows={mockUsers.map(u => [
            <div>
              <p className="font-semibold text-slate-700 text-sm">{u.name}</p>
              <p className="text-xs text-slate-400">{u.email}</p>
            </div>,
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{u.role}</span>,
            <span className="text-xs text-slate-400">{u.lastActive}</span>,
            <Badge status={u.status} />,
            <div className="flex gap-1">
              <Btn variant="ghost" icon="eye" small>Activity</Btn>
              <Btn variant="ghost" small>Edit Role</Btn>
            </div>,
          ])}
        />
      </div>
    </div>
  );
};

export default UsersGovernance;