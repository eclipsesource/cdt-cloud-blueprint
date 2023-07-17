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
import { Container, interfaces } from '@theia/core/shared/inversify';
import { createFileTreeContainer } from '@theia/filesystem/lib/browser';
import { FileNavigatorModel } from '@theia/navigator/lib/browser';
import { FILE_NAVIGATOR_PROPS } from '@theia/navigator/lib/browser/navigator-container';
import { NavigatorDecoratorService } from '@theia/navigator/lib/browser/navigator-decorator-service';
import { FileNavigatorTree } from '@theia/navigator/lib/browser/navigator-tree';

import { PicoFileNavigatorWidget } from './navigator-widget';

export function createFileNavigatorContainer(parent: interfaces.Container): Container {
    const child = createFileTreeContainer(parent, {
        tree: FileNavigatorTree,
        model: FileNavigatorModel,
        widget: PicoFileNavigatorWidget,
        decoratorService: NavigatorDecoratorService,
        props: FILE_NAVIGATOR_PROPS,
    });

    return child;
}

export function createFileNavigatorWidget(parent: interfaces.Container): PicoFileNavigatorWidget {
    return createFileNavigatorContainer(parent).get(PicoFileNavigatorWidget);
}
