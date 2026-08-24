import { createApp, log } from "./app";

(async () => {
  const { httpServer } = await createApp({ serveClient: true });

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
