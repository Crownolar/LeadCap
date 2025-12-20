const StatCard = ({ icon: Icon, label, value, color, subtext, theme }) => (
  <div
    className={`${theme?.card || ""} rounded-lg shadow-md p-6 border ${
      theme?.border || ""
    } ${theme?.text}`}
  >
    <div className='flex items-center justify-between [@media(max-width:400px)]:flex-col '>
      <div className='[@media(max-width:400px)]:text-center [@media(max-width:400px)]:mb-3'>
        <p className={`text-sm ${theme?.textMuted || ""} font-medium`}>
          {label}
        </p>
        <p className={`text-3xl font-bold mt-2 ${theme?.text || ""}`}>
          {value}
        </p>
        {subtext && (
          <p className={`text-xs ${theme?.textMuted || ""} mt-1`}>{subtext}</p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className='w-8 h-8 text-white' />
      </div>
    </div>
  </div>
);

export default StatCard;
