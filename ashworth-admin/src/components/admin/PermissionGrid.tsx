import type { PermissionMap } from "@/types/admin";

const PAGE_ROWS: { page: keyof PermissionMap; label: string; actions: string[] }[] = [
  { page: "users", label: "Users", actions: ["view", "add", "update", "delete", "verifyDocuments", "approveMembership"] },
  { page: "clubs", label: "Clubs", actions: ["view", "add", "update", "delete"] },
  { page: "payments", label: "Payments", actions: ["view"] },
  { page: "settings", label: "Settings", actions: ["view", "update"] },
];

const ACTION_LABELS: Record<string, string> = {
  view: "View",
  add: "Add",
  update: "Update",
  delete: "Delete",
  verifyDocuments: "Verify docs",
  approveMembership: "Approve membership",
};

export function PermissionGrid({
  value,
  onChange,
}: {
  value: PermissionMap;
  onChange: (next: PermissionMap) => void;
}) {
  function toggle(page: keyof PermissionMap, action: string) {
    onChange({
      ...value,
      [page]: {
        ...value[page],
        [action]: !(value[page] as unknown as Record<string, boolean>)[action],
      },
    });
  }

  return (
    <div className="rounded-md border border-[#E5E1D8] overflow-hidden">
      <table className="w-full text-sm">
        <tbody>
          {PAGE_ROWS.map((row) => (
            <tr key={row.page} className="border-b border-[#E5E1D8] last:border-0">
              <td className="px-4 py-3 font-medium text-[#221D17] bg-[#FAF8F4] w-36 align-top">
                {row.label}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-x-5 gap-y-2">
                  {row.actions.map((action) => {
                    const checked = Boolean(
                      (value[row.page] as unknown as Record<string, boolean>)[action]
                    );
                    return (
                      <label key={action} className="inline-flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(row.page, action)}
                          className="w-4 h-4 rounded border-[#DCD6C8] text-[#C9A227] focus:ring-[#C9A227]/40"
                        />
                        <span className="text-xs text-[#57534E]">{ACTION_LABELS[action] ?? action}</span>
                      </label>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const EMPTY_PERMISSIONS: PermissionMap = {
  users: {
    view: false,
    add: false,
    update: false,
    delete: false,
    verifyDocuments: false,
    approveMembership: false,
  },
  clubs: {
    view: false,
    add: false,
    update: false,
    delete: false,
  },
  payments: {
    view: false,
  },
  registrations: {
    view: false,
    add: false,
    update: false,
    delete: false,
    verifyDocuments: false,
    approveMembership: false,
  },
  settings: {
    view: false,
    update: false,
  },
};
