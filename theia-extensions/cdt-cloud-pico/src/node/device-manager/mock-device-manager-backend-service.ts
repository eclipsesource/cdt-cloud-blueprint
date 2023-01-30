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
import { injectable, postConstruct } from '@theia/core/shared/inversify';
import { Device } from '../../common/device-manager/device';
import { DeviceManagerService } from '../../common/device-manager/device-manager-service';

const deviceMocks = [
    {
        id: 'f46d05a1-1a18-4ec8-974e-17ffc6d14e04',
        label: 'Picoprobe',
        connected: false,
        image: 'picoprobe.uf2',
        state: 'unknown',
        deviceType: {
            id: 'Raspberry Pi Pico'
        }
    },
    {
        id: 'unknown',
        label: 'unknown',
        connected: true,
        image: 'unknown',
        state: 'unknown',
        deviceType: {
            id: 'unknown'
        }
    },
    {
        id: 'bbroygbvgwgs',
        label: 'My Development Pico',
        connected: true,
        image: 'blink.elf',
        state: 'debug',
        deviceType: {
            id: 'Raspberry Pi Pico'
        }
    },
];

@injectable()
export class MockDeviceManagerService implements DeviceManagerService {

    randomChangeInterval: NodeJS.Timer;

    @postConstruct()
    init(): void {
        this.changeRandom.bind(this);
        this.randomChangeInterval = setInterval(this.changeRandom, 1500);
    }

    changeRandom(): void {
        const index = Math.floor(Math.random() * deviceMocks.length);
        deviceMocks[index].connected = !deviceMocks[index].connected;
    }

    async getAllDevices(): Promise<Device[]> {
        return deviceMocks;
    }

    dispose(): void {
        clearInterval(this.randomChangeInterval);
    }
}
