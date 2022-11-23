/********************************************************************************
 * Copyright (C) 2022 EclipseSource
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
import { bindViewContribution, WebSocketConnectionProvider, WidgetFactory } from '@theia/core/lib/browser';
import { TabBarToolbarContribution } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { interfaces } from '@theia/core/shared/inversify';
import { DeviceListener, DeviceManagerService, deviceManagerServicePath } from '../../common/device-manager/device-manager-service';
import { FrontendDeviceListener } from './device-listener';
import { DeviceManagerFrontendContribution } from './device-manager-frontend-contribution';
import { DeviceManagerViewWidget } from './device-manager-view-widget';

export const bindDeviceManager = ((bind: interfaces.Bind) => {
    bind(DeviceManagerViewWidget).toSelf();
    bind(WidgetFactory).toDynamicValue(context => ({
        id: DeviceManagerViewWidget.ID,
        createWidget: () => context.container.get<DeviceManagerViewWidget>(DeviceManagerViewWidget),
    })).inSingletonScope();
    bindViewContribution(bind, DeviceManagerFrontendContribution);

    bind(TabBarToolbarContribution).toService(DeviceManagerFrontendContribution);

    bind(FrontendDeviceListener).toSelf().inSingletonScope();
    bind(DeviceListener).toService(FrontendDeviceListener);

    bind(DeviceManagerService)
        .toDynamicValue(ctx => {
            const provider = ctx.container.get(WebSocketConnectionProvider);
            const listener: DeviceListener =
                ctx.container.get(DeviceListener);

            return provider.createProxy(deviceManagerServicePath, listener);
        })
        .inSingletonScope();
});
