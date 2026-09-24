
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: '.env.local' });

async function main() {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API KEY found in .env.local");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    console.log("Fetching available models...");

    try {
        // List models is not directly available in the simple SDK usage often, 
        // but checking a simple generation works is key.
        // Actually, let's just try to generate with gemini-2.0-flash and gemini-1.5-flash

        const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"];

        for (const modelName of models) {
            console.log(`\nTesting model: ${modelName}`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello, are you working?");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text().slice(0, 50) + "...");
            } catch (error) {
                console.error(`❌ Failed with ${modelName}:`, error.message);
            }
        }

    } catch (error) {
        console.error("Global Error:", error);
    }
}

main();
