// Central place for Bluverse external links.
//
// #36 — the founder's PERSONAL profiles, shown on the About Us founder card.
// Deliberately separate from the company accounts, which belong in the site
// header and footer, not inside the founder card.
//
// Each entry only renders once a URL is filled in, so the card stays clean
// until the real links are supplied.
export const FOUNDER_SOCIALS: {
  label: string;
  icon: string;
  url: string;
}[] = [
  { label: "YouTube", icon: "fa-brands fa-youtube", url: "" },
  { label: "TikTok", icon: "fa-brands fa-tiktok", url: "" },
  { label: "Facebook", icon: "fa-brands fa-facebook-f", url: "" },
  { label: "Instagram", icon: "fa-brands fa-instagram", url: "" },
  { label: "LinkedIn", icon: "fa-brands fa-linkedin-in", url: "" },
];

// Swap WHATSAPP_ENROLL to a direct chat (e.g. https://wa.me/923XXXXXXXXX) when available.
export const WHATSAPP_CHANNEL =
  "https://whatsapp.com/channel/0029VbCmKZ28PgsKAB7SNn0Z";
export const FACEBOOK_GROUP =
  "https://www.facebook.com/share/g/1DLh8r3K37/?mibextid=wwXIfr";

// Direct WhatsApp chat link.
//
// NOTE: this used to be the target of "Enroll Now". Since #47 enrollment
// happens inside the LMS (/enroll); WhatsApp is now a support channel for
// pre-enrollment questions and help with an existing request.
export const WHATSAPP_ENROLL = "https://wa.me/message/WBFSRFPHA72OI1";

/**
 * WhatsApp link pre-filled with a course inquiry (#47.1).
 *
 * A `wa.me/message/<code>` short link silently ignores ?text=, so the message
 * is only appended when the link is a plain `wa.me/<number>`. Swap the constant
 * above to a number-based link for the pre-filled text to take effect.
 */
export function whatsappInquiry(courseTitle?: string): string {
  const base = WHATSAPP_ENROLL.split("?")[0];
  if (!courseTitle || /wa\.me\/message\//.test(base)) return base;
  const msg = `Hi, I want to get information about ${courseTitle} and its enrollment process.`;
  return `${base}?text=${encodeURIComponent(msg)}`;
}

/** WhatsApp link for help with a specific enrollment request (#47.4). */
export function whatsappRequestHelp(
  requestId: string,
  courseTitle?: string
): string {
  const base = WHATSAPP_ENROLL.split("?")[0];
  if (/wa\.me\/message\//.test(base)) return base;
  const msg = `Hi, I need help with my enrollment request ${requestId}${
    courseTitle ? ` for ${courseTitle}` : ""
  }.`;
  return `${base}?text=${encodeURIComponent(msg)}`;
}
