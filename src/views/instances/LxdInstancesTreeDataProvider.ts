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
import { Disposable } from "../../Disposable";

export class LxdInstancesTreeDataProvider extends Disposable implements vscode.TreeDataProvider<ILxdInstance>
{
    private readonly _onDidChangeTreeData: vscode.EventEmitter<void>;
    public readonly onDidChangeTreeData: vscode.Event<void>;

    constructor()
    {
        super();
        this._onDidChangeTreeData = this.RegisterDisposable(new vscode.EventEmitter<void>());
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;

        this.RegisterDisposable(ExtensionVariables.LxdService.OnDidChangeInstances(this.OnDidChangeInstances, this));
    }

    private OnDidChangeInstances(instances: ILxdInstance[])
    {
        this._onDidChangeTreeData.fire();
    }

    public getTreeItem(element: ILxdInstance): vscode.TreeItem
    {
        const tree = new vscode.TreeItem(element.Name);
        tree.description = element.Status;

        return tree;
    }

    public getChildren(element?: ILxdInstance | undefined): vscode.ProviderResult<ILxdInstance[]>
    {
        if (element)
        {
            return [];
        }
        else
        {
            return ExtensionVariables.LxdService.Instances;
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
