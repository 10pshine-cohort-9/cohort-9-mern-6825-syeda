const FormField = ({ label, type = "text", value, onChange, placeholder, required, minLength, autoComplete }) => {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-[#3A3F4B] mb-1.5">{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="peer w-full rounded-lg border border-[#E4E4EA] bg-white px-3.5 py-2.5 text-[#1B1F2B] placeholder:text-[#9CA0AC] outline-none transition-colors focus:border-[#FFC93C]"
        />
        <span className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-0 bg-[#FFC93C] transition-all duration-300 peer-focus:w-full rounded-full" />
      </div>
    </label>
  );
};

export default FormField;