import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../redux/slice/samplesSlice";

export const normalizeRole = (role = "") =>
  role.toLowerCase().replace(/[\s_]/g, "");

const ROLE_LOADERS = {
  datacollector: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 50 }));
  },

  supervisor: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 5000 }));
  },

  labanalyst: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 5000 }));
  },

  superadmin: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 5000 }));
  },

  headresearcher: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 5000 }));
  },
};

export default function useRoleDataLoader(currentUser) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const role = normalizeRole(currentUser.role);
    const loader = ROLE_LOADERS[role];

    if (loader) loader(dispatch);
  }, [dispatch, isAuthenticated, currentUser]);
}
