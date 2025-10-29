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

export abstract class Disposable implements vscode.Disposable
{
    private _isDisposed = false;
    private _disposables: vscode.Disposable[] = [];

    public dispose(): any
    {
        if (this._isDisposed) return;
        this._isDisposed = true;

        let errors: any[] = [];

        for (const disposable of this._disposables)
        {
            try {
                disposable.dispose();
            }
            catch (error) {
                errors.push(error);
            }
        }

        if (errors.length === 1) throw errors[0];
        if (errors.length > 1) throw new AggregateError(errors, 'Encountered errors while disposing');
    }

    protected get IsDisposed()
    {
        return this._isDisposed;
    }

    protected RegisterDisposable<T extends vscode.Disposable>(value: T): T
    {
        if (this._isDisposed)
        {
            value.dispose();
        }
        else
        {
            this._disposables.push(value);
        }

        return value;
    }
}
