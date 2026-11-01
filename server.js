
import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const port = Number(process.env.PORT || 5000);

try {
  await connectDB();

  const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Alumni V1 API listening on port ${port}`);
  });

  server.on("error", (error) => {
    console.error("Server error:", error.message);
    process.exit(1);
  });
} catch (error) {
  console.error("Server startup failed:", error.message);
  process.exit(1);
}
