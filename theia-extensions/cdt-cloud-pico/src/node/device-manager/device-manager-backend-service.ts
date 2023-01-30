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
import { injectable } from '@theia/core/shared/inversify';
import { exec, ExecException } from 'child_process';
import { Device } from '../../common/device-manager/device';
import { DeviceManagerService } from '../../common/device-manager/device-manager-service';

@injectable()
export class PicotoolDeviceManagerService implements DeviceManagerService {

    refreshInterval: NodeJS.Timer;

    private devices = <Device[]>[];
    private discoveryError?: Error;

    async discoverDevices(): Promise<Device[]> {
        return new Promise((resolve, reject) => {
            // TODO: Get picotool path from the preferences
            exec('picotool info -b', (error: ExecException | null, stdout: string, stderr: string) => {
                // Exit 249 happens on failure to find any devices in BOOTSEL mode
                if (!!error && error.code !== 249) {
                    const message = 'Failed to execute picotool to discover connected devices.';
                    this.devices = [];
                    this.setDiscoveryError(`${message}\nReason: ${error.message}`);
                } else if (stdout) {
                    try {
                        this.devices = this.parseDevices(stdout);
                        this.discoveryError = undefined;
                    } catch (parseError) {
                        this.devices = [];
                    }
                } else {
                    this.devices = [];
                    this.discoveryError = undefined;
                }

                if (this.discoveryError) {
                    reject(this.discoveryError);
                } else {
                    resolve(this.devices);
                }
            });
        });
    }

    async getAllDevices(): Promise<Device[]> {
        return this.discoverDevices();
    }

    dispose(): void {
        clearInterval(this.refreshInterval);
    }

    // TODO: Handle multiple devices?
    protected parseDevices(text: string): Device[] {
        if (/No accessible RP2040 devices in BOOTSEL mode were found/.test(text)) {
            return this.parseNoBootselDevices(text);
        }

        let binName = 'unknown';
        let binFeatures = 'unknown';

        let inBinInfo = false;
        for (const line of text.split('\n')) {
            if (/Program Information/.test(line)) {
                inBinInfo = true;
                continue;
            }
            if (inBinInfo) {
                const parsedLine = /^([^:]+):\s*(.*)$/.exec(line);
                if (parsedLine) {
                    const name = parsedLine[1].trim() || '';
                    const value = parsedLine[2].trim() || '';

                    switch (name) {
                        case 'name':
                            binName = value;
                            break;
                        case 'features':
                            binFeatures = value;
                            break;
                    }
                }
            }
            if (/^\s*$/.test(line)) {
                // Done
                break;
            }
        }

        return [{
            id: 'unknown',
            label: binName,
            connected: true,
            image: `${binName}.elf`,
            state: 'BOOTSEL',
            deviceType: {
                id: 'Raspberry Pi Pico',
                description: `Features: ${binFeatures}`
            }
        }];
    }

    protected setDiscoveryError(message: string): void {
        this.discoveryError = new Error(message);
        console.error(this.discoveryError);
    }

    protected parseNoBootselDevices(text: string): Device[] {
        if (/appears to be a RP2040 device/.test(text) && /picotool was unable to connect/) {
            const bus = this.parseDeviceBus(text);
            return [
                {
                    id: `/dev/sda${bus}`,
                    label: 'Unknown RP2040 device',
                    connected: false,
                    image: 'unknown',
                    state: 'Picotool cannot connect. Check permissions.',
                    deviceType: {
                        id: 'Raspberry Pi Pico'
                    }
                },
            ];
        }
        if (/appears to be a (?:RP2040 )PicoProbe device/.test(text)) {
            const bus = this.parseDeviceBus(text);
            return [
                {
                    id: `/dev/sda${bus}`,
                    label: 'RP2040 PicoProbe device',
                    connected: true,
                    image: 'picoprobe.elf',
                    state: 'Running',
                    deviceType: {
                        id: 'Raspberry Pi Pico'
                    }
                },
            ];
        }

        // This is the "No devices found in BOOTSEL mode" message
        const summary = text.split('\n')[0].trim();
        throw new Error(summary);
    }

    protected parseDeviceBus(text: string): string {
        const busMatch = /at bus ([\d+])/.exec(text);
        const bus = busMatch?.[1];
        return bus || '0';
    }
}
