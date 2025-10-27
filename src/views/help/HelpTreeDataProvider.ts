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

export class HelpTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem>
{
    private _treeItems: vscode.TreeItem[];
    
    constructor()
    {
        this._treeItems = [
            CreateUrlTreeItem(
                vscode.l10n.t("First steps with LXD"),
                "remote-explorer-get-started",
                "https://documentation.ubuntu.com/lxd/latest/tutorial/first_steps/"),
            CreateUrlTreeItem(
                vscode.l10n.t("LXD documentation"),
                "remote-explorer-documentation",
                "https://documentation.ubuntu.com/lxd/latest/"),
            CreateUrlTreeItem(
                vscode.l10n.t("LXC man pages"),
                "remote-explorer-documentation",
                "https://documentation.ubuntu.com/lxd/latest/reference/manpages/lxc/"),
            CreateUrlTreeItem(
                vscode.l10n.t("Review existing issues of the LXD extension"), 
                "remote-explorer-review-issues", 
                "https://github.com/dviererbe/vscode-lxd/issues"),
            CreateReportIssueTreeItem(),
        ];
    }

    public getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> 
    {
        return element;
    }

    public getChildren(element?: vscode.TreeItem | undefined): vscode.ProviderResult<vscode.TreeItem[]>
    {
        if (element)
        {
            return [];
        }
        else 
        {
            return this._treeItems;
        }
    }

    public getParent(element: vscode.TreeItem): vscode.ProviderResult<vscode.TreeItem> 
    {
        return null;    
    }

    public resolveTreeItem(
        item: vscode.TreeItem, 
        element: vscode.TreeItem, 
        token: vscode.CancellationToken)
        : vscode.ProviderResult<vscode.TreeItem> 
    {
        return Promise.resolve(element);
    }

    
}

function CreateUrlTreeItem(
    label: string,
    icon: string,
    url: string)
    : vscode.TreeItem
{
    const treeItem = new vscode.TreeItem(label);
    treeItem.iconPath = new vscode.ThemeIcon(icon);
    treeItem.command = {
        title: label,
        command: "vscode-lxd.commands.openUrl",
        arguments: [ url ]
    };

    return treeItem;
}    


function CreateReportIssueTreeItem()
{
    const label = vscode.l10n.t("Report an issue with the LXD extension");
    const treeItem = new vscode.TreeItem(label);
    treeItem.iconPath = new vscode.ThemeIcon("remote-explorer-report-issues");
    treeItem.command = {
        title: label,
        command: "vscode-lxd.commands.reportIssue",
    };

    return treeItem;
}

