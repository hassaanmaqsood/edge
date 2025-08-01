const editor = document.querySelector('#editor');
let cursorPos = 0, inputDisabled = false;
const ctx = { cmds: {}, last: "" };
const meta = { user: "user", device: "local", path: "/" };
const history = [];
let historyIndex = -1; // -1 means "not browsing history"

init();

function init() {
  editor.innerHTML = "";
  regBuiltins();
  const metaStr = getMeta();
  editor.innerHTML = formatHtml(strToHtml(metaStr), ["prompt"]);
  cursorPos = getLastMessageIdx();
  updateCursor(cursorPos);
}

editor.addEventListener('keydown', e => {
  const { key, ctrlKey, metaKey } = e;
  const isChar = key.length === 1 || key === 'Enter';
  const sel = window.getSelection();

  if (isChar && !ctrlKey && !metaKey) {
    e.preventDefault();
    if (inputDisabled) return;

    const ch = key === 'Enter' ? '\n' : key;
    cursorPos = getCursorPos();
    insertChar(ch);
    if (ch === '\n') handleEnter();
  }

  if (key === 'ArrowUp' || key === 'ArrowDown') {
    e.preventDefault();
    navigateHistory(key);
    return;
  }

  else if (key === 'Backspace' || key === 'Delete') {
    e.preventDefault();
    if (inputDisabled) return;
    if ((key === 'Backspace' && cursorPos > 0) || (key === 'Delete' && cursorPos < editor.children.length)) {
      if (sel.isCollapsed && (key === 'Backspace' || key === 'Delete')) updateCursor(--cursorPos);
      cursorPos = modifySelection(removeNode);
      updateCursor(cursorPos);
    }
  }

  else if(key === "ArrowUp") {
    if ( cursorPos < getLastMessage().indexOf("\n")) e.preventDefault();
  }

  else if (ctrlKey && key === 'b') {
    e.preventDefault();
    modifySelection(n => n.classList.toggle('c'));
  }
});

// === Cursor & DOM Utils ===
function getCursorPos() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return 0;
  const range = sel.getRangeAt(0), pre = range.cloneRange();
  pre.selectNodeContents(editor); pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
}

function updateCursor(pos) {
  if(pos < getLastMessageIdx() ) pos = getLastMessageIdx(); 
  const sel = window.getSelection(), range = document.createRange();
  const node = editor.children[pos];
  range.setStart(node || editor, node ? 0 : pos);
  range.collapse(true); sel.removeAllRanges(); sel.addRange(range);
}

function getSelectionIdx() {
  if (!window.getSelection().rangeCount) return [getCursorPos()];
  const range = window.getSelection().getRangeAt(0);
  const nodes = [...editor.children];
  const getNode = n => n.nodeType === 3 ? n.parentNode : n;
  const [start, end] = [getNode(range.startContainer), getNode(range.endContainer)];
  const [i, j] = [nodes.indexOf(start), nodes.indexOf(end)];

  return i < 0 || j < 0 ? [getCursorPos()] : [i, j];
}

function insertChar(ch) {
  const inputStartIdx = getLastMessageIdx();
  if(cursorPos < inputStartIdx) cursorPos = inputStartIdx;
  const html = editor.innerHTML;
  const offset = [...editor.children].slice(0, cursorPos).reduce((a, n) => a + n.outerHTML.length, 0);
  editor.innerHTML = html.slice(0, offset) + wrap(ch) + html.slice(offset);
  updateCursor(++cursorPos);
}

function handleEnter() {
    inputDisabled = true;
    const msg = getLastMessage();

    if (msg.trim()) {
      history.push(msg);
      historyIndex = -1;
    }

    const resp = runCmd(msg);
    if (resp) {
        const out = strToHtml(resp + '\n') + formatHtml(strToHtml(getMeta()), ["prompt"]);
        const offset = [...editor.children].slice(0, cursorPos).reduce((a, n) => a + n.outerHTML.length, 0);
        editor.innerHTML = insert(editor.innerHTML, offset, out);
        cursorPos += (resp + '\n' + getMeta()).length;
        updateCursor(cursorPos);
    }
    inputDisabled = false;
    editor.lastChild.scrollIntoView();
}

