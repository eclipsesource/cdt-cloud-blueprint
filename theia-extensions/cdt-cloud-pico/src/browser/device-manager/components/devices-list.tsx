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
import * as React from '@theia/core/shared/react';
import '../../../../src/browser/device-manager/components/devices.css';
import { Device } from '../../../common/device-manager/device';

export interface LoadingState {
    type: 'loading';
}
export interface ErrorState {
    type: 'error';
    error?: string;
}
export interface SuccessState {
    type: 'success';
    devices: Device[];
}

export type DevicesState = LoadingState | ErrorState | SuccessState;

export interface LoadingDevicesListProps {
    state: DevicesState;
}

export const LoadingDevicesList: React.FC<LoadingDevicesListProps> = ({
    state,
}) => {
    if (state.type === 'loading') {
        return <div className="loading">Loading...</div>;
    }
    if (state.type === 'error') {
        return (
            <div>
                <div className="error-header">An error occured</div>
                {state.error && <div className="error-message">{state.error}</div>}
            </div>
        );
    }
    return <DevicesList devices={state.devices} />;
};

export interface DevicesListProps {
    devices: Device[];
}

export const DevicesList: React.FC<DevicesListProps> = ({ devices }) => (
    <div>
        <h1><span className='title'>Available Devices</span></h1>
        <ul className='devices-ul'>
         {devices.map(device => (
            <li className='devices-li' key={device.id}>
                <Device device={device} />
            </li>
        ))}
        </ul>
    </div>
);

interface DeviceProps {
    device: Device;
}

const Device: React.FC<DeviceProps> = ({ device }) => (
    <div>
        <table className="device-header">
            <tr>
                <td className="device-label">{device.label}</td>
                <td className="device-indicator">
                <DeviceIndicator color={device.connected ? 'green' : 'red'} />
                </td>
            </tr>
        </table>
        <div className="device-data">
            <DeviceData device={device} />
        </div>
    </div>
);

interface DeviceIndicatorProps {
    color: 'green' | 'orange' | 'red';
    flashing?: boolean;
}

const DeviceIndicator: React.FC<DeviceIndicatorProps> = ({ color }) => (
    <div className={'circle ' + color} />
);
interface DeviceDataProps {
    device: Device;
}
const DeviceData: React.FC<DeviceDataProps> = ({ device }) => (
    <table className='table-data-device'>
        <tr>
            <td className='table-data-td'>Id:</td>
            <td className='table-data-td'>{device.id}</td>
        </tr>
        <tr>
            <td className='table-data-td'>Connected:</td>
            <td className='table-data-td'>{device.connected ? 'yes' : 'no'}</td>
        </tr>
        <tr>
            <td className='table-data-td'>Flashed Image:</td>
            <td className='table-data-td'>{device.image}</td>
        </tr>
        <tr>
            <td className='table-data-td'>State:</td>
            <td className='table-data-td'>{device.state}</td>
        </tr>
    </table>
);
