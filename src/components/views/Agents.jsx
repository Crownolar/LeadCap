import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSamples } from "../../redux/slice/samplesSlice";
import { useTheme } from "../../hooks/useTheme";

const Agents = ({ theme: propTheme, samples: propSamples }) => {
  const dispatch = useDispatch();
  const { theme: hookTheme } = useTheme();
  const { samples: reduxSamples } = useSelector((state) => state.samples);

  // Use props if provided, otherwise fall back to Redux
  const theme = propTheme || hookTheme;
  const samples = propSamples || reduxSamples || [];

  // Fetch samples on mount if not provided via props
  useEffect(() => {
    if (!propSamples) {
      dispatch(fetchSamples());
    }
  }, [dispatch, propSamples]);

  return (
    <div
      className={`${theme?.card} ${theme?.text} rounded-lg shadow-md p-6 border ${theme?.border}`}
    >
      <h2 className="text-xl font-semibold mb-4">Field Agents</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {["Kwara", "Kano", "Nasarawa", "Lagos"].map((state, idx) => (
          <div key={state} className={`p-4 border ${theme?.border} rounded-lg`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                {state[0]}
              </div>
              <div>
                <h3 className="font-semibold">Agent {idx + 1}</h3>
                <p className={`text-sm ${theme?.textMuted}`}>{state} State</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme?.textMuted}>Samples Collected:</span>
                <span className="font-semibold">
                  {samples?.filter((s) => s.state?.name === state).length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={theme?.textMuted}>Status:</span>
                <span className="text-green-500 font-semibold">Active</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Agents;
