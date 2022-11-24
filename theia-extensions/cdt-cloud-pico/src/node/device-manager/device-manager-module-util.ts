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
import { ConnectionHandler, JsonRpcConnectionHandler } from '@theia/core';
import { interfaces } from '@theia/core/shared/inversify';
import { DeviceListener, DeviceManagerService, deviceManagerServicePath } from '../../common/device-manager/device-manager-service';
import { PicotoolDeviceManagerService } from './device-manager-backend-service';

export const bindDeviceManager = (bind: interfaces.Bind) => {
    bind(DeviceManagerService)
        .to(PicotoolDeviceManagerService)
        .inSingletonScope();
    bind(ConnectionHandler)
        .toDynamicValue(
            ctx =>
                new JsonRpcConnectionHandler<DeviceListener>(
                    deviceManagerServicePath,
                    client => {
                        const deviceManagerService =
                            ctx.container.get<DeviceManagerService>(
                                DeviceManagerService
                            );
                        deviceManagerService.setClient(client);
                        return deviceManagerService;
                    }
                )
        )
        .inSingletonScope();
};
