import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../redux/slice/samplesSlice";

const normalizeRole = (role = "") => role.toLowerCase().replace(/[\s_]/g, "");

const ROLE_LOADERS = {
  datacollector: (dispatch) => {
    dispatch(fetchSamples({ page: 1, limit: 5000 }));
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
};

export default function useRoleDataLoader(currentUser) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { hasFetched } = useSelector((s) => s.samples);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || hasFetched) return;

    const role = normalizeRole(currentUser.role);
    const loader = ROLE_LOADERS[role];

    if (loader) loader(dispatch);
  }, [dispatch, isAuthenticated, currentUser, hasFetched]);
}
