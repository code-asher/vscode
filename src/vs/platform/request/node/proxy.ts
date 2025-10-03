/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { parse as parseUrl, Url } from 'url';
import { isBoolean } from '../../../base/common/types.js';
import { createProxyResolver } from '@vscode/proxy-agent';

export type Agent = any;

export interface IOptions {
	proxyUrl?: string;
	strictSSL?: boolean;
}

export async function getProxyAgent(rawRequestURL: string, env: typeof process.env, options: IOptions = {}): Promise<Agent> {
	const { resolveProxyURL } = createProxyResolver({
		getProxyURL: () => {
			return options.proxyUrl;
		},
	});

	const proxyURL = await resolveProxyURL(rawRequestURL)
	if (!proxyURL) {
		return null;
	}

	const proxyEndpoint = parseUrl(proxyURL);

	if (!/^https?:$/.test(proxyEndpoint.protocol || '')) {
		return null;
	}

	const opts = {
		host: proxyEndpoint.hostname || '',
		port: (proxyEndpoint.port ? +proxyEndpoint.port : 0) || (proxyEndpoint.protocol === 'https' ? 443 : 80),
		auth: proxyEndpoint.auth,
		rejectUnauthorized: isBoolean(options.strictSSL) ? options.strictSSL : true,
	};

	if (requestURL.protocol === 'http:') {
		const { default: mod } = await import('http-proxy-agent');
		return new mod.HttpProxyAgent(proxyURL, opts);
	} else {
		const { default: mod } = await import('https-proxy-agent');
		return new mod.HttpsProxyAgent(proxyURL, opts);
	}
}
