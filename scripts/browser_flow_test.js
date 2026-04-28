const childProcess = require("child_process");
const http = require("http");
const net = require("net");
const path = require("path");

const fs = require("fs");

const CHROME_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];
const CHROME = CHROME_CANDIDATES.find((candidate) => fs.existsSync(candidate)) || CHROME_CANDIDATES[0];
const PORT = 9223;
const PAGE_URL = `file:///${path.resolve(__dirname, "..", "index.html").replace(/\\/g, "/")}`;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  let header;
  if (payload.length < 126) {
    header = Buffer.alloc(2);
    header[1] = payload.length | 0x80;
  } else {
    header = Buffer.alloc(4);
    header[1] = 126 | 0x80;
    header.writeUInt16BE(payload.length, 2);
  }
  header[0] = 0x81;
  const mask = Buffer.from([1, 2, 3, 4]);
  const masked = Buffer.alloc(payload.length);
  for (let i = 0; i < payload.length; i += 1) masked[i] = payload[i] ^ mask[i % 4];
  return Buffer.concat([header, mask, masked]);
}

function decodeFrames(buffer) {
  const messages = [];
  let offset = 0;
  while (offset + 2 <= buffer.length) {
    const first = buffer[offset];
    const second = buffer[offset + 1];
    let length = second & 0x7f;
    let headerLength = 2;
    if (length === 126) {
      if (offset + 4 > buffer.length) break;
      length = buffer.readUInt16BE(offset + 2);
      headerLength = 4;
    } else if (length === 127) {
      throw new Error("Large websocket frames are not supported in this test client.");
    }
    const masked = Boolean(second & 0x80);
    const maskLength = masked ? 4 : 0;
    const frameLength = headerLength + maskLength + length;
    if (offset + frameLength > buffer.length) break;
    const start = offset + headerLength + maskLength;
    let payload = buffer.slice(start, start + length);
    if (masked) {
      const mask = buffer.slice(offset + headerLength, offset + headerLength + 4);
      payload = Buffer.from(payload.map((byte, i) => byte ^ mask[i % 4]));
    }
    if ((first & 0x0f) === 1) messages.push(payload.toString("utf8"));
    offset += frameLength;
  }
  return { messages, rest: buffer.slice(offset) };
}

class CdpClient {
  constructor(wsUrl) {
    const parsed = new URL(wsUrl);
    this.host = parsed.hostname;
    this.port = Number(parsed.port);
    this.path = parsed.pathname + parsed.search;
    this.nextId = 1;
    this.pending = new Map();
    this.buffer = Buffer.alloc(0);
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket = net.connect(this.port, this.host, () => {
        const key = Buffer.from("shoushanmen-test-key").toString("base64");
        this.socket.write(
          [
            `GET ${this.path} HTTP/1.1`,
            `Host: ${this.host}:${this.port}`,
            "Upgrade: websocket",
            "Connection: Upgrade",
            `Sec-WebSocket-Key: ${key}`,
            "Sec-WebSocket-Version: 13",
            "",
            "",
          ].join("\r\n"),
        );
      });
      this.socket.once("data", (chunk) => {
        if (!chunk.toString("utf8").includes("101")) {
          reject(new Error(`WebSocket handshake failed: ${chunk.toString("utf8")}`));
          return;
        }
        this.socket.on("data", (data) => this.onData(data));
        resolve();
      });
      this.socket.on("error", reject);
    });
  }

  onData(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    const decoded = decodeFrames(this.buffer);
    this.buffer = decoded.rest;
    decoded.messages.forEach((message) => {
      const parsed = JSON.parse(message);
      if (parsed.id && this.pending.has(parsed.id)) {
        this.pending.get(parsed.id)(parsed);
        this.pending.delete(parsed.id);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    this.socket.write(encodeFrame(JSON.stringify({ id, method, params })));
    return new Promise((resolve) => this.pending.set(id, resolve));
  }

  async eval(expression) {
    const result = await this.send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.result.exceptionDetails) {
      const details = result.result.exceptionDetails;
      const description =
        details.exception && details.exception.description
          ? details.exception.description
          : details.text;
      throw new Error(`${description}\nExpression: ${expression}`);
    }
    return result.result.result.value;
  }

  close() {
    this.socket.end();
  }
}

async function waitFor(cdp, expression, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await cdp.eval(expression);
    if (value) return value;
    await delay(100);
  }
  throw new Error(`Timed out waiting for ${expression}`);
}

