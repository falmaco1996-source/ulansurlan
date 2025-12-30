export default function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#007744]/10 px-3 py-1 text-xs font-semibold text-[#005A32]">
      {children}
    </span>
  );
}
