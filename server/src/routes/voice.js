const express = require("express");
const chrono = require("chrono-node");
const OpenAI = require("openai");

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// helper: normalize priority + status
function normalizeParsed(parsed) {
  const allowedPriorities = ["low", "medium", "high", "critical"];
  const allowedStatuses = ["todo", "in_progress", "done"];

  let {
    title,
    description,
    priority,
    status,
    dueDate, // ISO string or null
  } = parsed || {};

  if (!title || typeof title !== "string") {
    title = "Untitled task";
  }

  if (!description || typeof description !== "string") {
    description = "";
  }

  priority = String(priority || "").toLowerCase();
  if (!allowedPriorities.includes(priority)) {
    priority = "medium";
  }

  status = String(status || "").toLowerCase();
  if (!allowedStatuses.includes(status)) {
    status = "todo";
  }

  // dueDate: ensure valid ISO or null
  if (dueDate) {
    const d = new Date(dueDate);
    if (isNaN(d.getTime())) {
      dueDate = null;
    } else {
      dueDate = d.toISOString();
    }
  } else {
    dueDate = null;
  }

  return { title, description, priority, status, dueDate };
}

// optional: fallback rule-based parsing if OpenAI fails
function fallbackParse(transcript) {
  const lower = transcript.toLowerCase();

  let priority = "medium";
  if (lower.includes("urgent") || lower.includes("critical"))
    priority = "critical";
  else if (lower.includes("high priority") || lower.includes("high"))
    priority = "high";
  else if (lower.includes("low priority") || lower.includes("low"))
    priority = "low";

  let status = "todo";
  if (lower.includes("in progress")) status = "in_progress";
  if (lower.includes("done") || lower.includes("completed")) status = "done";

  const parsedDate = chrono.parseDate(transcript, new Date());
  const dueDate = parsedDate ? parsedDate.toISOString() : null;

  let title = transcript;
  const fillers = [
    "create a high priority task to",
    "create a task to",
    "create a task",
    "create task",
    "remind me to",
    "remind me about",
    "add a task to",
    "add task to",
    "i need to",
  ];
  fillers.forEach((phrase) => {
    const regex = new RegExp(phrase, "i");
    title = title.replace(regex, "");
  });
  title = title.trim();
  if (!title) title = transcript;

  return { title, description: "", priority, status, dueDate };
}

// POST /api/voice/parse
router.post("/parse", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ message: "Transcript is required" });
  }

  try {
    // 1) Ask OpenAI to convert to structured JSON
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini", // or gpt-4o/4.1 etc.
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `
You convert natural language voice commands into structured task JSON.

Return JSON with exactly these keys:
- title: short task title (string)
- description: optional extra detail (string or null)
- priority: one of "low", "medium", "high", "critical"
- status: one of "todo", "in_progress", "done"
- dueDate: ISO8601 datetime string for when the user should be reminded, or null

Rules:
- If user says "remind me", treat that as a task with a dueDate = reminder time.
- If no clear time given, set dueDate to null.
- If no explicit priority, use "medium".
- Default status is "todo" unless they clearly say it's already in progress or done.
- For relative phrases like "tomorrow evening", resolve relative to NOW.
Respond with ONLY valid JSON, no extra text.
        `.trim(),
        },
        {
          role: "user",
          content: transcript,
        },
      ],
    });

    let parsedFromLLM = null;

    try {
      const content = completion.choices[0].message.content;
      console.log("LLM returned content:", JSON.parse(content));
      parsedFromLLM = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse LLM JSON, falling back:", e);
    }

    let parsed;
    if (parsedFromLLM) {
      parsed = normalizeParsed(parsedFromLLM);
    } else {
      // 2) Fallback: rule-based parse
      parsed = fallbackParse(transcript);
    }

    // 3) Final response to frontend
    return res.json({
      transcript,
      parsed,
    });
  } catch (err) {
    console.error("OpenAI error:", err);
    // Last-resort fallback to rule-based
    const parsed = fallbackParse(transcript);
    return res.json({
      transcript,
      parsed,
      warning: "Used fallback parser due to AI error.",
    });
  }
});

module.exports = router;
