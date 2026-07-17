let currentProgress = 0;

const elements = {
    serverName: document.getElementById("serverName"),
    logo: document.getElementById("logo"),
    background: document.getElementById("background"),
    clock: document.getElementById("clock"),
    progress: document.getElementById("progressFill"),
    progressContainer: document.querySelector(".progress"),
    socials: document.querySelector(".socials"),
    updates: document.querySelector(".updates"),
    announcements: document.getElementById("announcementContainer"),
    statusPanel: document.getElementById("statusPanel"),
    status: document.getElementById("loadingStatus"),
    resource: document.getElementById("loadingResource"),
    discord: document.getElementById("discord"),
    instagram: document.getElementById("instagram"),
    twitter: document.getElementById("twitter")
};

const previewAnnouncements = [
    {
        title: "🚔 New Police Vehicles",
        message: "Vapid Buffalos, Alamo, Aleutian, and more. Plus new ambulance vehicles.",
        author: "Development Team",
        time: "2 minutes ago",
        image: ""
    },
    {
        title: "🏙 City Expansion",
        message: "New areas and locations are now available.",
        author: "Mapping Team",
        time: "1 hour ago",
        image: ""
    },
    {
        title: "⚙ Server Update",
        message: "Performance improvements and bug fixes deployed.",
        author: "Development Team",
        time: "Yesterday",
        image: ""
    },
    {
        title: "🎉 Community Event",
        message: "Car Meet | Legion Square | August 5",
        author: "Events Team",
        time: "3 days ago",
        image: ""
    }
];

async function fetchAnnouncements() {
    try {
        const response = await fetch("../shared/announcements.json");
        if (!response.ok) {
            throw new Error(`Failed to fetch announcements (${response.status})`);
        }
        const data = await response.json();
        return Array.isArray(data) ? data : previewAnnouncements;
    } catch (error) {
        console.warn("Unable to load announcements, using preview data:", error);
        return previewAnnouncements;
    }
}

function initializeConfig() {
    elements.serverName.innerText = LoadingConfig.server.name;
    const backgroundPath = LoadingConfig.server.background.startsWith("images/")
        ? `./${LoadingConfig.server.background}`
        : LoadingConfig.server.background;
    elements.background.style.backgroundImage = `url(${backgroundPath})`;
    elements.discord.href = LoadingConfig.links.discord;
    elements.instagram.href = LoadingConfig.links.instagram;
    elements.twitter.href = LoadingConfig.links.twitter;

    if (LoadingConfig.layout.logo) {
        elements.logo.src = LoadingConfig.server.logo;
    } else {
        elements.logo.style.display = "none";
    }
    if (!LoadingConfig.layout.clock) {
        elements.clock.style.display = "none";
    }
    if (!LoadingConfig.layout.socials) {
        elements.socials.style.display = "none";
    }
    if (!LoadingConfig.layout.announcements) {
        elements.updates.style.display = "none";
    }
    if (!LoadingConfig.layout.progress) {
        elements.progressContainer.style.display = "none";
    }
    if (!LoadingConfig.layout.statusPanel) {
        elements.statusPanel.style.display = "none";
    }
}

async function loadAnnouncements() {
    if (!LoadingConfig.layout.announcements) {
        return;
    }
    const announcements = LoadingConfig.previewMode
        ? previewAnnouncements
        : await fetchAnnouncements();

    elements.announcements.innerHTML = "";
    announcements
        .slice(0, LoadingConfig.announcements.maxCards)
        .forEach(update => {
            const card = document.createElement("div");
            card.className = "card";
            const readMoreLink = update.readMoreUrl
                ? `<a href="${update.readMoreUrl}" target="_blank" rel="noopener noreferrer">Read More</a>`
                : "";
            card.innerHTML = `
                ${update.image ? ` <img class="update-image" src="${update.image}"> ` : ""}
                <h3>${update.title}</h3>
                <p>${update.message}</p>
                <div class="card-footer">
                    <span>${update.author} • ${update.time}</span>
                    ${readMoreLink}
                </div>`;
            elements.announcements.appendChild(card);
        });
}

function updateClock() {
    elements.clock.innerText = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
}

function fakeProgress() {
    const interval = setInterval(() => {
        if (currentProgress >= 100) {
            clearInterval(interval);
            return;
        }
        currentProgress = Math.min(currentProgress + 2, 100);
        elements.progress.style.width = `${currentProgress}%`;
    }, LoadingConfig.progress.previewSpeed);
}

window.addEventListener("message", event => {
    const data = event.data;
    if (data.action === "progress") {
        elements.progress.style.width = `${data.progress}%`;
        if (data.resource && elements.resource) {
            elements.resource.innerText = data.resource;
        }
        if (elements.status) {
            elements.status.innerText = "LOADING";
        }
    }
    if (data.action === "complete") {
        if (elements.status) {
            elements.status.innerText = "READY";
        }
        if (elements.resource) {
            elements.resource.innerText = "Entering server...";
        }

    }
});

document.addEventListener("DOMContentLoaded", () => {
    initializeConfig();
    loadAnnouncements();
    if (LoadingConfig.layout.clock) {
        updateClock();
        setInterval(updateClock, 1000);
    }
    if (LoadingConfig.previewMode && LoadingConfig.layout.progress) {
        fakeProgress();
    }
});