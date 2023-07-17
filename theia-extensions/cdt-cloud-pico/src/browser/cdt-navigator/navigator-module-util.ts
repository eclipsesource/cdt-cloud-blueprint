/********************************************************************************
 * Copyright (C) 2022-2023 EclipseSource and others.
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
import { WidgetFactory } from '@theia/core/lib/browser';
import { interfaces } from '@theia/core/shared/inversify';
import { FILE_NAVIGATOR_ID, NavigatorTreeDecorator } from '@theia/navigator/lib/browser';
import { createFileNavigatorWidget } from './navigator-container';
import { ProjectTreeDecorator } from './navigator-tree-decorator';
import { PicoFileNavigatorWidget } from './navigator-widget';

export const bindCDTCloudPicoNavigator = ((bind: interfaces.Bind) => {
    bind(PicoFileNavigatorWidget).toDynamicValue(ctx =>
        createFileNavigatorWidget(ctx.container)
    );
    bind(WidgetFactory).toDynamicValue(({ container }) => ({
        id: FILE_NAVIGATOR_ID,
        createWidget: () => container.get(PicoFileNavigatorWidget)
    })).inSingletonScope();

    bind(ProjectTreeDecorator).toSelf().inSingletonScope();
    bind(NavigatorTreeDecorator).toService(ProjectTreeDecorator);
});

