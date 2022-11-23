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
import { JsonRpcServer } from '@theia/core';
import { HardwareType, ProjectTemplate } from './project-types';

export const projectServicePath = '/services/cdtCloudProjectService';

export const ProjectService = Symbol('ProjectService');
export interface ProjectService extends JsonRpcServer<ProjectClient> {
    createProject(workspacePath: string, projectName: string, hardwareType: HardwareType, projectTemplate: ProjectTemplate): Promise<string>;
    deleteProject(projectPath: string, projectName: string): Promise<void>;
}

export const ProjectClient = Symbol('ProjectClient');
export interface ProjectClient {
}
