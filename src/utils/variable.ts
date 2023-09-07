import fs from "fs";
import path from "path";
const {version} = JSON.parse(fs.readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));
export {version};
