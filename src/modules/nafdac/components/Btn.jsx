import Icon from "../components/icons/Icon";
import { icons } from "../utils/icons";
const Btn = ({ children, variant = "primary", onClick, icon, small, disabled }) => {
  const base = `inline-flex items-center gap-2 font-semibold rounded-xl transition-all ${small ? "text-xs px-3 py-1.5" : "text-sm px-4 py-2.5"} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`;
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200",
    outline: "border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 bg-white",
    danger: "bg-red-500 text-white hover:bg-red-600",
    ghost: "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50",
  };
  return (
    <button type="button" className={`${base} ${variants[variant]}`} onClick={onClick} disabled={disabled}>
      {icon && <Icon d={icons[icon]} size={14} />}
      {children}
    </button>
  );
};

export default Btn;