function m(round, aId, bId) {
    return {
        round,
        aId,
        bId,
        teams: { a: null, b: null },   // teamId string
        score: { a: null, b: null }    // numbers or null
    };
}

function blankStats() {
    return { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
}

export function createNewTournament(players) {
    // players: [{name}]
    const t = {
        meta: { name: "FC26 Saitama Open Arena", createdAt: Date.now() },
        players: players.map((p, idx) => ({
            id: idx,
            name: p.name,
            stats: blankStats()
        })),

        // 6 matches group (3 rounds)
        group: {
            matches: [
                m(1, 0, 3), m(1, 1, 2),
                m(2, 0, 2), m(2, 1, 3),
                m(3, 0, 1), m(3, 2, 3),
            ],
            standings: []
        },

        playoff1: null, // {aId,bId, teams:{a,b}, score:{a,b}, winnerId}
        playoff2: null, // {aId,bId, teams:{a,b}, score:{a,b}, winnerId, seed2Id}
        final: { p1Id: null, p2Id: null, matches: [], winnerId: null }, // BO3
        championId: null,

        // log entries: {stage,label,aId,bId,aTeam,bTeam,aScore,bScore,ts}
        log: []
    };

    recalcStandings(t);
    return t;
}

export function recalcStandings(t) {
    t.players.forEach(p => (p.stats = blankStats()));

    for (const match of t.group.matches) {
        const { aId, bId, score } = match;
        if (score.a === null || score.b === null) continue;

        const A = t.players[aId];
        const B = t.players[bId];

        A.stats.played++; B.stats.played++;
        A.stats.gf += score.a; A.stats.ga += score.b;
        B.stats.gf += score.b; B.stats.ga += score.a;

        if (score.a > score.b) { A.stats.win++; B.stats.loss++; A.stats.pts += 3; }
        else if (score.a < score.b) { B.stats.win++; A.stats.loss++; B.stats.pts += 3; }
        else { A.stats.draw++; B.stats.draw++; A.stats.pts += 1; B.stats.pts += 1; }
    }

    t.players.forEach(p => (p.stats.gd = p.stats.gf - p.stats.ga));

    t.group.standings = [...t.players].sort((x, y) =>
        (y.stats.pts - x.stats.pts) ||
        (y.stats.gd - x.stats.gd) ||
        (y.stats.gf - x.stats.gf) ||
        (x.id - y.id)
    );

    return t.group.standings;
}

export function setGroupMatchTeams(t, matchIndex, aTeam, bTeam) {
    const match = t.group.matches[matchIndex];
    match.teams.a = aTeam;
    match.teams.b = bTeam;
}

export function setGroupMatchResult(t, matchIndex, aScore, bScore) {
    const match = t.group.matches[matchIndex];
    match.score.a = toIntOrNull(aScore);
    match.score.b = toIntOrNull(bScore);
    recalcStandings(t);
}

export function groupCompleted(t) {
    return t.group.matches.every(mm => mm.score.a !== null && mm.score.b !== null);
}

export function ensurePlayoffsGenerated(t) {
    if (!groupCompleted(t)) return;
    if (t.playoff1) return;

    const s = t.group.standings;
    const p1 = s[0].id;
    const p2 = s[1].id;
    const p3 = s[2].id;
    const p4 = s[3].id;

    t.playoff1 = {
        aId: p3, bId: p4,
        teams: { a: null, b: null },
        score: { a: null, b: null },
        winnerId: null
    };

    t.playoff2 = {
        aId: null, bId: null,
        teams: { a: null, b: null },
        score: { a: null, b: null },
        winnerId: null,
        seed2Id: p2
    };

    t.final = { p1Id: p1, p2Id: null, matches: [], winnerId: null };
}

export function setPlayoff1Result(t, aScore, bScore) {
    const p = t.playoff1;
    p.score.a = toIntOrNull(aScore);
    p.score.b = toIntOrNull(bScore);
    if (p.score.a === null || p.score.b === null) return;

    p.winnerId = (p.score.a > p.score.b) ? p.aId : p.bId;

    // Playoff2: winner vs seed2
    t.playoff2.aId = p.winnerId;
    t.playoff2.bId = t.playoff2.seed2Id;
}

export function setPlayoff2Result(t, aScore, bScore) {
    const p = t.playoff2;
    p.score.a = toIntOrNull(aScore);
    p.score.b = toIntOrNull(bScore);
    if (p.score.a === null || p.score.b === null) return;

    p.winnerId = (p.score.a > p.score.b) ? p.aId : p.bId;

    // final challenger
    t.final.p2Id = p.winnerId;
}

export function addFinalGame(t, p1Score, p2Score) {
    if (t.final.winnerId) return;
    if (t.final.matches.length >= 3) return; // hard cap BO3

    const a = toIntOrNull(p1Score);
    const b = toIntOrNull(p2Score);
    if (a === null || b === null) return;

    t.final.matches.push({ a, b, ts: Date.now() });

    let p1Wins = 0, p2Wins = 0;
    for (const g of t.final.matches) {
        if (g.a > g.b) p1Wins++;
        else if (g.b > g.a) p2Wins++;
    }

    if (p1Wins >= 2) {
        t.final.winnerId = t.final.p1Id;
        t.championId = t.final.p1Id;
    } else if (p2Wins >= 2) {
        t.final.winnerId = t.final.p2Id;
        t.championId = t.final.p2Id;
    }
}

export function currentStage(t) {
    // 1) next group match
    const idx = t.group.matches.findIndex(mm => mm.score.a === null || mm.score.b === null);
    if (idx !== -1) {
        const mm = t.group.matches[idx];
        return { stage: "group", label: `Group R${mm.round}`, aId: mm.aId, bId: mm.bId, matchIndex: idx };
    }

    ensurePlayoffsGenerated(t);

    // 2) playoff1
    if (t.playoff1 && (t.playoff1.score.a === null || t.playoff1.score.b === null)) {
        return { stage: "playoff1", label: "Playoff 1 (3rd vs 4th)", aId: t.playoff1.aId, bId: t.playoff1.bId };
    }

    // 3) playoff2
    if (t.playoff2 && t.playoff2.aId !== null && (t.playoff2.score.a === null || t.playoff2.score.b === null)) {
        return { stage: "playoff2", label: "Playoff 2 (Winner vs 2nd)", aId: t.playoff2.aId, bId: t.playoff2.bId };
    }

    // 4) final BO3
    if (t.final && t.final.p2Id !== null && !t.final.winnerId) {
        const nextGame = Math.min(t.final.matches.length + 1, 3);
        return { stage: "final", label: `Final BO3 (Game ${nextGame})`, aId: t.final.p1Id, bId: t.final.p2Id };
    }

    return { stage: "done", label: "Tournament Completed", aId: null, bId: null };
}

export function toIntOrNull(v) {
    if (v === "" || v === null || v === undefined) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

export function logMatch(t, entry) {
    t.log.push({ ...entry, ts: Date.now() });
}
