type Reactive<T> = T extends object ? T : {
    value: T;
};
declare const useReactive: <T>(value: T) => Reactive<T>;
declare const watcher: (hook: () => void, targets: Reactive<any>[], initialize?: boolean) => void;
interface RettleMethods {
    getRefs: <T = Record<string, HTMLElement>>() => T;
    getRef: <T = HTMLElement>(key: string) => T;
}
declare const onDocumentReady: (cb: () => void) => void;
declare const RettleStart: (scripts: {
    [x: string]: ({ getRefs }: RettleMethods, props: Record<string, any>) => Record<string, any>;
}) => Promise<void>;
type RettleClient<T> = (methods: RettleMethods, props: T) => Record<string, any> | void;
declare const createClient: <T>(mounted: RettleClient<T>) => RettleClient<T>;
export { onDocumentReady, watcher, createClient, useReactive, RettleStart, type RettleClient, RettleMethods, };