function modifySelection(cb, sel = window.getSelection()) {
  const [i, j] = getSelectionIdx(sel);
  const nodes = [...editor.children];

  if (!j || Math.min(i, j) < getLastMessageIdx()) return cursorPos;

  if (i == j) {
    if (nodes[i]) cb(nodes[i], i);
    return i;
  }

  for (let k = Math.max(i, j); k >= Math.min(i, j); k--) nodes[k] && cb(nodes[k], k);
  return Math.min(i, j);
}

function wrap(c) {
  return `<span class="char">${c}</span>`;
}

function insert(s, i, v) {
  return s.slice(0, i) + v + s.slice(i);
}

function removeNode(n) {
  n.remove();
}

function strToHtml(s) {
  return [...s].map(wrap).join('');
}

function htmlToStr() {
  return [...editor.children].map(n => n.textContent).join('');
}

function formatHtml(html, ...classes) {
    return html.replace(/class="char"/g, `class="${classes.join(' ')}"`)
}

function getMeta(from = meta.user, to = meta.device, path = meta.path) {
  return `${from.split(" ")[0]}@${to.split(" ")[0]}:${path} $ `;
}

function getLastPromptIdx() {
  return htmlToStr().lastIndexOf(getMeta());
}

function getLastMessageIdx() {
  return getLastPromptIdx() + getMeta().length;
}

function getLastMessage() {
  const idx = getLastPromptIdx();
  return idx === -1 ? "" : htmlToStr().slice(getLastMessageIdx()).trim();
}

function addIncomingMessage(message="[no message]", sender="anonymous", path = "/") {
    const lastPromptIdx = getLastPromptIdx();
    const senderPrompt = getMeta(sender, meta.user, path);
    const newCursorPos = getCursorPos() + senderPrompt.length + message.length + 1;

    const offset = [...editor.children].slice(0, lastPromptIdx <= 0 ? null : lastPromptIdx).reduce((a, n) => a + n.outerHTML.length, 0);
    editor.innerHTML = insert(editor.innerHTML, offset, formatHtml(strToHtml(senderPrompt), ["prompt"]) + strToHtml(message + "\n") )
    updateCursor(newCursorPos);
    editor.lastChild.scrollIntoView();
}

function navigateHistory(direction) {
  if (history.length === 0) return;

  if (direction === 'ArrowUp') {
    // Move up but not past first
    historyIndex = Math.max(0, historyIndex === -1 ? history.length - 1 : historyIndex - 1);
  } else if (direction === 'ArrowDown') {
    // Move down but not past latest (or clear if at end)
    historyIndex = historyIndex === history.length - 1 ? -1 : historyIndex + 1;
  }

  // Get new value (or empty if reset)
  const newCmd = historyIndex === -1 ? "" : history[historyIndex];

  // Replace current input with history value
  replaceCurrentInput(newCmd);
}


function replaceCurrentInput(text) {
  // Remove all chars after the prompt
  const startIdx = getLastMessageIdx();
  while (editor.children.length > startIdx) {
    editor.removeChild(editor.lastChild);
  }

  // Add new chars for the history command
  for (const c of text) {
    const node = document.createElement('span');
    node.className = 'char';
    node.textContent = c;
    editor.appendChild(node);
  }

  cursorPos = editor.children.length;
  updateCursor(cursorPos);
}


// === Command Processor ===
function tokenize(str) {
  let t = [], b = '', q = false, esc = false;
  for (let c of str) {
    if (esc) b += c, esc = false;
    else if (c === '\\') esc = true;
    else if (c === '"' || c === "'") q = !q;
    else if (!q && /\s/.test(c)) b && (t.push(b), b = '');
    else b += c;
  }
  b && t.push(b);
  return t;
}

function parseCmd(s) {
  const t = tokenize(s), cmd = { cmd: "", args: [], flags: {}, opts: {} };
  if (!t.length) return cmd;
  cmd.cmd = t[0].toLowerCase();
  for (let i = 1; i < t.length; i++) {
    const x = t[i];
    if (x.startsWith("--")) {
      const [k, v] = x.slice(2).split("=");
      if (v !== undefined) cmd.opts[k] = v;
      else if (t[i + 1] && !t[i + 1].startsWith("-")) cmd.opts[k] = t[++i];
      else cmd.flags[k] = true;
    } else if (x[0] === '-' && x.length > 1) {
      [...x.slice(1)].forEach(f => cmd.flags[f] = true);
    } else cmd.args.push(x);
  }
  return cmd;
}

function regCmd(name, fn, desc = "", usage = "") {
  ctx.cmds[name.toLowerCase()] = { fn, desc, usage };
}

