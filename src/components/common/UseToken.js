import { useSelector } from "react-redux";

const useApiToken = () => {
  return useSelector((state) => state.auth.token);
};

export default useApiToken;
