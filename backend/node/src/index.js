import app, { chapterStrategies } from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`OptionLab API on http://localhost:${PORT} (${chapterStrategies.length} strategies)`);
});
