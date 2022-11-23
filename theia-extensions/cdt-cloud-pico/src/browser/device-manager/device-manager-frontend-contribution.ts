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
import { AbstractViewContribution } from '@theia/core/lib/browser';
import { DeviceManagerViewWidget } from './device-manager-view-widget';

export const OpenDeviceManagerCommand = {
    id: 'device-manager-view.toggle',
};

export class DeviceManagerFrontendContribution extends AbstractViewContribution<DeviceManagerViewWidget> {
    constructor() {
        super({
            widgetId: DeviceManagerViewWidget.ID,
            widgetName: DeviceManagerViewWidget.LABEL,
            defaultWidgetOptions: {
                area: 'main',
            },
            toggleCommandId: OpenDeviceManagerCommand.id,
        });
    }
}
