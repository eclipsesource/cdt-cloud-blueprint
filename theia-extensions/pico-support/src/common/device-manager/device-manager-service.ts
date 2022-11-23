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
import { JsonRpcServer } from '@theia/core';
import { Device } from './device';

export const DeviceListener = Symbol('DeviceListener');

export interface DeviceListener {
    notifyDeviceChange(device: Device): void;
}

export const deviceManagerServicePath = '/services/device-manager';

export const DeviceManagerService = Symbol('DeviceManagerService');

export interface DeviceManagerService extends JsonRpcServer<DeviceListener> {
    getAllDevices(): Promise<Device[]>;
}
