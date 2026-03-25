export function AuthCard({ title, description, children }) {
  return (
    <div className="p-8 rounded-[2.5rem] w-full max-w-md animate-in fade-in zoom-in duration-500 bg-[#fbf9f4]/90 backdrop-blur-3xl border border-white/60 shadow-2xl mx-auto my-auto mt-10">
      <div className="space-y-2 mb-8 text-center">
        <h2 className="text-2xl font-semibold text-[#1a1b18] tracking-tight">{title}</h2>
        {description ? <p className="text-sm text-[#8a7c74] font-medium">{description}</p> : null}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
