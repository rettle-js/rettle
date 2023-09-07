const target = {
  blue: "\u001b[34m",
  normal: "\u001b[0m",
  red: "\u001b[31m",
  green: "\u001b[32m",
  yellow: "\u001b[33m",
  magenta: "\u001b[35m",
  cyan: "\u001b[36m"
}

type TargetKeyTypes = keyof typeof target;

export const color = new Proxy(target, {
  get: (target, prop: TargetKeyTypes): (log:string) => void => {
    return (log: string) => {
      return `${target[prop]}${log}\u001b[0m`;
    };
  }
}) as unknown as {[index in TargetKeyTypes]: (log:string) => void};