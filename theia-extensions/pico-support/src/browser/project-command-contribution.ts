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

import {
    Command,
    CommandContribution,
    CommandRegistry,
    CommandService,
    MenuContribution,
    MenuModelRegistry,
    MessageService,
    QuickInputService,
    QuickPickValue,
    SelectionService
} from '@theia/core';
import { CommonMenus, ConfirmDialog } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { FileNavigatorCommands, NavigatorContextMenu } from '@theia/navigator/lib/browser/navigator-contribution';
import { TaskService } from '@theia/task/lib/browser/task-service';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable } from 'inversify';

import { ProjectService } from '../common/project-service';
import { HardwareType, ProjectTemplate } from '../common/project-types';
import * as ProjectUtils from './project-service/project-utils';

export namespace ProjectCommands {
    export const BUILD_PROJECT: Command = {
        id: 'cdtcloud.pico.project.build',
        label: 'Build Project'
    };
    export const CLEAR_PROJECT: Command = {
        id: 'cdtcloud.pico.project.clean',
        label: 'Clean Project'
    };
    export const CREATE_PROJECT: Command = {
        id: 'cdtcloud.pico.project.create',
        label: 'New CDT Cloud Project...'
    };
    export const DEBUG_PROJECT: Command = {
        id: 'cdtcloud.pico.project.debug',
        label: 'Debug Project'
    };
    export const DELETE_PROJECT: Command = {
        id: 'cdtcloud.pico.project.delete',
        label: 'Delete Project'
    };
}

