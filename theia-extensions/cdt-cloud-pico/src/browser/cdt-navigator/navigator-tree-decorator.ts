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
import { Emitter, Event } from '@theia/core';
import { DepthFirstTreeIterator, Tree, TreeDecoration, TreeDecorator } from '@theia/core/lib/browser';
import { DecorationsService } from '@theia/core/lib/browser/decorations-service';
import { inject, injectable, postConstruct } from 'inversify';

import * as ProjectUtils from '../project-service/project-utils';

@injectable()
export class ProjectTreeDecorator implements TreeDecorator {

    readonly id = 'projectTreeDecorator';

    protected readonly onDidChangeDecorationsEmitter = new Emitter<(tree: Tree) => Map<string, TreeDecoration.Data>>();

    @inject(DecorationsService)
    protected readonly decorationsService: DecorationsService;

    @postConstruct()
    protected init(): void {
        this.decorationsService.onDidChangeDecorations(() => {
            this.fireDidChangeDecorations((tree: Tree) => this.collectDecorators(tree));
        });
    }

    get onDidChangeDecorations(): Event<(tree: Tree) => Map<string, TreeDecoration.Data>> {
        return this.onDidChangeDecorationsEmitter.event;
    }

    fireDidChangeDecorations(event: (tree: Tree) => Map<string, TreeDecoration.Data>): void {
        this.onDidChangeDecorationsEmitter.fire(event);
    }

    decorations(tree: Tree): Map<string, TreeDecoration.Data> {
        return this.collectDecorators(tree);
    }

    protected collectDecorators(tree: Tree): Map<string, TreeDecoration.Data> {
        const result = new Map<string, TreeDecoration.Data>();
        if (tree.root === undefined) {
            return result;
        }
        for (const node of new DepthFirstTreeIterator(tree.root)) {
            if (ProjectUtils.isProjectNode(node)) {
                const projectType = 'pico'; // TODO determine hardware type from .pico-project file via projectservice
                const projectDecoration: TreeDecoration.Data = {
                    tooltip: `CDT Cloud Pico ${projectType} project`,
                    captionSuffixes: [{
                        data: `${projectType} project`
                    }]

                };
                result.set(node.id, projectDecoration);
            }
        }
        return result;
    }
}
