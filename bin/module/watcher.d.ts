import Chokidar from "chokidar";
interface watchFileArgs {
    change?: (filename: string, watcher: Chokidar.FSWatcher) => void;
    add?: (filename: string, watcher: Chokidar.FSWatcher) => void;
    ready?: (watcher: Chokidar.FSWatcher) => void;
    unlink?: (filename: string, watcher: Chokidar.FSWatcher) => void;
    unlinkDir?: (filename: string, watcher: Chokidar.FSWatcher) => void;
}
export declare const watchFiles: (args: watchFileArgs) => void;
export {};
