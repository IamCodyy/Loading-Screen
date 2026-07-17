fx_version 'cerulean'
game 'gta5'

author 'IamCodyy'
description 'A loading screen for FiveM that uses a bot to fetch updates from a Discord channel and previews them on the loading screen.'
version '1.0.0'
loadscreen 'html/index.html'
loadscreen_cursor 'yes'
client_script 'client/client.lua'
server_scripts {
    'server/api.js',
    'server/bot.js'
}

files {
    'html/index.html',
    'html/style.css',
    'html/script.js',
    'html/images/*',
    'shared/config.js',
    'shared/announcements.json'
}
