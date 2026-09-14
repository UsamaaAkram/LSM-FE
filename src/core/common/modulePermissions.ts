// Instructor module permissions, in one place.
//
// The sidebar and the Receipts page were each deciding this for themselves and
// disagreeing: the sidebar treated a MISSING module entry as "allowed" and the
// Receipts page treated it as "denied". The result was a visible menu item that
// led straight to a lock screen.
//
// They both call this now, so the link and the page can never again give two
// different answers about the same permission.

export interface ModuleEntry {
  name?: string;
  isDisable?: boolean;
}

/**
 * Modules that are DENIED when the instructor has no entry for them.
 *
 * Everything else stays permissive on a missing entry, deliberately: most
 * sidebar items have no module at all (Dashboard, My Profile, Shop, Enrolments
 * and so on), so a blanket default-deny would hide most of the menu from every
 * instructor.
 *
 * Receipts is strict because it issues financial documents; no-entry must not
 * mean free access. Backfilling the entry (see the backend's
 * backfill-instructor-modules.js) is what makes it grantable at all.
 */
const STRICT_WHEN_MISSING = ["receipts"];

/**
 * Can this user use the named module?
 *
 * Only instructors carry module permissions; admins are unrestricted, and
 * students never reach these screens (the route guard stops them).
 */
export function canAccessModule(user: any, moduleName: string): boolean {
  if (user?.role !== "instructor") return true;

  const target = String(moduleName || "").toLowerCase();
  const mods: ModuleEntry[] = Array.isArray(user?.modules) ? user.modules : [];
  const mod = mods.find((m) => String(m?.name || "").toLowerCase() === target);

  if (!mod) return !STRICT_WHEN_MISSING.includes(target);
  return !mod.isDisable;
}

/**
 * The module a sidebar entry maps to: an explicit `module` key when it has one,
 * otherwise its title with spaces removed ("Quiz Results" -> "quizresults").
 */
export function sidebarModuleName(menu: { module?: string; title?: string }): string {
  return String(menu.module || menu.title || "").replace(/\s+/g, "").toLowerCase();
}
