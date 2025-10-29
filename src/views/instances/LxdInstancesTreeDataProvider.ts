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
import { ILxdInstance } from "../../lxd/LxdService";
import { ExtensionVariables } from "../../ExtensionVariables";

export class LxdInstancesTreeDataProvider implements vscode.TreeDataProvider<ILxdInstance>
{
    private readonly _onDidChangeTreeData: vscode.EventEmitter<ILxdInstance[]>;
    public readonly onDidChangeTreeData: vscode.Event<ILxdInstance[]>;

    constructor()
    {
        this._onDidChangeTreeData = new vscode.EventEmitter<ILxdInstance[]>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }

    public getTreeItem(element: ILxdInstance): vscode.TreeItem
    {
        return new vscode.TreeItem(element.Name);
    }

    public getChildren(element?: ILxdInstance | undefined): vscode.ProviderResult<ILxdInstance[]>
    {
        if (element)
        {
            return [];
        }
        else
        {
            return ExtensionVariables.LxdService.GetInstances();
        }
    }

    public getParent(element: ILxdInstance): vscode.ProviderResult<ILxdInstance>
    {
        return null;
    }

    public resolveTreeItem(
        item: vscode.TreeItem,
        element: ILxdInstance,
        token: vscode.CancellationToken):
        vscode.ProviderResult<vscode.TreeItem>
    {
        return item;
    }
}
