"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RettleStart = exports.useReactive = exports.createClient = exports.watcher = exports.onDocumentReady = void 0;
const globalValues = {
    props: {},
    scripts: {},
    isLoaded: false,
    readyFunctions: [],
    watcherStorage: {},
};
const events = [
    // Other Events
    `scroll`,
    `resize`,
    `load`,
    // Mouse Events
    `click`,
    `mouseenter`,
    `mouseleave`,
    `mouseover`,
    `mousedown`,
    `mouseup`,
    `mouseout`,
    `mousemove`,
    `dblclick`,
    // Dom Events
    `DOMFocusIn`,
    `DOMFocusOut`,
    `DOMActivate`,
    // Inputs Events
    `change`,
    `select`,
    `submit`,
    `reset`,
    `focus`,
    `blur`,
    // Keyboard Events
    `keypress`,
    `keydown`,
    `keyup`,
];
const djb2Hash = (str) => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) + hash + str.charCodeAt(i);
    }
    return hash;
};
const createHash = (str) => {
    const hash = djb2Hash(str);
    const fullStr = "0000000" + (hash & 0xffffff).toString(16);
    return fullStr.substring(fullStr.length - 8, fullStr.length);
};
const ComponentInit = (frame, hash, args) => {
    return new Promise((resolve) => {
        for (const event of events) {
            const selector = `data-${event}-${hash}`;
            const eventTargets = frame.querySelectorAll(`[${selector}]`);
            if (eventTargets) {
                for (const eventTarget of eventTargets) {
                    const labelName = eventTarget.getAttribute(selector);
                    if (!args)
                        return console.error(`Cannot found property ${labelName}`);
                    if (labelName === null)
                        return console.error(`Cannot found property ${selector} of ${eventTarget}`);
                    if (!args.hasOwnProperty(labelName))
                        return console.error(`Cannot found property ${labelName}`);
                    if (labelName in args) {
                        eventTarget.addEventListener(event, args[labelName]);
                    }
                }
            }
        }
        resolve(null);
    });
};
const useReactive = (value) => {
    let hash = `${createHash(JSON.stringify(value))}_`;
    hash = hash + Math.floor(Math.random() * 10 ** 10);
    globalValues.watcherStorage[hash] = [];
    const target = typeof value === "object"
        ? Object.assign(Object.assign({}, value), { hash }) : {
        value: value,
        hash: hash,
    };
    return new Proxy(target, {
        set: function (target, property, val, receiver) {
            if (property !== hash) {
                target[property] = val;
                for (const fn of globalValues.watcherStorage[hash]) {
                    fn();
                }
                return true;
            }
            else {
                return false;
            }
        },
    });
};
exports.useReactive = useReactive;
const watcher = (hook, targets, initialize) => {
    for (const target of targets) {
        globalValues.watcherStorage[target.hash].push(() => {
            hook();
        });
    }
    if (initialize) {
        hook();
    }
};
exports.watcher = watcher;
const getRefs = (frame, hash) => {
    const targets = frame.querySelectorAll(`[data-ref-${hash}]`);
    const result = {};
    if (frame.getAttribute(`data-ref-${hash}`)) {
        const key = frame.getAttribute(`data-ref-${hash}`);
        result[key] = frame;
    }
    for (const target of targets) {
        const tag = target.getAttribute(`data-ref-${hash}`);
        if (tag === null)
            console.error(`Cannot found ref value.`, target);
        result[tag] = target;
    }
    return () => result;
};
const onDocumentReady = (cb) => {
    globalValues.readyFunctions.push(cb);
};
exports.onDocumentReady = onDocumentReady;
const RettleStart = (scripts) => __awaiter(void 0, void 0, void 0, function* () {
    const frames = [...document.querySelectorAll("[data-rettle-fr]")];
    yield Promise.all(frames.map((frame) => __awaiter(void 0, void 0, void 0, function* () {
        const hash = frame.getAttribute("data-rettle-fr");
        let parents = frame.parentNode;
        while (!parents.getAttribute("data-rettle-fr") &&
            document.body !== parents) {
            parents = parents.parentNode;
        }
        const parentHash = parents.getAttribute("data-rettle-fr");
        const propsKey = frame.getAttribute("data-client-key");
        let props;
        if (propsKey && globalValues.scripts[parentHash]) {
            if (globalValues.scripts[parentHash][propsKey]) {
                props = globalValues.scripts[parentHash][propsKey];
            }
        }
        if (!props) {
            props = {};
        }
        if (scripts[hash]) {
            const args = scripts[hash]({
                getRefs: getRefs(frame, hash),
                getRef: (key) => getRefs(frame, hash)()[key],
            }, props);
            globalValues.scripts[hash] = args;
            yield ComponentInit(frame, hash, args);
        }
    })));
    const mountInterval = setInterval(() => {
        if (globalValues.isLoaded) {
            clearInterval(mountInterval);
            for (const fn of globalValues.readyFunctions) {
                fn();
            }
        }
    }, 500);
    globalValues.isLoaded = true;
});
exports.RettleStart = RettleStart;
const createClient = (mounted) => {
    return mounted;
};
exports.createClient = createClient;
//# sourceMappingURL=rettle-core.js.map