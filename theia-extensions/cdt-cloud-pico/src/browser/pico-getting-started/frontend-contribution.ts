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
import { AbstractViewContribution, CommonMenus, FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { FrontendApplicationStateService } from '@theia/core/lib/browser/frontend-application-state';
import { CommandRegistry, MaybePromise, MenuModelRegistry } from '@theia/core/lib/common';
import { FileNavigatorContribution } from '@theia/navigator/lib/browser/navigator-contribution';
import { inject, injectable } from 'inversify';

import { PicoWelcomeWidget } from './widget';

export const PicoWelcomeCommand = {
    id: PicoWelcomeWidget.ID,
    label: PicoWelcomeWidget.LABEL
};

@injectable()
export class PicoWelcomeFrontendContribution
    extends AbstractViewContribution<PicoWelcomeWidget>
    implements FrontendApplicationContribution {
    @inject(FrontendApplicationStateService)
    protected readonly stateService: FrontendApplicationStateService;
    @inject(FileNavigatorContribution)
    protected readonly fileNavigatorContribution: FileNavigatorContribution;

    constructor() {
        super({
            widgetId: PicoWelcomeWidget.ID,
            widgetName: PicoWelcomeWidget.LABEL,
            defaultWidgetOptions: {
                area: 'right',
                rank: 1000
            }
        });
    }

    async onStart(_app: FrontendApplication): Promise<void> {
        // open on startup
        this.stateService.reachedState('ready').then(a => this.openView({ reveal: true }));
    }

    initializeLayout(_app: FrontendApplication): MaybePromise<void> {
        this.fileNavigatorContribution.openView({ reveal: true });
    }

    override registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(PicoWelcomeCommand, {
            execute: () => this.openView({ reveal: true })
        });
    }

    override registerMenus(registry: MenuModelRegistry): void {
        registry.registerMenuAction(CommonMenus.HELP, {
            commandId: PicoWelcomeCommand.id,
            label: PicoWelcomeCommand.label,
            order: 'a11'
        });
    }
}

