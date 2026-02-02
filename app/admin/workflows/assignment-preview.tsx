export default function AssignmentPreview() {
  const avatars = [
    { initials: "JD", color: "bg-emerald-500" },
    { initials: "AM", color: "bg-blue-500" },
    { initials: "SK", color: "bg-purple-500" },
    { initials: "RL", color: "bg-orange-500" },
  ];

  return (
    <div className="rounded-3xl border border-[#E3E6F3] bg-gradient-to-br from-white to-[#EEF1FA] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3">
        {avatars.map((avatar) => (
          <div
            key={avatar.initials}
            className={`h-11 w-11 rounded-full ${avatar.color} flex items-center justify-center text-white text-sm font-semibold shadow-lg`}
          >
            {avatar.initials}
          </div>
        ))}
        <div className="h-11 w-11 rounded-full bg-white shadow flex items-center justify-center text-[#1F2430]">
          +
        </div>
      </div>

      <div className="mt-6">
        <div className="relative h-1 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500" />
        <div className="relative mt-2 flex justify-between text-xs text-[#6B7280]">
          <span>Manager approval</span>
          <span>Finance review</span>
          <span className="rounded-full bg-[#4F6AFA]/10 px-3 py-1 text-[#4F6AFA]">
            + Add role
          </span>
          <span>Legal signoff</span>
        </div>
      </div>
    </div>
  );
}
