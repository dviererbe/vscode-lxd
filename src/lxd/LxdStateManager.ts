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

import { LxdClient, LxdInstanceIdentifier } from "./LxdClient";
import { EventEmitter } from "stream";
import { Logger } from "../Logger";

export class LxdStateManager extends EventEmitter
{
    private static _instance?: LxdStateManager;

    public static get Instance(): LxdStateManager
    {
        if (this._instance) return this._instance;

        throw new Error("LXD state manager is not yet initialized.");
    }

    public static Initialize()
    {
        if (this._instance) return;

        const client = LxdClient.FromUnixDomainSocket("/var/snap/lxd/common/lxd/unix.socket");
        this._instance ??= new LxdStateManager(client);
        this._instance.Refresh();
    }

    private _client: LxdClient;

    private _instances: LxdInstanceIdentifier[];

    private constructor(readonly client: LxdClient)
    {
        super();
        this._client = client;
        this._instances = [];
    }

    public async Refresh()
    {
        try
        {
            this._instances = await this._client.GetInstances({AllProjects: true});
        }
        catch (error)
        {
            this._instances = [];
            Logger.LogFatal("Failed to refresh propperly.");
        }

        this.emit("refresh", this);
    }

    public get Instances(): LxdInstanceIdentifier[]
    {
        return this._instances;
    }
}
