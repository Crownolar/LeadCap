import { icons } from "../utils/icons";
import Icon from "./icons/Icon";
import navItems from "../config/navItems";

const iconMap = {
  upload: icons.upload,
  history: icons.history,
  search: icons.search,
  activity: icons.activity,
  shield: icons.shield,
  users: icons.users,
};

export default function Sidebar({ setActivePage, activePage }) {
  return (
    <aside className="w-56 border-r border-slate-100 bg-white flex-shrink-0">
      <div className="p-4 border-b border-slate-50">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">NAFDAC Portal</p>
      </div>
      <nav className="p-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
              activePage === item.id
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Icon d={iconMap[item.icon] || icons.upload} size={18} className="flex-shrink-0" />
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
