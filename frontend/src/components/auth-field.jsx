export function AuthField({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required = false,
  helperText,
  icon,
  suffix,
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-[#8a7c74] uppercase tracking-wider ml-2">
          {label}
        </label>
      )}
      <div className="relative group">
        {icon && (
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8a7c74] group-focus-within:text-[#1a4731] transition-colors">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-full bg-[rgba(255,255,255,0.7)] border border-white/80 shadow-inner py-3.5 transition-all text-[#3c312d] text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 font-medium ${
            icon ? "pl-12 pr-5" : "px-5"
          }`}
        />
        {suffix && <span className="absolute right-5 top-1/2 -translate-y-1/2">{suffix}</span>}
      </div>
      {helperText && <p className="text-[10px] text-[#8a7c74] font-medium ml-2">{helperText}</p>}
    </div>
  );
}
