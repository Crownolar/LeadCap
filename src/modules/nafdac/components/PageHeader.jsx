const PageHeader = ({ title, subtitle, action }) => (
  <div className='flex items-start justify-between mb-8'>
    <div>
      <h1 className='text-2xl font-bold text-slate-800 tracking-tight'>
        {title}
      </h1>
      <p className='text-sm text-slate-400 mt-1'>{subtitle}</p>
    </div>
    {action}
  </div>
);

export default PageHeader;
