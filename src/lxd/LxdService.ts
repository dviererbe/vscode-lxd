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
    private readonly _onDidChangeInstances: vscode.EventEmitter<ILxdInstance[]>;
    public readonly OnDidChangeInstances: vscode.Event<ILxdInstance[]>;

    private _images: ILxdImage[] = [];
    private readonly _onDidChangeImages: vscode.EventEmitter<ILxdImage[]>;
    public readonly OnDidChangeImages: vscode.Event<ILxdImage[]>;

    private _networks: ILxdNetwork[] = [];
    private readonly _onDidChangeNetworks: vscode.EventEmitter<ILxdNetwork[]>;
    public readonly OnDidChangeNetworks: vscode.Event<ILxdNetwork[]>;

    private _storagePools: ILxdStoragePool[] = [];
    private readonly _onDidChangeStoragePools: vscode.EventEmitter<ILxdStoragePool[]>;
    public readonly OnDidChangeStoragePools: vscode.Event<ILxdStoragePool[]>;

    public constructor()
    {
        super();

        this.InitializeClient();

        this.RegisterDisposable(vscode.workspace.onDidChangeConfiguration(
            this.OnConfigurationChanges, // listener
            this) // thisArgs
        );

        this._onDidChangeInstances = this.RegisterDisposable(new vscode.EventEmitter<ILxdInstance[]>());
        this.OnDidChangeInstances = this._onDidChangeInstances.event;

        this._onDidChangeImages = this.RegisterDisposable(new vscode.EventEmitter<ILxdImage[]>());
        this.OnDidChangeImages = this._onDidChangeImages.event;

        this._onDidChangeNetworks = this.RegisterDisposable(new vscode.EventEmitter<ILxdNetwork[]>());
        this.OnDidChangeNetworks = this._onDidChangeNetworks.event;

        this._onDidChangeStoragePools = this.RegisterDisposable(new vscode.EventEmitter<ILxdStoragePool[]>());
        this.OnDidChangeStoragePools = this._onDidChangeStoragePools.event;

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

        let section = `${ConfigKeys.NAMESPACE}.${ConfigKeys.LXD_DAEMON_SOCKET_PATH}`;
        if (event.affectsConfiguration(section))
        {
            this.InitializeClient(); // Um, actually... it re-initializes the client :P
        }
    }

    public async RefreshInstances()
    {
        if (this.IsDisposed) return;

        if (this._client === null)
        {
            this.Instances = [];
            return;
        }

        this.Instances = await this._client.GetInstances();
    }

    public async RefreshImages()
    {
        if (this.IsDisposed) return;

        if (this._client === null)
        {
            this.Images = [];
            return;
        }

        this.Images = await this._client.GetImages();
    }

    public async RefreshNetworks()
    {
        if (this.IsDisposed) return;

        if (this._client === null)
        {
            this.Networks = [];
            return;
        }

        this.Networks = await this._client.GetNetworks();
    }

    public async RefreshStoragePools()
    {
        if (this.IsDisposed) return;

        if (this._client === null)
        {
            this.StoragePools = [];
            return;
        }

        this.StoragePools = await this._client.GetStoragePools();
    }

    public async Refresh()
    {
        if (this.IsDisposed) return;

        let promises = [
            this.RefreshInstances(),
            this.RefreshImages(),
            this.RefreshNetworks(),
            this.RefreshStoragePools(),
        ];

        await Promise.all(promises);

        let refreshIntervall =
            vscode.workspace
            .getConfiguration(ConfigKeys.NAMESPACE)
            .get<number>(ConfigKeys.REFRESH_INTERVALL, 15);
        if (refreshIntervall < 1) refreshIntervall = 1;
        setTimeout(this.Refresh.bind(this), refreshIntervall * 1000);
    }

    public get Instances(): ILxdInstance[]
    {
        return this._instances;
    }

    public set Instances(instances: ILxdInstance[])
    {
        this._instances = instances;
        ExtensionVariables.Logger.info("instances updated: " + JSON.stringify(this._instances, null, 4));
        this._onDidChangeInstances.fire(this._instances);
    }

    public get Images(): ILxdImage[]
    {
        return this._images;
    }

    public set Images(images: ILxdImage[])
    {
        this._images = images;
        ExtensionVariables.Logger.info("images updated: " + JSON.stringify(this._images, null, 4));
        this._onDidChangeImages.fire(this._images);
    }

    public get Networks(): ILxdNetwork[]
    {
        return this._networks;
    }

    private set Networks(networks: ILxdNetwork[])
    {
        this._networks = networks;
        ExtensionVariables.Logger.info("networks updated: " + JSON.stringify(this._networks, null, 4));
        this._onDidChangeNetworks.fire(this._networks);
    }

    public get StoragePools(): ILxdStoragePool[]
    {
        return this._storagePools;
    }

    private set StoragePools(storagePools: ILxdStoragePool[])
    {
        this._storagePools = storagePools;
        ExtensionVariables.Logger.info("storage-pools updated: " + JSON.stringify(this._storagePools, null, 4));
        this._onDidChangeStoragePools.fire(this._storagePools);
    }
}

export interface ILxdInstance
{
    readonly Name: string;
    readonly Status: string;
}

export interface ILxdImage
{
    readonly Fingerprint: string;
}

export interface ILxdNetwork
{
    readonly Name: string;
}

export interface ILxdStoragePool
{
    readonly Name: string;
}
