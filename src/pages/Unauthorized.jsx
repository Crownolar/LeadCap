import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const Unauthorized = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-[calc(100vh-110px)] flex items-center justify-center px-4 py-12 ${theme.bg}`}
    >
      <div
        className={`w-full max-w-3xl rounded-3xl border ${theme.border} ${theme.card} p-10 shadow-sm`}
      >
        <div className='text-center'>
          <p className='text-sm font-semibold uppercase tracking-[0.35em] text-red-500'>
            Unauthorized
          </p>
          <h1
            className={`mt-6 text-6xl font-bold tracking-tight ${theme.text}`}
          >
            Access denied
          </h1>
          <p
            className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${theme.textMuted}`}
          >
            You do not have permission to view this page. If you believe this is
            an error, please contact your administrator or return to the home
            page.
          </p>

          <div className='mt-10 flex justify-center gap-3'>
            <Link
              to='/'
              className={`inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold transition duration-200 ${theme.emerald} ${theme.hover}`}
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
