# 🖥️ Edge - META-based Terminal

*A web-based terminal built on the M.E.T.A. text editor engine*

![Edge terminal screenshot](https://raw.githubusercontent.com/hassaanmaqsood/edge/160fe7b2369b3c04ad626b627da19ccf8bb39b87/images/ss_meta-terminal.png) <!-- optional image placeholder -->

Edge is a **fully interactive, browser-based terminal emulator** that brings the nostalgia of the command line into a modern, hackable, and highly extensible web environment.

Built on top of **M.E.T.A. (Modular Extensible Text-based Architecture)**, Edge combines the feel of a UNIX shell with the flexibility of a text editor, giving you a playground for commands, scripts, and creative experiments—right in your browser.

---

## 🚀 Features

* **Web-based terminal** – Runs entirely in the browser. No installs, no servers, just open and type.
* **Command history navigation** – Use `↑` and `↓` arrows to cycle through past commands.
* **Rich built-in commands** – From `echo` and `calc` to `roll`, `flip`, and even `caesar` ciphering.
* **Context-aware prompt** – Displays dynamic `user@device:path $` for a CLI-like feel.
* **Hackable command system** – Easily register your own commands with `regCmd()`.
* **Text transformation tools** – Uppercase, lowercase, reverse, repeat, word count, and more.
* **Randomizers** – Dice rolls, coin flips, and random number generation built-in.
* **Fully client-side** – No backend required; your data and commands stay in the browser.
* **Reset & clear** – Wipe the terminal clean with a single `clear`.

---

## 📜 Built-in Commands

Some of the **40+ built-in commands** you can use out of the box:

* **`help`** – Lists all commands (or details of a specific one)
* **`echo`** – Prints back your input
* **`calc`** – Evaluates math expressions safely
* **`upper` / `lower` / `reverse`** – Transforms text
* **`roll`** – Roll dice with custom sides/count
* **`flip`** – Flips a coin (Heads/Tails)
* **`caesar`** – Apply a Caesar cipher to text
* **`rand`** – Random number generator
* **`date`** – Shows current date & time
* **`clear`** – Resets the terminal session

...and more!

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the repo

```bash
git clone https://github.com/hassaanmaqsood/edge.git
cd edge
```

### 2️⃣ Open in browser

Just open `index.html` in your favorite browser — no server needed.

---

## 🎯 Why Edge?

Edge is for **makers, hackers, and curious minds** who want:

* A **fun playground** for commands & text experiments.
* A **hackable base** for building web-based CLI tools.
* A **demo shell** for teaching command-line basics without installing anything.

It’s lightweight, extensible, and **feels like magic** when you realize everything runs purely in the browser.

---

## 🔧 Extending Edge

Adding new commands is as easy as:

```js
regCmd("greet", c => {
  return `Hello, ${c.args[0] || 'world'}!`;
}, "Greets the user", "greet <name>");
```

Boom. Now you can type:

```
greet Hackers
```

➡️ `Hello, Hackers!`

---

## 🎥 Perfect for:

✅ **ProductHunt demos** – Interactive & engaging.
✅ **Hackaday projects** – A shell for your browser-based hacks.
✅ **IndieHackers launches** – A unique side project or tool.
✅ **Workshops & education** – Teach shell basics, math, ciphers, or coding concepts.

---

## 📍 Roadmap

* [ ] Tab completion for commands & arguments
* [ ] Persistent history (via localStorage)
* [ ] Theming & custom prompt support
* [ ] Plugin system for bigger extensions

---

## 🤝 Contributing

Edge is open for contributions! PRs, issues, and feature suggestions are welcome.

👉 Want to **add commands**, **theme support**, or **crazy easter eggs**? Jump in!

---

## 📜 License

MIT License – Free to use, hack, and remix.

---

## 🌍 Links

* **ProductHunt launch**: *(coming soon)*
* **Hackaday.io project page**: *(coming soon)*
* **IndieHackers discussion**: *(coming soon)*

---

### 💡 *Edge isn’t just another terminal clone — it’s a canvas for commands, a playground for text, and a CLI for the browser-native generation.*
