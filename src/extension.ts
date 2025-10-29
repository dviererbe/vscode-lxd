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
import { RegisterViews } from './views/RegisterViews';
import { RegisterCommands } from './commands/RegisterCommands';
import { LxdService } from './lxd/LxdService';
import { ExtensionVariables } from "./ExtensionVariables";
import { EXTENSION_DISPLAY_NAME } from './Constants';

export async function activate(context: vscode.ExtensionContext)
{
    InitializeLogger(context);
    ExtensionVariables.LxdService = new LxdService();

	RegisterCommands(context);
	RegisterViews(context);
}

export function deactivate()
{
    ExtensionVariables.LxdService.dispose();
    ExtensionVariables.Logger.dispose();
}

function InitializeLogger(context: vscode.ExtensionContext)
{
    ExtensionVariables.Logger = vscode.window.createOutputChannel(
        EXTENSION_DISPLAY_NAME, // name
        { log: true }); // options

    if (context.extensionMode === vscode.ExtensionMode.Development)
    {
        ExtensionVariables.Logger.show();
    }
}
