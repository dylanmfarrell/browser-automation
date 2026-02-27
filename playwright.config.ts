import { defineConfig } from "playwright";

export default defineConfig({
    timeout: 0, // no overall test timeout
    expect: {
        timeout: 0
    },
    use: {
        headless: process.env.HEADLESS !== "false",
        viewport: { width: 1280, height: 800 },

        actionTimeout: 0,
        navigationTimeout: 0,

        trace: "retain-on-failure",
        screenshot: "only-on-failure",
        video: "retain-on-failure"
    }
});