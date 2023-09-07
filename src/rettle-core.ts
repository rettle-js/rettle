interface globalValueInterface {
  props: { [index in string]: Record<string, any> };
  scripts: { [index in string]: Record<string, any> };
  isLoaded: boolean;
  readyFunctions: (() => void)[];
  watcherStorage: Record<string, Array<() => void>>;
}

const globalValues: globalValueInterface = {
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

const djb2Hash = (str: string) => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
  }
  return hash;
};
const createHash = (str: string) => {
  const hash = djb2Hash(str);
  const fullStr = "0000000" + (hash & 0xffffff).toString(16);
  return fullStr.substring(fullStr.length - 8, fullStr.length);
};

const ComponentInit = (
  frame: Element,
  hash: string,
  args: Record<string, any>
) => {
  return new Promise((resolve) => {
    for (const event of events) {
      const selector = `data-${event}-${hash}`;
      const eventTargets = frame.querySelectorAll(`[${selector}]`);
      if (eventTargets) {
        for (const eventTarget of eventTargets) {
          const labelName = eventTarget.getAttribute(selector);
          if (!args) return console.error(`Cannot found property ${labelName}`);
          if (labelName === null)
            return console.error(
              `Cannot found property ${selector} of ${eventTarget}`
            );
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

type watcherFunctionType<T> = (arg: T) => T;

type hashType = { hash: string };

type Reactive<T> = T extends object ? T : { value: T };

const useReactive = <T>(value: T): Reactive<T> => {
  let hash = `${createHash(JSON.stringify(value))}_`;
  hash = hash + Math.floor(Math.random() * 10 ** 10);
  globalValues.watcherStorage[hash] = [];
  const target =
    typeof value === "object"
      ? { ...value, ...{ hash } }
      : {
          value: value,
          hash: hash,
        };
  return new Proxy(target as Reactive<T>, {
    set: function (target, property, val, receiver) {
      type keyType = keyof typeof target;
      if (property !== hash) {
        target[property as Exclude<keyType, "hash">] = val;
        for (const fn of globalValues.watcherStorage[hash]) {
          fn();
        }
        return true;
      } else {
        return false;
      }
    },
  });
};

const watcher = (
  hook: () => void,
  targets: Reactive<any>[],
  initialize?: boolean
) => {
  for (const target of targets) {
    globalValues.watcherStorage[target.hash].push(() => {
      hook();
    });
  }
  if (initialize) {
    hook();
  }
};

interface RettleMethods {
  getRefs: <T = Record<string, HTMLElement>>() => T;
  getRef: <T = HTMLElement>(key: string) => T;
}
const getRefs = <T = Record<string, HTMLElement>>(
  frame: Element,
  hash: string
) => {
  const targets = frame.querySelectorAll(`[data-ref-${hash}]`);
  const result: Record<string, HTMLElement> = {};
  if (frame.getAttribute(`data-ref-${hash}`)) {
    const key = frame.getAttribute(`data-ref-${hash}`)!;
    result[key] = frame as HTMLElement;
  }
  for (const target of targets) {
    const tag = target.getAttribute(`data-ref-${hash}`)!;
    if (tag === null) console.error(`Cannot found ref value.`, target);
    result[tag] = target as HTMLElement;
  }
  return () => result as T;
};

const onDocumentReady = (cb: () => void) => {
  globalValues.readyFunctions.push(cb);
};

const RettleStart = async (scripts: {
  [index in string]: (
    { getRefs }: RettleMethods,
    props: Record<string, any>
  ) => Record<string, any>;
}) => {
  const frames = [...document.querySelectorAll("[data-rettle-fr]")];
  await Promise.all(
    frames.map(async (frame) => {
      const hash = frame.getAttribute("data-rettle-fr")!;
      let parents = frame.parentNode! as Element;
      while (
        !parents.getAttribute("data-rettle-fr") &&
        document.body !== parents
      ) {
        parents = parents.parentNode! as Element;
      }
      const parentHash = parents.getAttribute("data-rettle-fr")!;
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
        const args = scripts[hash](
          {
            getRefs: getRefs(frame, hash),
            getRef: <T = HTMLElement>(key: string) =>
              getRefs(frame, hash)()[key] as T,
          },
          props
        );
        globalValues.scripts[hash] = args;
        await ComponentInit(frame, hash, args);
      }
    })
  );
  const mountInterval = setInterval(() => {
    if (globalValues.isLoaded) {
      clearInterval(mountInterval);
      for (const fn of globalValues.readyFunctions) {
        fn();
      }
    }
  }, 500);
  globalValues.isLoaded = true;
};

type RettleClient<T> = (
  methods: RettleMethods,
  props: T
) => Record<string, any> | void;

const createClient = <T>(mounted: RettleClient<T>) => {
  return mounted;
};

export {
  onDocumentReady,
  watcher,
  createClient,
  useReactive,
  RettleStart,
  type RettleClient,
  RettleMethods,
};
