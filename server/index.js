import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { nanoid } from "nanoid";

// ===== Redis (Upstash via REST) =====
const RURL = process.env.UPSTASH_REDIS_REST_URL;
const RTOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!RURL || !RTOKEN) {
  console.warn(
    "[WARN] UPSTASH vars missing. Using in-memory fallback (NOT PERSISTENT)."
  );
}
async function redisGet(key) {
  if (!RURL || !RTOKEN) return null;
  const res = await fetch(`${RURL}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${RTOKEN}` },
  });
  const data = await res.json();
  if (data.result === null || data.result === undefined) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return data.result;
  }
}
async function redisSet(key, value) {
  if (!RURL || !RTOKEN) return;
  const body = JSON.stringify(value);
  await fetch(`${RURL}/set/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RTOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
}
async function redisSetEx(key, seconds, value) {
  if (!RURL || !RTOKEN) return;
  const body = JSON.stringify(value);
  await fetch(`${RURL}/setex/${encodeURIComponent(key)}/${seconds}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RTOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });
}

// ===== App base =====
const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicBase = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
const mkUrl = (p) => (publicBase ? `${publicBase}${p}` : p);

// Health
app.get("/health", (_, res) => res.json({ ok: true }));

// Placeholder para checar acesso premium
app.get("/me/entitlements", (req, res) => {
  res.json({ premium: false });
});

// ===== Poll storage helpers =====
const pollKey = (id) => `poll:${id}`;
const voteKey = (pid, sid) => `vote:${pid}:${sid}`;

// Criar enquete
app.post("/polls", async (req, res) => {
  const { title, options, overlay = false, premium = false } = req.body || {};
  if (!title || !Array.isArray(options) || options.length < 2) {
    return res
      .status(400)
      .json({ error: "Título e ao menos 2 opções são obrigatórios." });
  }
  const id = nanoid(6);
  const ownerToken = nanoid(24);
  const poll = {
    id,
    title: String(title).slice(0, 140),
    options: options
      .slice(0, 12)
      .map((t) => ({ id: nanoid(4), text: String(t).slice(0, 80), votes: 0 })),
    createdAt: new Date().toISOString(),
    overlay: !!overlay,
    premium: !!premium,
    ownerToken,
  };
  await redisSet(pollKey(id), poll);
  const manageUrl = `/polls/${id}?token=${ownerToken}`;
  const publicUrl = mkUrl(`/vote/${id}`);
  const overlayUrl = mkUrl(`/overlay/${id}`);
  res.json({ poll, manageUrl, publicUrl, overlayUrl });
});

// Buscar enquete
app.get("/polls/:id", async (req, res) => {
  const poll = await redisGet(pollKey(req.params.id));
  if (!poll) return res.status(404).json({ error: "Poll não encontrada" });
  res.json({ poll });
});

// Encerrar enquete
app.post("/polls/:id/close", async (req, res) => {
  const pkey = pollKey(req.params.id);
  const poll = await redisGet(pkey);
  if (!poll) return res.status(404).json({ error: "Poll não encontrada" });
  const token = req.query.token;
  if (token !== poll.ownerToken)
    return res.status(403).json({ error: "Proibido" });
  poll.closedAt = new Date().toISOString();
  await redisSet(pkey, poll);
  io.to(poll.id).emit("poll:closed", { id: poll.id, closedAt: poll.closedAt });
  res.json({ ok: true, poll });
});

// ===== Static (serve front build) =====
const publicDir = path.join(__dirname, "public");

app.use(express.static(publicDir));

// Redireciona qualquer rota desconhecida para index.html (Vue Router SPA)
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

// ===== HTTP + Socket.IO =====
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

io.on("connection", (socket) => {
  socket.on("poll:join", async ({ pollId }) => {
    const poll = await redisGet(pollKey(pollId));
    if (!poll) return socket.emit("error", "Poll inexistente");
    socket.join(pollId);
    socket.emit("poll:snapshot", poll);
  });

  socket.on("poll:vote", async ({ pollId, optionId, sessionId }) => {
    const pkey = pollKey(pollId);
    const vkey = voteKey(pollId, sessionId);
    const poll = await redisGet(pkey);
    if (!poll || poll.closedAt) return;

    const prevRes = await fetch(`${RURL}/get/${encodeURIComponent(vkey)}`, {
      headers: { Authorization: `Bearer ${RTOKEN}` },
    });
    const prevJson = await prevRes.json();
    const prevOptionId = prevJson.result || null;

    if (prevOptionId && prevOptionId !== optionId) {
      const prevOpt = poll.options.find((o) => o.id === prevOptionId);
      if (prevOpt) prevOpt.votes = Math.max(0, prevOpt.votes - 1);
    }

    const opt = poll.options.find((o) => o.id === optionId);
    if (!opt) return;
    if (prevOptionId === optionId) return;

    opt.votes += 1;

    await redisSet(pkey, poll);
    await fetch(`${RURL}/set/${encodeURIComponent(vkey)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RTOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(optionId),
    });

    io.to(pollId).emit("poll:update", { id: poll.id, options: poll.options });
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log("Pollstack (Upstash + Overlay) on :" + PORT);
});
