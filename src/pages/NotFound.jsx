import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const NotFound = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-[calc(100vh-110px)] flex items-center justify-center px-4 py-12 ${theme.bg}`}>
      <div className={`w-full max-w-3xl rounded-3xl border ${theme.border} ${theme.card} p-10 shadow-sm`}>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-500">
            Page not found
          </p>
          <h1 className={`mt-6 text-7xl font-bold tracking-tight ${theme.text}`}>
            404
          </h1>
          <p className={`mx-auto mt-4 max-w-2xl text-base sm:text-lg ${theme.textMuted}`}>
            The page you are looking for doesn’t exist or may have been moved.
            Please check the URL or return to the dashboard.
          </p>

          <div className="mt-10 flex justify-center">
            <Link
              to="/"
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

export default NotFound;
