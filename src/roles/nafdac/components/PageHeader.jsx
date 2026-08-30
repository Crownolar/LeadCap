import { useTheme } from "../../../context/ThemeContext";

const PageHeader = ({ title, subtitle, action }) => {
  const { theme } = useTheme()

  return (
  <div className='flex items-start justify-between mb-8'>
    <div>
      <h1 className={`text-2xl font-bold ${theme.text} tracking-tight`}>
        {title}
      </h1>
      <p className={`text-sm ${theme.textMuted} mt-1`}>{subtitle}</p>
    </div>
    {action}
  </div>
  );
}
  
  

export default PageHeader;
