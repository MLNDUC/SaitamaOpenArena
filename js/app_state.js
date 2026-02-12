const KEY = "fc26_saitama_open_arena_v2";

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
