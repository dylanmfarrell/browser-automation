import { defineConfig } from "playwright";

export default defineConfig({
    use: {
        headless: process.env.HEADLESS !== "false",
        viewport: { width: 1280, height: 800 },
        actionTimeout: 30_000,
        navigationTimeout: 60_000,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure"
    }
});