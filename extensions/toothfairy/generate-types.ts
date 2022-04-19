const fs = require("fs");
const path = require("path");
const { transform } = require("@jxa/sdef-to-dts");

const outputDir = path.join(__dirname, "./src");

const actualContent = fs.readFileSync("ToothFairy.sdef", "utf-8");
transform("ToothFairy", actualContent).then((actual) => {
  fs.writeFileSync(path.join(outputDir, "ToothFairy") + ".d.ts", actual, "utf-8");
});
