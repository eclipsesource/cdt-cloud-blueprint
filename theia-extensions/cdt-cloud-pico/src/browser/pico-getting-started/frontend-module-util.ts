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
import '../../../src/browser/css/pico-getting-started.css';

import { bindViewContribution, FrontendApplicationContribution, WidgetFactory } from '@theia/core/lib/browser';
import { interfaces } from '@theia/core/shared/inversify';

import { PicoWelcomeFrontendContribution } from './frontend-contribution';
import { PicoWelcomeWidget } from './widget';

export const bindPicoWelcomeWidget = ((bind: interfaces.Bind) => {
    bindViewContribution(bind, PicoWelcomeFrontendContribution);
    bind(FrontendApplicationContribution).toService(PicoWelcomeFrontendContribution);
    bind(PicoWelcomeWidget).toSelf();
    bind(WidgetFactory)
        .toDynamicValue(context => ({
            id: PicoWelcomeWidget.ID,
            createWidget: () => context.container.get<PicoWelcomeWidget>(PicoWelcomeWidget)
        }))
        .inSingletonScope();
});
