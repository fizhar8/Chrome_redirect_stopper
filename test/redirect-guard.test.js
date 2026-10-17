const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const test = require("node:test");

class FakeElement {
  constructor({ anchor = null, interactive = false, parentElement = null, bounds } = {}) {
    this.anchor = anchor;
    this.interactive = interactive;
    this.parentElement = parentElement;
    this.bounds = bounds || { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10 };
  }

  closest(selector) {
    if (selector === "a[href]") return this.anchor;
    if (selector.includes("button") || selector.includes("[role='button']")) {
      return this.interactive ? this : null;
    }
    return null;
  }

  getBoundingClientRect() {
    return this.bounds;
  }
}

function loadGuard() {
  let clickListener;
  const timers = [];
  const opened = [];
  const documentElement = new FakeElement();
  const window = {
    innerWidth: 100,
    innerHeight: 100,
    open(...args) {
      opened.push(args);
      return "opened";
    },
    getComputedStyle(element) {
      return element.overlayStyle || {
        position: "static",
        pointerEvents: "auto",
        zIndex: "0",
        opacity: "1",
      };
    },
  };
  const context = {
    window,
    document: {
      documentElement,
      addEventListener(type, listener) {
        if (type === "click") clickListener = listener;
      },
    },
    location: { href: "https://site.example/page" },
    Element: FakeElement,
    URL,
    Date,
    Number,
    Boolean,
    setTimeout(callback) {
      timers.push(callback);
    },
  };

  vm.runInNewContext(fs.readFileSync("redirect-guard.js", "utf8"), context);
  return {
    window,
    opened,
    click: (event) => clickListener(event),
    flushTimers() {
      while (timers.length > 0) timers.shift()();
    },
  };
}

function createClick(target) {
  return {
    isTrusted: true,
    target,
    clientX: 5,
    clientY: 5,
    preventDefault() {
      this.defaultPrevented = true;
    },
    stopImmediatePropagation() {
      this.propagationStopped = true;
    },
  };
}

test("blocks popup opens from a background click", () => {
  const guard = loadGuard();
  guard.click(createClick(new FakeElement()));

  assert.equal(guard.window.open("https://ads.example/"), null);
  assert.equal(guard.opened.length, 0);
});

test("allows a control popup and a matching anchor popup", () => {
  const guard = loadGuard();
  const control = new FakeElement({ interactive: true });
  guard.click(createClick(control));
  assert.equal(guard.window.open("https://auth.example/"), "opened");

  const anchor = { href: "https://site.example/next" };
  guard.click(createClick(new FakeElement({ anchor })));
  assert.equal(guard.window.open(anchor.href), "opened");
  assert.equal(guard.window.open("https://ads.example/"), null);
  assert.equal(guard.opened.length, 2);
});

test("suppresses clicks intercepted by a large transparent overlay", () => {
  const guard = loadGuard();
  const overlay = new FakeElement({
    bounds: { left: 0, top: 0, right: 100, bottom: 100, width: 100, height: 100 },
  });
  overlay.overlayStyle = {
    position: "fixed",
    pointerEvents: "auto",
    zIndex: "100",
    opacity: "0",
  };
  const event = createClick(overlay);

  guard.click(event);

  assert.equal(event.defaultPrevented, true);
  assert.equal(event.propagationStopped, true);
  assert.equal(guard.window.open("https://ads.example/"), null);
});

test("does not permit popup opens after the click event turn", () => {
  const guard = loadGuard();
  guard.click(createClick(new FakeElement({ interactive: true })));

  guard.flushTimers();
  assert.equal(guard.window.open("https://auth.example/"), null);
  assert.equal(guard.opened.length, 0);
});
