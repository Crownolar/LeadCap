import { useState } from "react";

import Sidebar from "./components/Sidebar";
import RegistryUpload from "./pages/RegistryUpload";
import RegistryHistory from "./pages/RegistryHistory";
import ProductSearch from "./pages/ProductSearch";
import VerificationLogs from "./pages/VerificationLogs";
import RiskIntelligence from "./pages/RiskIntelligence";
import UsersGovernance from "./pages/UsersGovernance";

export default function NAFDACPortal() {

  const [activePage, setActivePage] = useState("upload");

  const pages = {
    upload: <RegistryUpload />,
    history: <RegistryHistory />,
    search: <ProductSearch />,
    verifications: <VerificationLogs />,
    risk: <RiskIntelligence />,
    users: <UsersGovernance />,
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1 p-6">
        {pages[activePage]}
      </main>
    </div>
  );
}