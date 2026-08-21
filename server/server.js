const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());


// ============================================
// GEMINI CLIENT
// ============================================

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


// ============================================
// AI CHAT ENDPOINT
// ============================================

app.post("/api/chat", async (req, res) => {

    try {

        const {
            message,
            exception
        } = req.body;


        if (!message || !exception) {

            return res.status(400).json({
                error: "Message and exception data are required."
            });

        }


        const prompt = `
You are an AI Employee working inside an
enterprise exception resolution workbench.

Your job is to help a human reviewer understand
and resolve flagged financial transactions.

IMPORTANT RULES:

1. Only use the exception data provided below.
2. Never invent transaction information.
3. If the information is not available, say so.
4. Explain your reasoning clearly.
5. Do not independently approve a transaction.
6. The application, not the AI, controls whether
   automatic resolution is allowed.
7. Keep responses concise and useful.

SELECTED EXCEPTION:

Transaction ID:
${exception.transactionId}

Vendor:
${exception.vendor}

Category:
${exception.category}

Invoice Amount:
₹${exception.amount}

Expected Amount:
₹${exception.expectedAmount}

Confidence:
${exception.confidence}%

Status:
${exception.status}

System Reason:
${exception.reason}

AUTO RESOLUTION THRESHOLD:
90%

REVIEWER QUESTION:

${message}

Answer the reviewer's question using only
the transaction information above.
`;


        const response = await ai.models.generateContent({

            model: "gemini-2.5-flash",

            contents: prompt

        });


        res.json({
            answer: response.text
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "AI service failed."
        });

    }

});


// ============================================
// SERVER
// ============================================

const PORT = 3000;

app.listen(PORT, () => {

    console.log(
        `ResolveAI backend running on http://localhost:${PORT}`
    );

});