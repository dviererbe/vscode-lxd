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
import path from "path";
import fs from "fs";

import { ConfigKeys } from "../Constants";
import { Disposable } from "../Disposable";
import { LxdClient } from "./LxdClient";
import { ExtensionVariables } from "../ExtensionVariables";

export class LxdService extends Disposable
{
    private _client: LxdClient | null = null;
    private _instances: ILxdInstance[] = [];

    public constructor()
    {
        super();

        this.InitializeClient();

        this.RegisterDisposable(vscode.workspace.onDidChangeConfiguration(
            this.OnConfigurationChanges, // listener
            this) // thisArgs
        );

        this.Refresh();
    }

    private InitializeClient()
    {
        if (vscode.env.appHost !== "desktop" || process.platform !== "linux")
        {
            this._client = null;
            this.ShowUnsupportedEnvironmentError();
            return;
        }

        let lxdUnixSocketPath: string | null = null;

        lxdUnixSocketPath = vscode.workspace
            .getConfiguration(ConfigKeys.NAMESPACE)
            .get<string>(ConfigKeys.LXD_DAEMON_SOCKET_PATH, "");

        if (lxdUnixSocketPath.length > 0)
        {
            if (!fs.existsSync(lxdUnixSocketPath))
            {
                this._client = null;
                const errorMessage = "The configured LXD unix-socket path '{0}' does not exists.";
                ExtensionVariables.Logger.error(errorMessage, lxdUnixSocketPath);
                vscode.window.showErrorMessage(vscode.l10n.t(errorMessage, lxdUnixSocketPath));
                return;
            }

            this._client = LxdClient.FromUnixSocket(lxdUnixSocketPath);
            return;
        }

        const CLASSIC_LXD_UNIX_SOCKET_PATH = "/var/lib/lxd/unix.socket";
        const SNAP_LXD_UNIX_SOCKET_PATH = "/var/snap/lxd/common/lxd/unix.socket";

        if (process.env.LXD_DIR)
        {
            ExtensionVariables.Logger.debug(
                "Environment variable LXD_DIR is set: '{0}'",
                process.env.LXD_DIR);
            lxdUnixSocketPath = path.join(process.env.LXD_DIR, "unix.socket");
        }
        else if (fs.existsSync(SNAP_LXD_UNIX_SOCKET_PATH))
        {
            lxdUnixSocketPath = SNAP_LXD_UNIX_SOCKET_PATH;
        }
        else
        {
            lxdUnixSocketPath = CLASSIC_LXD_UNIX_SOCKET_PATH;
        }

        if (!fs.existsSync(lxdUnixSocketPath))
        {
            // TODO: Create file watcher and wait until the file exists when LXD
            //       gets started. This could also be used to observe if LXD gets
            //       shutdown.

            this._client = null;
            ExtensionVariables.Logger.error(
                "Could not find LXD unix-socket '{0}'.",
                lxdUnixSocketPath);
            vscode.window.showErrorMessage(
                vscode.l10n.t("Could not find LXD unix-socket. " +
                              "Either LXD is not running or not installed."),
                vscode.l10n.t("Install instructions"))
            .then(userSelection =>
            {
                if (userSelection)
                {
                    vscode.env.openExternal(vscode.Uri.parse(
                        "https://documentation.ubuntu.com/lxd/latest/installing/"));
                }
            });
            return;
        }

        this._client = LxdClient.FromUnixSocket(lxdUnixSocketPath);
        return;
    }

    private ShowUnsupportedEnvironmentError()
    {
        if (vscode.env.appHost !== "desktop")
        {
            ExtensionVariables.Logger.error(
                `Unsupported environment: (VS Code AppHost = ${vscode.env.appHost})`);
        }
        else
        {
            ExtensionVariables.Logger.error(
                `Unsupported environment: (Platform = ${process.platform})`);
        }

        const config = vscode.workspace.getConfiguration(ConfigKeys.NAMESPACE);
        const suppressUnsupportedEnvironmentErrors = config.get<boolean>(
            ConfigKeys.SUPPRESS_UNSUPPORTED_ENVIRONMENT_ERRORS,
            false); // default value

        if(suppressUnsupportedEnvironmentErrors) return;

        const showRequirementsString = vscode.l10n.t("Show requirements");
        const doNotShowAgainString = vscode.l10n.t("Do not show again");

        vscode.window.showErrorMessage(
            vscode.l10n.t("LXD is not supported in the current environment. LXD requires a Linux kernel."),
            showRequirementsString,
            doNotShowAgainString)
        .then(userSelection =>
        {
            if (userSelection === showRequirementsString)
            {
                vscode.env.openExternal(vscode.Uri.parse("https://documentation.ubuntu.com/lxd/latest/requirements/"));
            }
            if (userSelection === doNotShowAgainString)
            {
                vscode.workspace
                .getConfiguration(ConfigKeys.NAMESPACE)
                .update(ConfigKeys.SUPPRESS_UNSUPPORTED_ENVIRONMENT_ERRORS, true);
            }
        });
    }

    private OnConfigurationChanges(event: vscode.ConfigurationChangeEvent)
    {
        if (this.IsDisposed) return;

        const section = `${ConfigKeys.NAMESPACE}.${ConfigKeys.LXD_DAEMON_SOCKET_PATH}`;
        if (event.affectsConfiguration(section))
        {
            this.InitializeClient(); // Um, actually... it re-initializes the client :P
        }
    }

    public async Refresh()
    {
        if (this.IsDisposed) return;

        if (this._client === null)
        {
            this._instances = [];
            return;
        }

        this._instances = await this._client.GetInstances();
    }

    public GetInstances(): ILxdInstance[]
    {
        return this._instances;
    }
}

export interface ILxdInstance
{
    readonly Name: string;
    readonly Status: string;
}
