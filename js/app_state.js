// bump version to avoid old localStorage conflicts
const KEY = "fc26_saitama_open_arena_v4";

export function save(state) {
    localStorage.setItem(KEY, JSON.stringify(state));
}

export function load() {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
}

export function clearAll() {
    localStorage.removeItem(KEY);
}
