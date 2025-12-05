// netlify/functions/send-order.js

exports.handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // Get the webhook URL from environment variable
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.error("DISCORD_WEBHOOK_URL is not set");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error" }),
      };
    }

    const body = JSON.parse(event.body || "{}");
    const content = body.content;

    if (!content || typeof content !== "string") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing 'content' in request body" }),
      };
    }

    const discordRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!discordRes.ok) {
      const text = await discordRes.text();
      console.error("Discord response error:", text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to send to Discord" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
