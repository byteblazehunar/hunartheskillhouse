const VERCEL_API_PATH_QUERY = "_hunar_path";

export function normalizeVercelApiRequestUrl(requestUrl) {
  const parsedUrl = new URL(requestUrl, "http://localhost");
  const apiPath = parsedUrl.searchParams.get(VERCEL_API_PATH_QUERY);

  if (apiPath === null) {
    if (parsedUrl.pathname.startsWith("/api/")) {
      return `${parsedUrl.pathname}${parsedUrl.search}`;
    }

    throw new Error("The API route could not be determined.");
  }

  if (!apiPath || apiPath.startsWith("/") || /[\\?#]/.test(apiPath) || apiPath.split("/").some((segment) => !segment || segment === "." || segment === "..")) {
    throw new Error("The API route is invalid.");
  }

  parsedUrl.searchParams.delete(VERCEL_API_PATH_QUERY);
  const query = parsedUrl.searchParams.toString();
  return `/api/${apiPath}${query ? `?${query}` : ""}`;
}
