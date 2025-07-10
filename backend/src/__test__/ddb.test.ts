import { runDdbScenario } from "@/src/access/ddb.access";
import { test } from "vitest";

test("#simple ddb test", async () => {
   await runDdbScenario();
}, 60_000);
