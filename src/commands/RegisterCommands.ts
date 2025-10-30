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

import * as vscode from 'vscode';
import * as constants from "../Constants";
import { ExtensionVariables } from '../ExtensionVariables';

export function RegisterCommands(context: vscode.ExtensionContext)
{
	context.subscriptions.push(vscode.commands.registerCommand(
        "vscode-lxd.commands.refreshInstances",
        () => ExtensionVariables.LxdService.RefreshInstances()));

    context.subscriptions.push(vscode.commands.registerCommand(
        "vscode-lxd.commands.refreshImages",
        () => ExtensionVariables.LxdService.RefreshImages()));

    context.subscriptions.push(vscode.commands.registerCommand(
        "vscode-lxd.commands.refreshNetworks",
        () => ExtensionVariables.LxdService.RefreshNetworks()));

    context.subscriptions.push(vscode.commands.registerCommand(
        "vscode-lxd.commands.reportIssue",
        ReportIssue));

    context.subscriptions.push(vscode.commands.registerCommand(
        "vscode-lxd.commands.openUrl",
        OpenUrl));
}

async function ReportIssue()
{
    let issueData = `App Host: ${vscode.env.appHost}
Remote Name: ${vscode.env.remoteName}
Language: ${vscode.env.language}

`; // Add a couple newlines after the data because VSCode doesn't

    await vscode.commands.executeCommand(
        "workbench.action.openIssueReporter",
        {
            extensionId: constants.EXTENSION_ID,
            issueBody: undefined, // Leaving repro steps undefined forces the user to type
                                  // in *something*, which is hopefully helpful
            data: issueData,
        });
}

async function OpenUrl(url: string)
{
	await vscode.env.openExternal(vscode.Uri.parse(url));
}
