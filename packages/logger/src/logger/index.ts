import { LogLevel, LogSeverity } from '../enums';

export default class Logger {
    public static logLevel: LogLevel = LogLevel.Middle;

    public static log = (
        level: LogLevel,
        severity: LogSeverity,
        ...args: unknown[]
    ) => {
        if (Logger.logLevel >= level) {
            console.log(Logger.getColor(severity), ...args);
        }
    };

    public static print = (msg: string, severity = LogSeverity.Default) => {
        Logger.log(LogLevel.Less, severity, msg);
    };

    public static debug = (...args: unknown[]) => {
        Logger.log(LogLevel.More, LogSeverity.Default, ...args);
    };
    public static warning = (...args: unknown[]) => {
        Logger.log(LogLevel.Middle, LogSeverity.Warning, ...args);
    };
    public static error = (...args: unknown[]) => {
        Logger.log(LogLevel.Less, LogSeverity.Error, ...args);
    };

    public static success = (msg: string) => {
        Logger.print(msg, LogSeverity.Success);
    };

    private static getColor = (severity: LogSeverity) => {
        let target: string;
        switch (severity) {
            case LogSeverity.Warning:
                target = '33';
                break;
            case LogSeverity.Success:
                target = '32';
                break;
            case LogSeverity.Error:
                target = '31';
                break;
            case LogSeverity.None:
                target = '0';
                break;
            default:
                target = '36';
                break;
        }
        return `\x1b[${target}m%s\x1b`;
    };
}
