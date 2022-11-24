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
import { MaybePromise, nls } from '@theia/core';
import { NavigatableWidgetOpenHandler, NavigatableWidgetOptions, OpenHandler, WidgetFactory, WidgetOpenerOptions } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { injectable, interfaces } from '@theia/core/shared/inversify';
import { ProjectEditorWidget, ProjectEditorWidgetOptions } from './project-editor-widget';

export const bindProjectEditor = ((bind: interfaces.Bind) => {
    bind(OpenHandler).to(ProjectEditorOpenHandler).inSingletonScope();
    bind<WidgetFactory>(WidgetFactory).toDynamicValue(context => ({
        id: ProjectEditorOpenHandler.ID,
        createWidget: (options: NavigatableWidgetOptions) => {
            const container = context.container.createChild();
            const uri = new URI(options.uri);
            const id = createID(uri, options.counter);
            container.bind(ProjectEditorWidgetOptions).toConstantValue({ ...options, id });
            container.bind(ProjectEditorWidget).toSelf();
            return container.get(ProjectEditorWidget);
        }
    }));
});

@injectable()
export class ProjectEditorOpenHandler extends NavigatableWidgetOpenHandler<ProjectEditorWidget> {
    static ID = 'project-editor-opener';

    readonly id = ProjectEditorOpenHandler.ID;
    readonly label = nls.localize('cdt-cloud-pico/project-editor', 'Project Editor');

    canHandle(uri: URI, options?: WidgetOpenerOptions): MaybePromise<number> {
        return uri.path.ext === '.cdtcloud' ? 500 : -1;
    }
}

function createID(uri: URI, counter?: number): string {
    return ProjectEditorOpenHandler.ID + `:${uri.toString()}` + (counter !== undefined ? `:${counter}` : '');
}
