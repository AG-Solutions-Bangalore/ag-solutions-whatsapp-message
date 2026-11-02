import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const useAuth = () => {
  const [authData, setAuthData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const id = useSelector((state) => state.auth.id);
  const name = useSelector((state) => state.auth.name);
  const userType = useSelector((state) => state.auth.user_type);
  const email = useSelector((state) => state.auth.email);
  const token = useSelector((state) => state.auth.token);
  useEffect(() => {
    const userData = {
      id: id,
      name: name,
      userType: userType,
      email: email,
    };

    if (token) {
      setAuthData({ user: userData });
    } else {
      setAuthData({ user: null });
    }

    setIsLoading(false);
  }, []);

  return { data: authData, isLoading };
};

export default useAuth;
