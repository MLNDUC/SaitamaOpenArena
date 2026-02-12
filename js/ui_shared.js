export const AVATARS = [
    { key: "lion", label: "🦁 Lion" },
    { key: "tiger", label: "🐯 Tiger" },
    { key: "fox", label: "🦊 Fox" },
    { key: "eagle", label: "🦅 Eagle" },
    { key: "shark", label: "🦈 Shark" },
    { key: "dragon", label: "🐉 Dragon" },
    { key: "robot", label: "🤖 Robot" },
    { key: "ghost", label: "👻 Ghost" },
    { key: "panda", label: "🐼 Panda" },
    { key: "bear", label: "🐻 Bear" }
];

const MAP = {
    lion: "🦁", tiger: "🐯", fox: "🦊", eagle: "🦅", shark: "🦈",
    dragon: "🐉", robot: "🤖", ghost: "👻", panda: "🐼", bear: "🐻"
};

export function avatarEmoji(key) {
    return MAP[key] || "🙂";
}

export function playerName(t, id) {
    const p = t?.players?.[id];
    return p ? p.name : "Unknown";
}
