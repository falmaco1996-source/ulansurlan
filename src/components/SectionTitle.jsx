export default function SectionTitle({ icon: Icon, title, desc }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="mt-1 rounded-2xl bg-[#007744]/10 p-2">
        <Icon className="h-5 w-5 text-[#007744]" />
      </div>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {desc ? <p className="mt-1 text-sm text-slate-600">{desc}</p> : null}
      </div>
    </div>
  );
}