async function main() {
  const chrome = childProcess.spawn(CHROME, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    "--disable-gpu",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    PAGE_URL,
  ]);
  chrome.stderr.on("data", () => {});
  try {
    let tabs;
    for (let i = 0; i < 50; i += 1) {
      try {
        tabs = await getJson(`http://127.0.0.1:${PORT}/json`);
        if (tabs.length) break;
      } catch (_) {
        await delay(100);
      }
    }
    const tab = tabs.find((item) => item.url.includes("index.html")) || tabs[0];
    const cdp = new CdpClient(tab.webSocketDebuggerUrl);
    await cdp.connect();
    await cdp.send("Runtime.enable");

    await waitFor(cdp, "Boolean(window.__SHOUSHANMEN_ACTIONS__)");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.enterLoadout()");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.selectLoadout()");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.enterDeploy()");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.deployRole(0, 0, 5)");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.startBattle()");
    await waitFor(cdp, "window.__SHOUSHANMEN_DEBUG__().APP_STATE === 'BATTLE'");

    const beforeLevel = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.grantLingqi(1000)");
    const rewardState = await waitFor(
      cdp,
      "window.__SHOUSHANMEN_DEBUG__().APP_STATE === 'LEVEL_UP_REWARD' && window.__SHOUSHANMEN_DEBUG__().activePerkModal",
    );
    const perkCount = await cdp.eval("document.querySelectorAll('#perkGrid .perk-card').length");
    await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.chooseFirstPerk()");
    let afterFirst = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");
    let followupModalSeen = false;
    while (afterFirst.APP_STATE === "LEVEL_UP_REWARD") {
      followupModalSeen = true;
      await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.chooseFirstPerk()");
      afterFirst = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");
    }
    await waitFor(cdp, "window.__SHOUSHANMEN_DEBUG__().APP_STATE === 'BATTLE'");
    const resumed = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");

    await delay(6500);
    const later = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");
    const beforeAttackLine = await cdp.eval("window.__SHOUSHANMEN_ACTIONS__.forceEnemyAtAttackLine()");
    await delay(2800);
    const afterAttackLine = await cdp.eval("window.__SHOUSHANMEN_DEBUG__()");
    const consoleErrors = await cdp.eval("window.__TEST_ERRORS__ || []");

    console.log(
      JSON.stringify(
        {
          beforeLevel,
          rewardState,
          perkCount,
          afterSelections: resumed,
          later,
          beforeAttackLine,
          afterAttackLine,
          followupModalSeen,
          consoleErrors,
          pass: {
            enteredReward: rewardState === true,
            hadThreePerks: perkCount === 3,
            returnedToBattle: resumed.APP_STATE === "BATTLE",
            modalClosed: resumed.activePerkModal === false,
            animationStillRunning: later.animationFrame.startsWith("running"),
            enemiesContinued:
              later.firstEnemyProgress !== resumed.firstEnemyProgress ||
              later["enemies.length"] !== resumed["enemies.length"] ||
              later.wave !== resumed.wave,
            charactersContinued:
              later["player.spiritQi"] !== resumed["player.spiritQi"] ||
              later.kills !== resumed.kills ||
              later.roleAttackCount !== resumed.roleAttackCount ||
              later["projectiles.length"] !== resumed["projectiles.length"],
            artifactContinued: later.artifactCooldown !== resumed.artifactCooldown,
            enemyStopsAndAttacks:
              beforeAttackLine.firstEnemyMode === "ATTACKING" &&
              afterAttackLine.baseHp < beforeAttackLine.baseHp,
            charactersPresent: later["characters.length"] === 1,
            artifactPresent: later["artifacts.length"] === 1,
            noConsoleErrors: consoleErrors.length === 0,
          },
        },
        null,
        2,
      ),
    );
    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
