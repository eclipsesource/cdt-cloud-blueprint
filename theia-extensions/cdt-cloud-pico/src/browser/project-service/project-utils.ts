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

import { CompositeTreeNode, TreeNode } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { DirNode, FileStatNode } from '@theia/filesystem/lib/browser';

export function isProjectFile(fileUri: URI): boolean {
    return fileUri.path.ext === '.cdtcloud';
}

export function isProjectFileNode(node: TreeNode): boolean {
    // A CDTCloud project file is identified via a .cdtcloud file extension
    if (FileStatNode.is(node)) {
        return isProjectFile(node.uri);
    }
    return false;
}

export function isProjectNode(node: TreeNode): boolean {
    // A CDTCloud projects is identified via a .cdtcloud file that is one of its direct children
    if (DirNode.is(node) && CompositeTreeNode.is(node)) {
        for (const child of node.children) {
            if (FileStatNode.is(child) && isProjectFileNode(child)) {
                return true;
            }
        }
    }
    return false;
}

export function getBuildTaskLabel(projectName: string, debugBuild = false): string {
    return `Binary build ${debugBuild ? 'debug' : 'release'} (${projectName})`;
}
