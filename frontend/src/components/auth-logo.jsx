import Image from "next/image";
import Link from "next/link";

export function AuthLogo({ size = 80, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-4 mb-8 animate-in fade-in slide-in-from-top duration-700">
      <Link href="/" className="relative group">
        <div className="absolute inset-0 bg-[#174830]/10 rounded-full blur-2xl group-hover:bg-[#174830]/20 transition-colors" />
        <Image 
          src="/logo.jpg" 
          alt="VainyBliss" 
          width={size} 
          height={size} 
          className="relative rounded-full border-2 border-white shadow-xl group-hover:scale-105 transition-transform duration-500"
        />
      </Link>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold text-[#174830] tracking-tighter">VainyBliss</h1>
        {subtitle && <p className="text-xs font-bold text-[#8a7c74] uppercase tracking-widest mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
