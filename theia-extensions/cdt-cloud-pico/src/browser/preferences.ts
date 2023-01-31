/********************************************************************************
 * Copyright (C) 2022 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import { PreferenceContribution, PreferenceProxy, PreferenceSchema } from '@theia/core/lib/browser';
import { PreferenceProxyFactory } from '@theia/core/lib/browser/preferences/injectable-preference-proxy';
import { PreferenceScope } from '@theia/core/lib/common/preferences/preference-scope';
import { interfaces } from 'inversify';

export const OPEN_OCD_PATH_SETTING_ID = 'pico.openocd.path';
export const GDB_MULTIARCH_PATH_SETTING_ID = 'pico.gdbmultiarch.path';

export const PicoConfigSchema: PreferenceSchema = {
    type: 'object',
    properties: {
        [OPEN_OCD_PATH_SETTING_ID]: {
            type: 'string',
            description: 'Pico OpenOCD binary or absolute path',
            default: 'openocd',
            scope: PreferenceScope.Workspace
        },
        [GDB_MULTIARCH_PATH_SETTING_ID]: {
            type: 'string',
            description: 'Pico GDB path',
            default: '/usr/bin/gdb-multiarch',
            scope: PreferenceScope.Workspace
        }
    }
};

export interface RidePreferenceConfiguration {
    [OPEN_OCD_PATH_SETTING_ID]: string;
    [GDB_MULTIARCH_PATH_SETTING_ID]: string;
}

export const PicoPreferences = Symbol('PicoPreferences');
export type PicoPreferences = PreferenceProxy<RidePreferenceConfiguration>;

export function bindPicoPreferences(bind: interfaces.Bind): void {
    bind(PicoPreferences).toDynamicValue(ctx => {
        const factory = ctx.container.get<PreferenceProxyFactory>(PreferenceProxyFactory);
        return factory(PicoConfigSchema);
    });
    bind(PreferenceContribution).toConstantValue({ schema: PicoConfigSchema });
}

