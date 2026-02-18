import { spawnSync } from "child_process";

function runStep(command, args) {
    const r = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    if (r.status !== 0) {
        process.exit(r.status ?? 1);
    }
}

runStep("node", ["tools/vocab-db/export.mjs"]);
runStep("node", ["tools/vocab-db/validate.mjs"]);
console.log("[vocab-db] publish pipeline passed");
