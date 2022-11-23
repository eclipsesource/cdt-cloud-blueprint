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
import { Emitter, Event } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { Device } from '../../common/device-manager/device';
import { DeviceListener } from '../../common/device-manager/device-manager-service';

@injectable()
export class FrontendDeviceListener implements DeviceListener {

    protected onDeviceChangeEmitter = new Emitter<Device>();
    get onDeviceChange(): Event<Device> {
        return this.onDeviceChangeEmitter.event;
    }

    notifyDeviceChange(device: Device): void {
        this.onDeviceChangeEmitter.fire(device);
    }
}
