import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { hostUrl } from "../utils/constant";
import { url } from "../utils/url";
import withSessionContext from "../HOC/withSessionContext";

const SessionContext = createContext();

export const SessionContextConsumer = SessionContext.Consumer;

const initialState = {
  spinner: 0,
  notifications: [],
  userInfo: null,
  logininPlantData: null,
  jwt1: "",
  accessToken: null,
};



const SessionProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const savedState = sessionStorage.getItem("sessionState");
    return savedState ? JSON.parse(savedState) : initialState;
  });

  useEffect(() => {
    sessionStorage.setItem("sessionState", JSON.stringify(state));
  }, [state]);

  const _setState = (next, cb) => {
    if (typeof next === "function") {
      setState((prev) => {
        const newState = next(prev);
        cb && cb(newState);
        return newState;
      });
    } else {
      setState((prev) => {
        const newState = { ...prev, ...next };
        cb && cb(newState);
        return newState;
      });
    }
  };

  const startSpinner = useCallback(
    (callback) => {
      setState((prev) => {
        const newState = { ...prev, spinner: 1 };
        callback && callback();
        return newState;
      });
    },
    [setState]
  );

  const stopSpinner = useCallback(() => {
    setState((prev) => {
      let spinner = prev.spinner;
      let nextState = --spinner;
      if (nextState < 0) {
        nextState = 0;
      }
      return { ...prev, spinner: nextState };
    });
  }, [setState]);

  const showNotification = useCallback(
    ({ message, type }) => {
      const toastType = {
        success: toast.success,
        warning: toast.warning,
        info: toast.info,
        error: toast.error,
      };
      toastType[type](message, {
        autoClose: 2200,
        closeButton: false,
      });
    },
    [toast]
  );

  const sessionStorageSet = (key, val) => {
    try {
      sessionStorage.setItem(key, val);
    } catch (e) {
      console.error("-------- failed to set to session storage:", e);
    }
  };

  const sessionStorageGet = (key) => {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.error("--------- failed to get from session storage:", e);
    }
  };

  const resetState = () => {
    setState(initialState);
  };





  console.log("")
  // const navigate = useNavigate();

  const signout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setState(initialState);
    // navigate("/");
    window.location.href = "/";
  };

  const apiCall = useCallback(
    async ({ url, data, contentType, method = "POST" }) => {
      const accessToken = sessionStorageGet("accessToken") || "";
      const headers = {
        "Content-Type": contentType || "application/json",
        Accept: "*/*",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      };

      try {
        const response = await fetch(`${hostUrl}${url}`, {
          method,
          headers,
          body: data ? JSON.stringify(data) : null,
          referrer: "no-referrer",
        });

        if (response.status === 401) {
          toast.error("Session Closed!");
          signout();
          return;
        }

        const res = await response.json().catch(() => response);
        return res;
      } catch (e) {
        toast.error("Session Closed!");
        signout();
        throw e;
      }
    },
    [signout]
  );

  const post = (params) => apiCall({ ...params, method: "POST" });
  const put = (params) => apiCall({ ...params, method: "PUT" });
  const get = (url) => apiCall({ url, method: "GET" });
  const del = (url) => apiCall({ url, method: "DELETE" });

  return (
    <SessionContext.Provider
      value={{
        ...state,
        _setState,
        startSpinner,
        stopSpinner,
        showNotification,
        sessionStorageSet,
        sessionStorageGet,
        resetState,
        post,
        put,
        get,
        del,
        signout,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export default withSessionContext(SessionProvider);