@injectable()
export class ProjectContribution implements CommandContribution, MenuContribution {
    @inject(CommandService)
    protected readonly commandService: CommandService;
    @inject(MessageService)
    protected readonly messageService: MessageService;
    @inject(ProjectService)
    protected readonly projectService: ProjectService;
    @inject(QuickInputService)
    protected readonly quickInputService: QuickInputService;
    @inject(SelectionService)
    protected readonly selectionService: SelectionService;
    @inject(TaskService)
    protected readonly taskService: TaskService;
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(ProjectCommands.CREATE_PROJECT, {
            execute: () => this.createProject(),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => this.isProjectCreationAllowed()
        });
        registry.registerCommand(ProjectCommands.BUILD_PROJECT, {
            execute: projectPath => this.buildProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.CLEAR_PROJECT, {
            execute: projectPath => this.clearProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.DEBUG_PROJECT, {
            execute: projectPath => this.debugProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.DELETE_PROJECT, {
            execute: projectPath => this.deleteProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
    }

    registerMenus(registry: MenuModelRegistry): void {
        registry.registerMenuAction(CommonMenus.FILE_NEW, {
            commandId: ProjectCommands.CREATE_PROJECT.id,
            label: ProjectCommands.CREATE_PROJECT.label,
            icon: 'cdt-cloud-icon',
            order: '0'
        });
        registry.registerMenuAction(NavigatorContextMenu.NAVIGATION, {
            commandId: ProjectCommands.CREATE_PROJECT.id,
            label: ProjectCommands.CREATE_PROJECT.label,
            icon: 'cdt-cloud-icon'
        });
    }

    protected isProjectCreationAllowed(): boolean {
        return this.workspaceService.tryGetRoots().length > 0;
    }

    protected async createProject(): Promise<void> {
        // QuickInput project name (name of project directory)
        const inputProjectName = await this.quickInputService.input({
            prompt: 'Enter CDT Cloud Project Name',
            placeHolder: 'projectName',
            ignoreFocusLost: true,
            validateInput: async (input: string) => {
                // We only allow letters, numbers, dashes and underscores as project names, as it is used as directory name
                const regEx = /^[a-zA-Z0-9-_]+$/gm;
                if (!regEx.test(input)) {
                    return 'Please enter a valid project name (may only contain letters, numbers, dashes, underscores)!';
                }
                return undefined;
            }
        });
        if (!inputProjectName) {
            this.messageService.error('Cannot create CDT Cloud Project: projectName is missing!');
            throw Error('Cannot create CDT Cloud Project: projectName is missing!');
        }

        // QuickPick hardware type
        const hardwareTypes: Array<QuickPickValue<HardwareType>> = [
            ...(Object.values(HardwareType).map(value => this.toQuickPickValueHardwareType(`${value.toUpperCase()} project`, value)))
        ];
        const selectedHardwareType = await this.quickInputService?.showQuickPick(hardwareTypes,
            {
                placeholder: 'Select hardware type',
                activeItem: hardwareTypes[0] // preselect first available item
            });
        if (!selectedHardwareType) {
            this.messageService.error('Cannot create CDT Cloud Project: hardwareType is missing!');
            throw Error('Cannot create CDT Cloud Project: hardwareType is missing!');
        }

        // QuickPick project template
        const projectTemplates: Array<QuickPickValue<ProjectTemplate>> = [
            ...(Object.values(ProjectTemplate).map(value => this.toQuickPickValueProjectTemplate(`${value.toUpperCase()} project template`, value)))
        ];
        const selectedProjectTemplate = await this.quickInputService?.showQuickPick(projectTemplates,
            {
                placeholder: 'Select project template',
                activeItem: projectTemplates[0] // preselect first available item
            });
        if (!selectedProjectTemplate) {
            this.messageService.error('Cannot create CDT Cloud Project: projectTemplate is missing!');
            throw Error('Cannot create CDT Cloud Project: projectTemplate is missing!');
        }

        // Create CDT CLoud project via project service
        const workspacePath = (await this.getWorkspaceRoot()).path.toString();
        const projectPath = await this.projectService.createProject(workspacePath, inputProjectName, selectedHardwareType.value, selectedProjectTemplate.value);

        // Refresh navigator and reveal newly created project
        await this.commandService.executeCommand(FileNavigatorCommands.REFRESH_NAVIGATOR.id);
        await this.commandService.executeCommand(FileNavigatorCommands.REVEAL_IN_NAVIGATOR.id, new URI(projectPath));
    }

    protected async buildProject(projectPath: string): Promise<void> {
        const workspaceRoot = (await this.getWorkspaceRoot()).toString();
        const projectName = this.getProjectName(projectPath);
        this.taskService.runConfiguredTask(this.taskService.startUserAction(), workspaceRoot, ProjectUtils.getBuildTaskLabel(projectName));
    }

    protected async clearProject(projectPath: string): Promise<void> {
        const workspaceRoot = (await this.getWorkspaceRoot()).toString();
        const projectName = this.getProjectName(projectPath);
        this.taskService.runConfiguredTask(this.taskService.startUserAction(), workspaceRoot, ProjectUtils.getCleanTaskLabel(projectName));
    }

    protected async debugProject(projectPath: string): Promise<void> {
        // TODO: run launch config once its ready
    }

    protected async deleteProject(projectPath: string): Promise<void> {
        const projectName = this.getProjectName(projectPath);
        if (await this.confirmDelete(projectName)) {
            this.projectService.deleteProject(projectPath, projectName);
        }
    }

    protected getProjectName(projectPath: string): string {
        return new URI(projectPath).path.base;
    }

    protected toQuickPickValueHardwareType(label: string, value: HardwareType): QuickPickValue<HardwareType> {
        return { value, label };
    }

    protected toQuickPickValueProjectTemplate(label: string, value: ProjectTemplate): QuickPickValue<ProjectTemplate> {
        return { value, label };
    }

    protected async getWorkspaceRoot(): Promise<URI> {
        if (this.isProjectCreationAllowed()) {
            const workspaceRoot = (await this.workspaceService.roots)[0];
            return workspaceRoot.resource;
        }
        throw Error('Cannot create CDT Cloud Project: project creation is not allowed, no workspace opened!');
    }

    protected async confirmDelete(projectName: string): Promise<boolean> {
        const canDelete = await new ConfirmDialog({
            title: 'Delete project',
            msg: `Do you really want to delete project '${projectName}' and its task configurations?`
        }).open();
        return canDelete === true;
    }

}

