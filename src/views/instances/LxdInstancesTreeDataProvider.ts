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
import { LxdInstanceIdentifier } from "../../lxd/LxdClient";
import { LxdStateManager } from "../../lxd/LxdStateManager";

export class LxdInstancesTreeDataProvider implements vscode.TreeDataProvider<LxdInstanceIdentifier>
{
    private readonly _onDidChangeTreeData: vscode.EventEmitter<LxdInstanceIdentifier[]>;
    public readonly onDidChangeTreeData: vscode.Event<LxdInstanceIdentifier[]>;
    
    constructor()
    {
        this._onDidChangeTreeData = new vscode.EventEmitter<LxdInstanceIdentifier[]>();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    
    getTreeItem(element: LxdInstanceIdentifier): vscode.TreeItem 
    {
        return new vscode.TreeItem(element.Name);
    }

    getChildren(element?: LxdInstanceIdentifier | undefined): vscode.ProviderResult<LxdInstanceIdentifier[]> 
    {
        if (element)
        {
            return [];
        }
        else
        {
            return LxdStateManager.Instance.Instances;
        }
    }

    getParent(element: LxdInstanceIdentifier): vscode.ProviderResult<LxdInstanceIdentifier> 
    {
        return null;
    }

    resolveTreeItem(
        item: vscode.TreeItem, 
        element: LxdInstanceIdentifier, 
        token: vscode.CancellationToken): 
        vscode.ProviderResult<vscode.TreeItem> 
    {
        return item;
    }

    
    
}
