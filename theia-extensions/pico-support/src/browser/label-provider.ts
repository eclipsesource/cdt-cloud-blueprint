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
import { CompositeTreeNode, LabelProviderContribution, TreeNode } from '@theia/core/lib/browser';
import { FileStatNode } from '@theia/filesystem/lib/browser';
import { injectable } from 'inversify';

@injectable()
export class CDTCloudTreeLabelProviderContribution implements LabelProviderContribution {
    canHandle(explorerTreeNode: object): number {
        // Decorate CDTCloud projects
        // - a CDTCloud projects is identified via a .cdtcloud file that is on of its direct children
        if (TreeNode.is(explorerTreeNode) && CompositeTreeNode.is(explorerTreeNode)) {
            for (const child of explorerTreeNode.children) {
                if (FileStatNode.is(child) && child.uri.path.ext === '.cdtcloud') {
                    return 1000;
                }
            }
        }

        return 0;
    }

    getIcon(): string {
        return 'cdt-cloud-icon default-file-icon';
    }
}
