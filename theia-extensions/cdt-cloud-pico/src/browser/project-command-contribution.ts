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
import { CommonMenus, OpenerService, PreferenceService } from '@theia/core/lib/browser';
import URI from '@theia/core/lib/common/uri';
import { DebugConfigurationManager } from '@theia/debug/lib/browser/debug-configuration-manager';
import { DebugCommands } from '@theia/debug/lib/browser/debug-frontend-application-contribution';
import { DebugService } from '@theia/debug/lib/common/debug-service';
import { FileNavigatorCommands, NavigatorContextMenu } from '@theia/navigator/lib/browser/navigator-contribution';
import { TaskService } from '@theia/task/lib/browser/task-service';
import { PanelKind, RevealKind, TaskConfiguration, TaskInfo, TaskScope } from '@theia/task/lib/common';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable } from 'inversify';

import { ProjectService } from '../common/project-service';
import { HardwareType, ProjectTemplate } from '../common/project-types';
import { PICO_WELCOME_COMMAND } from './pico-getting-started/frontend-contribution';
import { OPEN_OCD_PATH_SETTING_ID } from './preferences';
import * as ProjectUtils from './project-service/project-utils';

export namespace ProjectCommands {
    export const BUILD_PROJECT: Command = {
        id: 'cdtcloud.pico.project.build',
        label: 'Build Project'
    };
    export const CREATE_PROJECT: Command = {
        id: 'cdtcloud.pico.project.create',
        label: 'New CDT Cloud Project...'
    };
    export const DEBUG_PROJECT: Command = {
        id: 'cdtcloud.pico.project.debug',
        label: 'Debug Project'
    };
    export const EDIT_PROJECT: Command = {
        id: 'cdtcloud.pico.project.edit',
        label: 'Edit Project File'
    };
    export const FLASH_PROJECT: Command = {
        id: 'cdtcloud.pico.project.flash',
        label: 'Flash Project to device'
    };
    export const START_OPENOCD: Command = {
        id: 'cdtcloud.pico.openocd.start',
        label: 'Start OpenOCD'
    };
    export const STOP_OPENOCD: Command = {
        id: 'cdtcloud.pico.openocd.stop',
        label: 'Stop OpenOCD'
    };
}

@injectable()
export class ProjectContribution implements CommandContribution, MenuContribution {
    @inject(CommandService)
    protected readonly commandService: CommandService;
    @inject(MessageService)
    protected readonly messageService: MessageService;
    @inject(OpenerService)
    protected readonly openerService: OpenerService;
    @inject(PreferenceService)
    protected readonly preferenceService: PreferenceService;
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
    @inject(DebugService)
    protected readonly debugService: DebugService;
    @inject(DebugConfigurationManager)
    protected readonly debugManager: DebugConfigurationManager;
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;

