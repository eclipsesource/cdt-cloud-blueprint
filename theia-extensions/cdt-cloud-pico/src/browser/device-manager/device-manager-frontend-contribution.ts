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
import { AbstractViewContribution, codicon } from '@theia/core/lib/browser';
import { TabBarToolbarContribution, TabBarToolbarRegistry } from '@theia/core/lib/browser/shell/tab-bar-toolbar';
import { CommandRegistry } from '@theia/core/lib/common/command';
import { REFRESH__QUICK_PICK, TOGGLE__VIEW } from './device-manager-commands';
import { DeviceManagerViewWidget, isDeviceManagerViewWidget } from './device-manager-view-widget';

export class DeviceManagerFrontendContribution extends AbstractViewContribution<DeviceManagerViewWidget> implements TabBarToolbarContribution {
    constructor() {
        super({
            widgetId: DeviceManagerViewWidget.ID,
            widgetName: DeviceManagerViewWidget.LABEL,
            defaultWidgetOptions: {
                area: 'main',
            },
            toggleCommandId: TOGGLE__VIEW.id,
        });
    }
    registerCommands(registry: CommandRegistry): void {
        super.registerCommands(registry);
        registry.registerCommand(REFRESH__QUICK_PICK, {
            execute: widget => {
                if (isDeviceManagerViewWidget(widget)) {
                    widget.refresh();
                }
            },
            isVisible: widget => isDeviceManagerViewWidget(widget),
            isEnabled: widget => isDeviceManagerViewWidget(widget)
        });
    }
    registerToolbarItems(registry: TabBarToolbarRegistry): void {
        registry.registerItem({
            id: REFRESH__QUICK_PICK.id,
            command: REFRESH__QUICK_PICK.id,
            icon: codicon('refresh')
        });
    }
}
