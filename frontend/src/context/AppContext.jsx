import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(false);

  const getAuthState = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
      if (data.success) {
        setIsLoggedIn(true);
        getUserData();
      } else {
        setIsLoggedIn(false);
        setUserData(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    
    getAuthState();
  }, []);

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/data");
      console.log(data);
      data.success ? setUserData(data.user) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    backendUrl,
    isLoggedIn,
    setIsLoggedIn,
    setUserData,
    userData,
    getUserData,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};
