// vscode-lxd    
// Copyright (C) 2025 Dominik Viererbe <hello@dviererbe.de>
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
// 
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import * as vscode from "vscode";

const LogLevelStrings: string[] = 
[
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL",
];

export class Logger implements vscode.Disposable
{
    private _outputChannel: vscode.OutputChannel;
    private _minimalLogLevel: LogLevel = LogLevel.Information;

    private constructor(readonly outputChannelName: string)
    {
        this._outputChannel = vscode.window.createOutputChannel(outputChannelName, "log");
    }

    public get MinimalLogLevel(): LogLevel
    {
        return this._minimalLogLevel;
    }

    public set MinimalLogLevel(logLevel: LogLevel)
    {
        this._minimalLogLevel = logLevel;
        this.LogInfo(`Minimum log level set to '${LogLevelStrings[logLevel]}'.`);
    }

    public Log(message: string, logLevel: LogLevel)
    {
        if (logLevel < this._minimalLogLevel) return;

        const timestamp = new Date().toISOString();
        const logLevelString = LogLevelStrings[logLevel];

        this._outputChannel.appendLine(`${timestamp} [${logLevelString}] ${message}`)
    }

    public LogTrace(message: string)
    {
        this.Log(message, LogLevel.Trace);
    }

    public LogDebug(message: string)
    {
        this.Log(message, LogLevel.Debug);
    }

    public LogInfo(message: string)
    {
        this.Log(message, LogLevel.Information);
    }
    
    public LogWarning(message: string)
    {
        this.Log(message, LogLevel.Warning);
    }

    public LogError(message: string)
    {
        this.Log(message, LogLevel.Error);
    }

    public LogFatal(message: string)
    {
        this.Log(message, LogLevel.Fatal);
    }

    public ShowLogs()
    {
        this._outputChannel.show();
    }

    public dispose() 
    {
        if (Logger._instance === this)
        {
            Logger._instance = undefined;
        }
        this._outputChannel.dispose();
    }

    private static _instance?: Logger;

    public static get Instance(): Logger
    {
        this._instance ??= new Logger("LXD");
        return this._instance;
    }

    public static Log(message: string, logLevel: LogLevel)
    {
        this.Instance.Log(message, logLevel);
    }

    public static LogTrace(message: string)
    {
        this.Instance.Log(message, LogLevel.Trace);
    }

    public static LogDebug(message: string)
    {
        this.Instance.Log(message, LogLevel.Debug);
    }

    public static LogInfo(message: string)
    {
        this.Instance.Log(message, LogLevel.Information);
    }
    
    public static LogWarning(message: string)
    {
        this.Instance.Log(message, LogLevel.Warning);
    }

    public static LogError(message: string)
    {
        this.Instance.Log(message, LogLevel.Error);
    }

    public static LogFatal(message: string)
    {
        this.Instance.Log(message, LogLevel.Fatal);
    }
}

export enum LogLevel 
{
    Trace,
    Debug,
    Information,
    Warning,
    Error,
    Fatal,
}