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
import { Logger, LogLevel } from "../Logger";

export class LxdClient
{
    private readonly _client: AxiosInstance;

    private constructor(readonly client: AxiosInstance)
    {
        this._client = client;
    }    

    public static FromUnixDomainSocket(path: string): LxdClient
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
    
    async GetInstances(options?: GetLxdInstancesOptions): Promise<LxdInstanceIdentifier[]> 
    {
        const requestOptions: AxiosRequestConfig = 
        {
            method: "GET",
            url: "/1.0/instances",
            params: {},
        };

        if (options)
        {
            if (options.AllProjects)
            {
                requestOptions.params["all-projects"] = "true";
            }
            if (options.Project)
            {
                requestOptions.params["project"] = options.Project;
            }
            if (options.Filter)
            {
                requestOptions.params["filter"] = options.Filter;
            }
        }

        const response = await this.Request(requestOptions);
        const uris: string[] = response.metadata;
        
        return uris.map(uri => {
            const prefix = "/1.0/instances/";
            const url = new URL(uri, this.client.defaults.baseURL)
            
            if (!url.pathname.startsWith(prefix))
            {
                throw new Error(`Instance uri (${uri}) does not start with '${prefix}'.`);
            }

            const instanceId: LxdInstanceIdentifier = {
                Name: url.pathname.slice(prefix.length),
                Project: url.searchParams.get("project"),
            };

            return instanceId;
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
            
            Logger.LogError(logMessage)
            throw error;
        }
        
        logMessage += ` [${response.status} ${response.statusText}]`
        if (Logger.Instance.MinimalLogLevel == LogLevel.Trace && response.data)
        {
            // this method gets called a lot, so only generate the json string if neccessery:
            logMessage += `\n${JSON.stringify(response.data, null, 4)}`;
        }

        if (response.data.type === "error" && throwOnError)
        {
            Logger.LogError(logMessage);
            throw new LxdClientError(
                `LXD daemon returned an error response (${response.data.error_code}: ${response.data.error}). See response metadata for more details.`, 
                requestUri,
                response.data);
        }
            
        Logger.LogDebug(logMessage);
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
    readonly AllProjects?: boolean;
    readonly Project?: string;
    readonly Filter?: string;
}

export interface LxdInstanceIdentifier
{
    readonly Name: string;
    readonly Project: string | null;
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
