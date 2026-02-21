import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

function runStep(command, args) {
    const r = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    if (r.status !== 0) {
        process.exit(r.status ?? 1);
    }
}

runStep("node", ["tools/vocab-db/import.mjs"]);
runStep("node", ["tools/vocab-db/export.mjs"]);
runStep("node", ["tools/vocab-db/dedup.mjs"]);
runStep("node", ["tools/vocab-db/validate.mjs"]);
const auditScope = "vocab.junior_high,vocab.kindergarten.supplement,vocab.elementary_lower.supplement";
runStep("node", ["tools/vocab-db/audit.mjs", "--pack", auditScope]);

const auditReportPath = path.join(process.cwd(), "words", "db", "reports", "audit-report.json");
if (!fs.existsSync(auditReportPath)) {
    console.error(`[vocab-db] missing audit report: ${auditReportPath}`);
    process.exit(1);
}
const auditReport = JSON.parse(fs.readFileSync(auditReportPath, "utf8"));
const blockers = Number(auditReport?.summary?.bySeverity?.BLOCKER || 0);
if (blockers > 0) {
    console.error(`[vocab-db] publish blocked: audit BLOCKER findings=${blockers} (scope=${auditScope})`);
    process.exit(1);
}

console.log(`[vocab-db] publish pipeline passed (export + dedup + validate + audit scope=${auditScope})`);
