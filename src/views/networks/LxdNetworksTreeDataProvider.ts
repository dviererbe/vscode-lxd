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
import { ILxdNetwork } from "../../lxd/LxdService";
import { ExtensionVariables } from "../../ExtensionVariables";
import { Disposable } from "../../Disposable";

export class LxdNetworkTreeDataProvider extends Disposable implements vscode.TreeDataProvider<ILxdNetwork>
{
    private readonly _onDidChangeTreeData: vscode.EventEmitter<void>;
    public readonly onDidChangeTreeData: vscode.Event<void>;

    constructor()
    {
        super();
        this._onDidChangeTreeData = this.RegisterDisposable(new vscode.EventEmitter<void>());
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.RegisterDisposable(ExtensionVariables.LxdService.OnDidChangeNetworks(this.OnDidChangeNetworks, this));
    }

    private OnDidChangeNetworks(networks: ILxdNetwork[])
    {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ILxdNetwork): vscode.TreeItem
    {
        const tree = new vscode.TreeItem(element.Name);

        return tree;
    }

    public getChildren(element?: ILxdNetwork | undefined): vscode.ProviderResult<ILxdNetwork[]>
    {
        if (element)
        {
            return [];
        }
        else
        {
            return ExtensionVariables.LxdService.Networks;
        }
    }

    public getParent(element: ILxdNetwork): vscode.ProviderResult<ILxdNetwork>
    {
        return null;
    }

    public resolveTreeItem(
        item: vscode.TreeItem,
        element: ILxdNetwork,
        token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.TreeItem>
    {
        return item;
    }
}
