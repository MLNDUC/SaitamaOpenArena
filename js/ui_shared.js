export function playerName(t, id) {
    return t?.players?.[id]?.name ?? "Unknown";
}
