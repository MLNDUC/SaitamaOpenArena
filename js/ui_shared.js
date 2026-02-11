export const AVATARS = [
    { key: "lion", label: "🦁 Lion" },
    { key: "fox", label: "🦊 Fox" },
    { key: "eagle", label: "🦅 Eagle" },
    { key: "tiger", label: "🐯 Tiger" },
    { key: "panda", label: "🐼 Panda" },
    { key: "shark", label: "🦈 Shark" },
    { key: "robot", label: "🤖 Robot" },
    { key: "ninja", label: "🥷 Ninja" }
];

export function avatarEmoji(key) {
    const map = { lion: "🦁", fox: "🦊", eagle: "🦅", tiger: "🐯", panda: "🐼", shark: "🦈", robot: "🤖", ninja: "🥷" };
    return map[key] || "🙂";
}

export function playerName(t, id) {
    return t.players[id]?.name ?? "-";
}
