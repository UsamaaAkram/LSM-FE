import { all_routes } from "../../feature-module/router/all_routes";

// #48 — one place that decides a course's URL.
//
// Prefers the readable slug (/courses/tiktok-automation). Falls back to the
// legacy ?id= form for any course that has no slug yet — without the fallback,
// a course created before slugs existed would link to /courses/undefined.
// Run scripts/backfill-course-slugs.js to give older courses a slug.
export function courseUrl(course: { _id?: string; slug?: string } | null | undefined): string {
  if (!course) return all_routes.courseGrid;
  if (course.slug) return `/courses/${course.slug}`;
  if (course._id) return `${all_routes.courseDetails}?id=${course._id}`;
  return all_routes.courseGrid;
}