function runCmd(s) {
  const c = parseCmd(s), h = ctx.cmds[c.cmd];
  let r = "";
  if (h) {
    try { r = h.fn(c) || ""; } catch (e) { r = "ERR: " + e.message; }
  } else r = "Unknown: '" + c.cmd + "'";
  ctx.last = r;
  return r;
}

function regBuiltins() {
  regCmd("help", c => {
    if (c.args.length) {
      const h = ctx.cmds[c.args[0]];
      return h ? `Cmd: ${c.args[0]}\n${h.desc}\n${h.usage}` : "Not found.";
    }
    return Object.entries(ctx.cmds).map(([k, v]) => `${k} - ${v.desc}`).join('\n');
  }, "List commands", "help [cmd]");

  // Echo command - repeats input
  regCmd("echo", c => {
    return c.args.join(' ');
  }, "Repeats the given text", "echo <text>");

  // Reverse command - reverses text
  regCmd("reverse", c => {
    return c.args.join(' ').split('').reverse().join('');
  }, "Reverses the input text", "reverse <text>");

  // Uppercase command
  regCmd("upper", c => {
    return c.args.join(' ').toUpperCase();
  }, "Converts text to uppercase", "upper <text>");

  // Lowercase command
  regCmd("lower", c => {
    return c.args.join(' ').toLowerCase();
  }, "Converts text to lowercase", "lower <text>");

  // Word count command
  regCmd("wc", c => {
    const text = c.args.join(' ');
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    return `Words: ${words}, Characters: ${chars}`;
  }, "Counts words and characters", "wc <text>");

  // Random number generator
  regCmd("rand", c => {
    const min = parseInt(c.args[0]) || 1;
    const max = parseInt(c.args[1]) || 100;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, "Generates random number", "rand [min] [max]");

  // Calculate command (basic math)
  regCmd("calc", c => {
    const expr = c.args.join(' ');
    // Simple safe evaluation for basic operations
    const sanitized = expr.replace(/[^0-9+\-*/().\s]/g, '');
    if (sanitized !== expr) return "Only basic math allowed (+, -, *, /, parentheses)";
    try {
      return eval(sanitized).toString();
    } catch (e) {
      return "Invalid expression";
    }
  }, "Basic calculator", "calc <expression>");

  // Repeat command
  regCmd("repeat", c => {
    const count = parseInt(c.args[0]) || 1;
    const text = c.args.slice(1).join(' ');
    if (count > 50) return "Too many repetitions (max 50)";
    return Array(count).fill(text).join(' ');
  }, "Repeats text N times", "repeat <count> <text>");

  // Date command
  regCmd("date", c => {
    return new Date().toLocaleString();
  }, "Shows current date and time", "date");

  // Flip coin
  regCmd("flip", c => {
    return Math.random() < 0.5 ? "Heads" : "Tails";
  }, "Flips a coin", "flip");

  // Roll dice
  regCmd("roll", c => {
    const sides = parseInt(c.args[0]) || 6;
    const count = parseInt(c.args[1]) || 1;
    if (sides > 100 || count > 10) return "Limits: max 100 sides, 10 dice";
    const rolls = Array(count).fill().map(() => Math.floor(Math.random() * sides) + 1);
    return count === 1 ? rolls[0].toString() : `Rolls: ${rolls.join(', ')} (Sum: ${rolls.reduce((a,b) => a+b, 0)})`;
  }, "Rolls dice", "roll [sides] [count]");

  // Caesar cipher
  regCmd("caesar", c => {
    const shift = parseInt(c.args[0]) || 13;
    const text = c.args.slice(1).join(' ');
    return text.replace(/[a-zA-Z]/g, char => {
      const base = char <= 'Z' ? 65 : 97;
      return String.fromCharCode((char.charCodeAt(0) - base + shift) % 26 + base);
    });
  }, "Caesar cipher encoding", "caesar <shift> <text>");

  // Base64 encode
  regCmd("b64", c => {
    const text = c.args.join(' ');
    try {
      return btoa(text);
    } catch (e) {
      return "Encoding failed";
    }
  }, "Base64 encode text", "b64 <text>");

  // Get last command result
  regCmd("last", c => {
    return ctx.last || "No previous result";
  }, "Shows last command result", "last");

  // clear the results and terminal
  regCmd("clear", c=> {
    ctx.last = "";
    return init();
  }, "Clears the terminal and last resutls", "clear")
}
