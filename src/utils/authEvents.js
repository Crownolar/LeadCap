export const AUTH_LOGOUT_EVENT = "leadcap:auth-logout";

export const emitAuthLogout = () => {
  window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
};