    protected currentOpenOCDTask: TaskInfo | undefined;

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(ProjectCommands.CREATE_PROJECT, {
            execute: args => {
                if (Array.isArray(args) && args.length > 2) {
                    const projectName = args[0];
                    const hardwareType = args[1] as HardwareType;
                    const projectTemplate = args[2] as ProjectTemplate;
                    this.doCreateProject(projectName, hardwareType, projectTemplate);
                } else {
                    this.createProjectViaQuickInput();
                }
            },
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => this.isProjectCreationAllowed()
        });
        registry.registerCommand(ProjectCommands.BUILD_PROJECT, {
            execute: projectPath => this.buildProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.DEBUG_PROJECT, {
            execute: projectPath => this.debugProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.EDIT_PROJECT, {
            execute: projectPath => this.editProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.FLASH_PROJECT, {
            execute: projectPath => this.flashProject(projectPath),
            isEnabled: () => this.isProjectCreationAllowed(),
            isVisible: () => false // do not show in command palette
        });
        registry.registerCommand(ProjectCommands.START_OPENOCD, {
            execute: () => this.startOpenOCD(),
            isEnabled: () => true,
            isVisible: () => true
        });
        registry.registerCommand(ProjectCommands.STOP_OPENOCD, {
            execute: () => this.stopOpenOCD(),
            isEnabled: () => true,
            isVisible: () => true
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

    protected async createProjectViaQuickInput(): Promise<void> {
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

        this.doCreateProject(inputProjectName, selectedHardwareType.value, selectedProjectTemplate.value);

        if (selectedHardwareType.value === HardwareType.PICO) {
            // Open Pico Getting Started Widget
            await this.commandService.executeCommand(PICO_WELCOME_COMMAND.id);
        }
    }

    protected async doCreateProject(projectName: string, hardwareType: HardwareType, projectTemplate: ProjectTemplate): Promise<void> {
        // Create CDT CLoud project via project service
        const workspacePath = (await this.getWorkspaceRoot()).path.toString();
        const projectPath = await this.projectService.createProject(workspacePath, projectName, hardwareType, projectTemplate);

        // Refresh navigator and reveal newly created project
        await this.commandService.executeCommand(FileNavigatorCommands.REFRESH_NAVIGATOR.id);
        await this.commandService.executeCommand(FileNavigatorCommands.REVEAL_IN_NAVIGATOR.id, new URI(projectPath));
    }

    protected async buildProject(projectPath: string): Promise<void> {
        const workspaceRoot = (await this.getWorkspaceRoot()).toString();
        const projectName = this.getProjectName(projectPath);
        this.taskService.runConfiguredTask(this.taskService.startUserAction(), workspaceRoot, ProjectUtils.getBuildTaskLabel(projectName));
    }

    protected async debugProject(projectPath: string): Promise<void> {
        const workspaceRoot = (await this.getWorkspaceRoot()).toString();
        const projectName = this.getProjectName(projectPath);
        const configurationName = ProjectUtils.getLaunchConfigLabel(projectName);
        const configuration = this.debugManager.findConfiguration(configurationName, workspaceRoot);
        if (configuration) {
            await this.commandRegistry.executeCommand(ProjectCommands.START_OPENOCD.id);
            await this.debugService.createDebugSession(configuration, workspaceRoot);
            await this.commandRegistry.executeCommand(DebugCommands.START.id, this.debugManager.current);
        } else {
            this.messageService.warn('Could not find configuration to launch.');
        }
    }

    protected async editProject(projectPath: string): Promise<void> {
        const uri = new URI(projectPath).resolve('.cdtcloud');
        const opener = await this.openerService.getOpener(uri);
        opener.open(uri);
    }

    protected async flashProject(projectPath: string): Promise<void> {
        // TODO: flash project to device
        this.messageService.warn('TODO: Will flash project to device');
    }

    protected async startOpenOCD(): Promise<void> {
        if (!this.currentOpenOCDTask) {
            const openOCDPath = this.preferenceService.get<string>(OPEN_OCD_PATH_SETTING_ID);
            const openOCDCommand = `${openOCDPath}/src/openocd -s ${openOCDPath}/tcl -f interface/picoprobe.cfg -f target/rp2040.cfg`;
            this.currentOpenOCDTask = await this.taskService.runTask(
                this.createTaskConfiguration('Start OpenOCD', openOCDCommand));
        }
    }

    protected async stopOpenOCD(): Promise<void> {
        if (this.currentOpenOCDTask) {
            await this.taskService.terminateTask(this.currentOpenOCDTask);
            this.currentOpenOCDTask = undefined;
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

    protected findProgramExecutablePath(projectPath: string, projectName: string): string {
        return `${projectPath}/build/${projectName}.elf`;
    }

    protected createTaskConfiguration(label: string, command: string): TaskConfiguration {
        return {
            label: label,
            type: 'shell',
            group: 'none',
            command: command,
            presentation: {
                reveal: RevealKind.Always,
                panel: PanelKind.Dedicated
            },
            problemMatcher: [],
            _scope: TaskScope.Workspace
        };
    }

}

