require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const token = process.env.DISCORD_BOT_TOKEN || config.token;
const guildId = process.env.GUILD_ID || config.guildId;
const channelId = process.env.CHANNEL_ID || config.channelId;
const announcementLimit = parseInt(process.env.ANNOUNCEMENT_LIMIT, 10) || config.announcementLimit;
const updateInterval = parseInt(process.env.UPDATE_INTERVAL, 10) || config.updateInterval || 60000;
const testMode = process.env.TEST_MODE === "true" || config.testMode === true;

if (!testMode && (!token || !guildId || !channelId)) {
    console.error("Missing required Discord bot configuration. Please set DISCORD_BOT_TOKEN, GUILD_ID, and CHANNEL_ID or enable TEST_MODE=true.");
    process.exit(1);
}

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

function resolveOutputFile(filePath) {
    if (!filePath) {
        return path.resolve(__dirname, "..", "shared", "announcements.json");
    }

    return path.isAbsolute(filePath) ? filePath : path.resolve(__dirname, filePath);
}

const outputFile = resolveOutputFile(process.env.OUTPUT_FILE || config.outputFile);

function createSampleAnnouncements() {
    return [
        {
            title: "Test Announcement",
            message: "This is sample data from TEST_MODE.",
            author: "Bot Test",
            time: "just now",
            image: "",
            readMoreUrl: ""
        },
        {
            title: "Loading Screen Check",
            message: "The announcements file is being read correctly.",
            author: "System",
            time: "a moment ago",
            image: "",
            readMoreUrl: ""
        }
    ];
}

function truncateText(text, maxLength = 260) {
    if (!text) {
        return "";
    }

    const cleaned = text.replace(/\s+/g, " ").trim();
    if (cleaned.length <= maxLength) {
        return cleaned;
    }

    return `${cleaned.slice(0, maxLength - 3).trimEnd()}...`;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

async function updateAnnouncements() {
    try {
        if (testMode) {
            const data = createSampleAnnouncements();
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 4));
            console.log(`Test mode enabled -> ${outputFile}`);
            return;
        }

        const guild = await client.guilds.fetch(guildId);
        const channel = await guild.channels.fetch(channelId);
        const messages = await channel.messages.fetch({limit: announcementLimit});
        const data = [];
        messages
        .sort(
            (a, b) => b.createdTimestamp - a.createdTimestamp
        )
        .forEach(message => {
            let image = "";
            if (message.attachments.size > 0) {
                const attachment = message.attachments.first();
                if (
                    attachment.contentType && attachment.contentType.startsWith("image")
                ) {
                    image = attachment.url;
                }
            }

            const embedText = message.embeds
                ?.map(embed => [embed.title, embed.description, embed.fields?.map(field => `${field.name}: ${field.value}`).join("\n")].filter(Boolean).join("\n"))
                .filter(Boolean)
                .join("\n\n") || "";

            const messageText = [message.content, embedText].filter(Boolean).join("\n\n") || "No description provided";
            const previewText = truncateText(messageText);
            const messageUrl = `https://discord.com/channels/${guildId}/${channelId}/${message.id}`;

            data.push({
                title: message.author.username,
                message: previewText,
                author: message.member?.displayName || message.author.username,
                time: formatTimestamp(message.createdTimestamp),
                image,
                readMoreUrl: messageUrl
            });
        });
        fs.mkdirSync(path.dirname(outputFile), { recursive: true });
        fs.writeFileSync(outputFile, JSON.stringify(data, null, 4));
        console.log(`Announcements updated -> ${outputFile}`);
    } catch (error) {
        const isAccessError = error?.code === 50001 || error?.status === 403 || error?.message?.includes("Missing Access") || error?.message?.includes("Missing Permissions");
        if (isAccessError) {
            const data = createSampleAnnouncements();
            fs.mkdirSync(path.dirname(outputFile), { recursive: true });
            fs.writeFileSync(outputFile, JSON.stringify(data, null, 4));
            console.warn("Discord access denied for the configured channel.");
            console.warn(`Channel ID: ${channelId}`);
            console.warn("Please make sure the bot has View Channel and Read Message History permissions in that channel.");
            return;
        }
        console.error("Failed to update announcements:", error);
    }
}

if (testMode) {
    console.log("Test mode enabled. Writing sample announcements to disk.");
    updateAnnouncements();
    setInterval(updateAnnouncements, updateInterval);
} else {
    client.once("ready", async () => {
        console.log(`${client.user.tag} online`);
        await updateAnnouncements();
        setInterval(updateAnnouncements, updateInterval);
    });

    client.on("messageCreate", async (message) => {
    if (message.channelId !== channelId || message.author.bot) {
        return;
    }

        await updateAnnouncements();
    });

    client.login(token).catch((error) => {
        console.error("Failed to login to Discord:", error);
        process.exit(1);
    });
}