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
import { Logger, LogLevel } from "./Logger";
import { LxdStateManager } from './lxd/LxdStateManager';

export async function activate(context: vscode.ExtensionContext)
{
	Logger.LogDebug("extension activated");
	if (context.extensionMode === vscode.ExtensionMode.Development)
	{
		Logger.Instance.MinimalLogLevel = LogLevel.Trace;
		Logger.Instance.ShowLogs();
	}

	LxdStateManager.Initialize();

	RegisterCommands(context);
	RegisterViews(context);

}

export function deactivate()
{
	Logger.LogDebug("extension deactivated");
	// ensure that this is the last thing that gets disposed
	Logger.Instance.dispose();
}
