import { tool } from "ai";
import { z } from "zod";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

export const terminalTool = tool({
  description: "Run a shell command and return its output, e.g. 'date' or 'ls -la'",
  inputSchema: z.object({
    cmd: z.string().describe("The shell command to run, e.g. date"),
  }),
  execute: async ({ cmd }) => {
    try {
      const { stdout, stderr } = await execAsync(cmd, {
        timeout: 10_000,
        maxBuffer: 1024 * 512,
      });
      return stdout.trim() || stderr.trim();
    } catch (err: any) {
      return err.stderr?.trim() || err.message || "Command failed";
    }
  },
});