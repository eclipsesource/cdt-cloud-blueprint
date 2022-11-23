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
import { codicon, ReactWidget } from '@theia/core/lib/browser';
import { nls } from '@theia/core/lib/common/nls';
import {
    inject,
    injectable,
    postConstruct
} from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { DeviceManagerService } from '../../common/device-manager/device-manager-service';
import { DevicesState, LoadingDevicesList } from './components/devices-list';

export const isDeviceManagerViewWidget = (o: unknown): o is DeviceManagerViewWidget => typeof o === 'object' && o instanceof DeviceManagerViewWidget;

@injectable()
export class DeviceManagerViewWidget extends ReactWidget {
    static readonly ID = 'device-manager';
    static readonly LABEL = nls.localize(
        'cdt-cloud/device-manager/view/device-manager',
        'Device Manager'
    );

    @inject(DeviceManagerService)
    protected readonly deviceManagerService: DeviceManagerService;

    protected devicesState: DevicesState = { type: 'loading' };

    @postConstruct()
    init(): void {
        this.id = DeviceManagerViewWidget.ID;
        this.title.label = DeviceManagerViewWidget.LABEL;
        this.title.iconClass = codicon('circuit-board');
        this.title.closable = true;
        this.update();
        this.refresh();
    }

    refresh(): void {
        this.deviceManagerService
            .getAllDevices()
            .then(devices => {
                this.devicesState = { type: 'success', devices };
                this.update();
            })
            .catch(error => {
                this.devicesState = { type: 'error', error: error.message };
                this.update();
            });
    }

    render(): React.ReactNode {
        return <LoadingDevicesList state={this.devicesState} />;
    }
}
