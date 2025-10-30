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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Disposable } from '../Disposable';
import { ExtensionVariables } from '../ExtensionVariables';
import { LogLevel } from 'vscode';
import { ILxdImage, ILxdInstance } from './LxdService';

export class LxdClient extends Disposable
{
    private readonly _client: AxiosInstance;

    private constructor(readonly client: AxiosInstance)
    {
        super();
        this._client = client;
    }

    public static FromUnixSocket(path: string): LxdClient
    {
        const client = axios.create(
        {
            baseURL: "http://lxd",
            socketPath: path,
            headers:
            {
              "Content-Type": "application/json",
            }
        });

        return new LxdClient(client);
    }

    async GetInstances(options?: GetLxdInstancesOptions): Promise<ILxdInstance[]>
    {
        const requestOptions: AxiosRequestConfig =
        {
            method: "GET",
            url: "/1.0/instances",
            params: options,
        };

        const response = await this.Request(requestOptions);
        const promises: Promise<LxdResponse>[] = response.metadata.map((uri: string) => this.Request({method: "GET", url: uri}));

        var responses = await Promise.all(promises);
        return responses.map(response =>
        {
            const instance: ILxdInstance =
            {
                Name: response.metadata.name,
                Status: response.metadata.status,
            };

            return instance;
        });
    }

    async GetImages(options?: GetLxdInstancesOptions): Promise<ILxdImage[]>
    {
        const requestOptions: AxiosRequestConfig =
        {
            method: "GET",
            url: "/1.0/images",
            params: options,
        };

        const response = await this.Request(requestOptions);
        const promises: Promise<LxdResponse>[] = response.metadata.map((uri: string) => this.Request({method: "GET", url: uri}));

        var responses = await Promise.all(promises);
        return responses.map(response =>
        {
            const instance: ILxdImage =
            {
                Fingerprint: response.metadata.fingerprint,
            };

            return instance;
        });
    }

    private async Request(
        requestOptions: AxiosRequestConfig,
        throwOnError: boolean = true)
        : Promise<LxdResponse>
    {
        const requestUri = this._client.getUri(requestOptions);
        let logMessage = `> ${requestOptions.method} ${requestUri}`;
        let response: AxiosResponse<LxdResponse>;

        try
        {
            response = await this._client.request<LxdResponse>(requestOptions);
        }
        catch (error)
        {
            if (error instanceof Error)
            {
                logMessage += ` [${error.name}: ${error.message}]`;
            }
            else if (typeof error === "string")
            {
                logMessage += ` [${error}]`;
            }
            else if (typeof error === "object" && error !== null)
            {
                try
                {
                    logMessage += `\n${JSON.stringify(error, Object.getOwnPropertyNames(error), 4)}`;
                }
                catch
                {
                    logMessage += `[Unserializable object]`;
                }
            }
            else
            {
                logMessage += ` [${String(error)}]`;
            }

            ExtensionVariables.Logger.error(logMessage);
            throw error;
        }

        logMessage += ` [${response.status} ${response.statusText}]`;
        if (response.data && ExtensionVariables.Logger.logLevel === LogLevel.Trace)
        {
            // this method gets called a lot, so only generate the json string if neccessery:
            logMessage += `\n${JSON.stringify(response.data, null, 4)}`;
        }

        if (response.data.type === "error" && throwOnError)
        {
            ExtensionVariables.Logger.error(logMessage);
            throw new LxdClientError(
                `LXD daemon returned an error response (${response.data.error_code}: ${response.data.error}). See response metadata for more details.`,
                requestUri,
                response.data);
        }

        ExtensionVariables.Logger.debug(logMessage);
        return response.data;
    }
}

export class LxdClientError extends Error
{
    public readonly Response?: LxdResponse;
    public readonly RequestUri: string;

    constructor(message: string, requestUri: string, response?: LxdResponse)
    {
        super(message);
        this.Response = response;
        this.RequestUri = requestUri;
    }
}

export interface GetLxdInstancesOptions
{
    readonly "all-projects"?: boolean;
    readonly "project"?: string;
    readonly "filter"?: string;
}

interface LxdResponse
{
    type: "sync" | "async" | "error";
    status?: string;
    status_code?: number;
    operation?: string;
    metadata: any;
    error?: string;
    error_code?: number;
}
