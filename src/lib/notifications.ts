export async function sendAlertNotification(
  title: string,
  message: string,
  isRecovery: boolean
) {
  const discordUrl = process.env.DISCORD_WEBHOOK_URL;
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const gotifyUrl = process.env.GOTIFY_URL;
  const gotifyToken = process.env.GOTIFY_APP_TOKEN;

  const promises: Promise<unknown>[] = [];

  // Discord Embed
  if (discordUrl) {
    const color = isRecovery ? 3066993 : 15158332; // Green or Red decimal values
    const payload = {
      embeds: [
        {
          title: title,
          description: message,
          color: color,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    promises.push(
      fetch(discordUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((e) => console.error("Discord alert dispatch error:", e))
    );
  }

  // Telegram Message
  if (telegramToken && telegramChatId) {
    const icon = isRecovery ? "🟢" : "🔴";
    const text = `${icon} *${title}*\n\n${message}`;
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    const payload = {
      chat_id: telegramChatId,
      text: text,
      parse_mode: "Markdown",
    };

    promises.push(
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((e) => console.error("Telegram alert dispatch error:", e))
    );
  }

  // Gotify Message
  if (gotifyUrl && gotifyToken) {
    const cleanUrl = gotifyUrl.endsWith("/") ? gotifyUrl.slice(0, -1) : gotifyUrl;
    const url = `${cleanUrl}/message`;
    const payload = {
      title: title,
      message: message,
      priority: isRecovery ? 5 : 8, // Gotify priority (5 = normal, 8 = high)
    };

    promises.push(
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Gotify-Key": gotifyToken,
        },
        body: JSON.stringify(payload),
      }).catch((e) => console.error("Gotify alert dispatch error:", e))
    );
  }

  if (promises.length > 0) {
    await Promise.all(promises);
  }
}
