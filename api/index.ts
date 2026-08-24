import type { IncomingMessage, ServerResponse } from "http";
import { createApp } from "../server/app";

const appPromise = createApp({ serveClient: false });

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  const { app } = await appPromise;
  return app(req, res);
}
