import ProductSearch from "../pages/ProductSearch";
import RegistryHistory from "../pages/RegistryHistory";
import RegistryUpload from "../pages/RegistryUpload";
import RiskIntelligence from "../pages/RiskIntelligence";
import UsersGovernance from "../pages/UsersGovernance";
import VerificationLogs from "../pages/VerificationLogs";

const navItems = [
  { id: "upload", label: "Registry Upload", icon: "upload", page: RegistryUpload },
  { id: "history", label: "Registry History", icon: "history", page: RegistryHistory },
  { id: "search", label: "Product Search", icon: "search", page: ProductSearch },
  { id: "verifications", label: "Verification Logs", icon: "activity", page: VerificationLogs },
  { id: "risk", label: "Risk Intelligence", icon: "shield", page: RiskIntelligence },
  { id: "users", label: "Users & Access", icon: "users", page: UsersGovernance },
];

export default navItems;