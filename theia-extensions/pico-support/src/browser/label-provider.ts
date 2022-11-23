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
import { LabelProviderContribution, TreeNode } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { injectable } from 'inversify';

import * as ProjectUtils from './project-service/project-utils';

@injectable()
export class ProjectTreeLabelProviderContribution implements LabelProviderContribution {
    canHandle(element: object): number {
        if (TreeNode.is(element)) {
            return ProjectUtils.isProjectNode(element) || ProjectUtils.isProjectFileNode(element) ? 1000 : 0;
        }
        if (element instanceof URI) {
            return ProjectUtils.isProjectFile(element) ? 1000 : 0;
        }
        return 0;
    }

    getIcon(element: object): string {
        if (TreeNode.is(element) && ProjectUtils.isProjectNode(element)) {
            return 'codicon codicon-folder default-folder-icon file-icon medium-blue';
        }
        if (element instanceof URI || (TreeNode.is(element) && ProjectUtils.isProjectFileNode(element))) {
            return 'cdt-cloud-icon default-file-icon';
        }
        return '';
    }
}
