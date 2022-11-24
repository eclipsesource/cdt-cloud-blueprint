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
import { interfaces } from '@theia/core/shared/inversify';
import { ToolbarDefaultsFactory } from '@theia/toolbar/lib/browser/toolbar-defaults';
import { DeflatedToolbarTree, ToolbarAlignment } from '@theia/toolbar/lib/browser/toolbar-interfaces';

export const bindToolbarContribution = (rebind: interfaces.Rebind): void => {
    rebind(ToolbarDefaultsFactory).toConstantValue(ToolbarDefaultsOverride);
};

export const ToolbarDefaultsOverride: () => DeflatedToolbarTree = () => ({
    items: {
        [ToolbarAlignment.LEFT]: [
            [
                {
                    id: 'textEditor.commands.go.back',
                    command: 'textEditor.commands.go.back',
                    icon: 'codicon codicon-arrow-left'
                },
                {
                    id: 'textEditor.commands.go.forward',
                    command: 'textEditor.commands.go.forward',
                    icon: 'codicon codicon-arrow-right'
                }
            ],
            [
                {
                    id: 'workbench.action.splitEditorRight',
                    command: 'workbench.action.splitEditor',
                    icon: 'codicon codicon-split-horizontal'
                }
            ],
            [
                {
                    id: 'cdtcloud.pico.project.create',
                    command: 'cdtcloud.pico.project.create',
                    icon: 'codicon codicon-file-directory-create'
                }
            ]
        ],
        [ToolbarAlignment.CENTER]: [],
        [ToolbarAlignment.RIGHT]: [
            [
                {
                    id: 'device-manager-view.toggle',
                    command: 'device-manager-view.toggle',
                    icon: 'codicon codicon-circuit-board'
                },
                {
                    id: 'workbench.action.showCommands',
                    command: 'workbench.action.showCommands',
                    icon: 'codicon codicon-terminal',
                    tooltip: 'Command Palette'
                }
            ]
        ]
    }
});
