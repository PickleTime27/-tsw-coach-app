const fs = require("fs"); fs.mkdirSync("src/app/community", {recursive:true}); fs.writeFileSync("src/app/community/page.tsx", fs.readFileSync("_temp_community.txt","utf8")); console.log("done");
