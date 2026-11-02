import Maintenance from "@/components/common/Maintenance";
import BASE_URL from "@/config/BaseUrl";
import { createContext, useEffect, useState } from "react";

export const ContextPanel = createContext();

const AppProvider = ({ children }) => {
  const [statusCheck, setStatusCheck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkPanelStatus = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/panel-check-status`);
        const data = await response.json();

        if (data.code === 200) {
          setStatusCheck("ok");
        } else {
          setStatusCheck("maintenance");
        }
      } catch (error) {
        console.error("Error fetching panel status:", error);
        setStatusCheck("maintenance");
      } finally {
        setLoading(false);
      }
    };

    checkPanelStatus();

    const interval = setInterval(checkPanelStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div></div>;

  return (
    <ContextPanel.Provider value={{ statusCheck }}>
      {statusCheck === "ok" ? children : <Maintenance />}
    </ContextPanel.Provider>
  );
};

export default AppProvider;
