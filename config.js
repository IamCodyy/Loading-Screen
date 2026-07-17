window.LoadingConfig = {
    previewMode: true, // Set to true to enable the fake progress bar for local preview. Set to false for production.
    server: {
        name: "SERVER NAME",
        logo: "images/logo.png",
        background: "images/background.jpg"
    },
    links: {
        discord: "https://discord.gg/example",
        instagram: "https://instagram.com/example",
        twitter: "https://twitter.com/example"
    },
    theme: {
        accentColor: "#8D5CFF"
    },
    layout: {
        logo: false,
        clock: false, // Clock kinda useless but if you want it, enable it.
        socials: true,
        announcements: true,
        progress: true,
        statusPanel: false // Basically shows connecting, loading resources etc. Set to false to hide it.
    },
    announcements: {
        maxCards: 4,
        showImages: false
    },
    progress: {
        previewSpeed: 500
    }
};