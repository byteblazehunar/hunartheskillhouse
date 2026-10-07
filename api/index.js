import vercelHandler from "../server/vercelHandler.js";
import { normalizeVercelApiRequestUrl } from "../server/normalizeVercelApiRequest.js";

export default async function handler(req, res) {
  try {
    req.url = normalizeVercelApiRequestUrl(req.url);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  return vercelHandler(req, res);
}
