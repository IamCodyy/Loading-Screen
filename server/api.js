const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const app = express();
const config = require("./config.json");

function resolveOutputFile(filePath) {
    if (!filePath) {
        return path.resolve(__dirname, "..", "shared", "announcements.json");
    }

    return path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
}

const outputFile = resolveOutputFile(config.outputFile);

app.use(cors());
app.get("/announcements", (req,res)=>{
    const filePath = outputFile;
    if (!fs.existsSync(filePath)) {
        return res.status(200).json([]);
    }

    try {
        const data = fs.readFileSync(filePath, "utf8");
        return res.json(JSON.parse(data));
    } catch (error) {
        console.error("Failed to read announcements:", error);
        return res.status(500).json({ error: "Failed to read announcements." });
    }
});

app.listen(
    config.apiPort, ()=>{
        console.log(`API running on ${config.apiPort}`);
    }
)