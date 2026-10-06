/** The public address of the site (APP_URL), without a trailing slash. */
export function siteUrl() {
  return (process.env.APP_URL || "http://localhost:3020").replace(/\/$/, "");
}
