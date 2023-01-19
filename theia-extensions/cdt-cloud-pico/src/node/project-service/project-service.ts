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
import { Path } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { DebugConfiguration } from '@theia/debug/lib/common/debug-configuration';
import { TaskConfiguration, TaskInfo, TaskServer } from '@theia/task/lib/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { copySync, mkdirSync, rmSync } from 'fs-extra';
import { ProjectClient, ProjectService } from '../../common/project-service';
import { HardwareType, ProjectTemplate } from '../../common/project-types';

const RESOURCE_DIRECTORY = '../../../../blueprint-example-generator/resources';
const RESOURCE_THEIA_DIRECTORY = `${RESOURCE_DIRECTORY}/.theia`;
const RESOURCE_THEIA_TASKS = `${RESOURCE_THEIA_DIRECTORY}/tasks.json`;
const RESOURCE_THEIA_LAUNCH_CONFIGS = `${RESOURCE_THEIA_DIRECTORY}/launch.json`;
const WORKSPACE_THEIA_DIRECTORY = '../.theia';
const WORKSPACE_THEIA_TASKS = `${WORKSPACE_THEIA_DIRECTORY}/tasks.json`;
const WORKSPACE_THEIA_LAUNCH_CONFIGS = `${WORKSPACE_THEIA_DIRECTORY}/launch.json`;

@injectable()
export class DefaultProjectService implements ProjectService {

    private client?: ProjectClient;

    @inject(TaskServer)
    private taskServer: TaskServer;

    async createProject(workspacePath: string, projectName: string, hardwareType: HardwareType, projectTemplate: ProjectTemplate): Promise<string> {
        this.logInfo(`Create CDTCloud project '${projectName}' from template '${projectTemplate}' in '${workspacePath}' for hardwareType '${hardwareType}'`);
        // If project already exists, remove for a clean start
        const projectPath = new Path(workspacePath).resolve(projectName)?.toString();
        if (!projectPath) {
            throw new Error(`Could not resolve project path '${workspacePath}'!`);
        }
        if (existsSync(workspacePath)) {
            rmSync(projectPath, { recursive: true, force: true });
        }
        // Create project directory
        mkdirSync(projectPath);
        // Copy template project
        this.copyTemplateProject(projectPath, hardwareType, projectTemplate);
        // Create .cdtcloud project file
        this.createCDTCloudProjectFile(projectPath, hardwareType);
        // Create project specific tasks in workspace
        const taskConfiguration = this.getProjectTaskConfiguration(projectName);
        // Add theia workspace tasks
        this.addTheiaWorkspaceTasks(taskConfiguration, projectPath);
        // Create project specific launch configs in workspace
        const launchConfig = this.getProjectDebugConfiguration(projectName, projectTemplate);
        // Add launch configuration
        this.addTheiaWorkspaceLaunchConfiguration(launchConfig, projectPath);
        // Return path to newly created project
        this.triggerCMakeBuild(taskConfiguration, projectPath, projectName);
        return projectPath;
    }

    async deleteProject(projectPath: string, projectName: string): Promise<void> {
        this.logInfo(`Delete CDTCloud project '${projectName}' from '${projectPath}'`);
        // Delete project directory
        rmSync(projectPath, { recursive: true, force: true });
        // Remove tasks configurations
        this.removeTheiaWorkspaceTasks(projectPath, projectName);
        // Remove launch configurations
        this.removeTheiaWorkspaceLaunchConfigs(projectPath, projectName);
    }

    protected triggerCMakeBuild(taskConfiguration: TaskConfiguration, projectPath: string, projectName: string): Promise<TaskInfo> {
        // retrieve Run Cmake task from the list of tasks in the task configuration
        const task: TaskConfiguration = taskConfiguration.tasks.filter(
            (taskObject: { label: string }) => taskObject.label === `Run CMake (${projectName})`)[0];
        // copy task to override the project path by the current one.
        const localTask = { ...task };
        localTask.options.cwd = projectPath;
        this.logInfo('Running '.concat(JSON.stringify(localTask)));
        return this.taskServer.run(localTask, projectPath);
    }

    protected copyTemplateProject(projectPath: string, hardwareType: HardwareType, projectTemplate: ProjectTemplate): void {
        // Locate template project
        const templateFolder = `${RESOURCE_DIRECTORY}/${hardwareType}-${projectTemplate}/${projectTemplate}`;
        const projectTemplatePath = new Path(module.path).resolve(templateFolder);
        if (!projectTemplatePath || !existsSync(projectTemplatePath.toString())) {
            throw new Error(`Could not find template path '${templateFolder}'!`);
        }
        // Copy template project files
        copySync(projectTemplatePath.toString(), projectPath, { recursive: true, overwrite: true });
    }

    protected writeJSONFile(jsonFilePath: string, jsonObject: object): void {
        const jsonObjectString = JSON.stringify(jsonObject, undefined, 4);
        writeFileSync(jsonFilePath, jsonObjectString, 'utf8');
    }

    protected createCDTCloudProjectFile(projectPath: string, hardwareType: HardwareType): void {
        // Create .cdtcloud project file (JSON)
        const projectJsonObject = { hardwareType: hardwareType };
        const projectFilePath = new Path(projectPath).resolve('.cdtcloud');
        if (!projectFilePath) {
            throw new Error('Could not resolve .cdtcloud path!');
        }
        this.writeJSONFile(projectFilePath.toString(), projectJsonObject);
    }

    protected getProjectTaskConfiguration(projectName: string): TaskConfiguration {
        // Uses the provided resource task configuration and updates them to match the project
        const resourceTasksPath = new Path(module.path).resolve(RESOURCE_THEIA_TASKS);
        if (!resourceTasksPath) {
            throw new Error('Could not resolve paths to resource tasks.json file!');
        }
        const projectTaskConfiguration: TaskConfiguration = JSON.parse(readFileSync(resourceTasksPath.toString(), { encoding: 'utf8' }));
        projectTaskConfiguration.tasks.forEach((taskObject: { label: string, options: { cwd: string } }) => {
            // Append project name to task label
            taskObject.label = `${taskObject.label} (${projectName})`;
            // Update cwd to newly created project directory
            taskObject.options.cwd = `${taskObject.options.cwd}/${projectName}`;
        });
        return projectTaskConfiguration;
    }

    protected addTheiaWorkspaceTasks(taskConfiguration: TaskConfiguration, projectPath: string): void {
        const resourceTasksPath = new Path(module.path).resolve(RESOURCE_THEIA_TASKS);
        const workspaceTheiaTasksPath = new Path(projectPath).resolve(WORKSPACE_THEIA_TASKS);
        if (!resourceTasksPath || !workspaceTheiaTasksPath) {
            throw new Error('Could not resolve paths to tasks.json files!');
        }

        // Init empty tasks.json file if workspace does not have tasks yet
        if (!existsSync(workspaceTheiaTasksPath.toString())) {
            this.writeJSONFile(workspaceTheiaTasksPath.toString(), { version: '2.0.0' });
        }

        // Create project specific tasks to existing workspace tasks.json
        let theiaWorkspaceTasks: TaskConfiguration = this.getTheiaWorkspaceTaskConfiguration(workspaceTheiaTasksPath.toString());
        if (!theiaWorkspaceTasks.tasks) {
            theiaWorkspaceTasks = { ...theiaWorkspaceTasks, 'tasks': taskConfiguration.tasks };
        } else {
            theiaWorkspaceTasks.tasks.push(...taskConfiguration.tasks);
        }
        this.writeJSONFile(workspaceTheiaTasksPath.toString(), theiaWorkspaceTasks);
    }

    protected removeTheiaWorkspaceTasks(projectPath: string, projectName: string): void {
        const workspaceTheiaTasksPath = new Path(projectPath).resolve(WORKSPACE_THEIA_TASKS);
        if (!workspaceTheiaTasksPath) {
            throw new Error('Could not resolve path to workspace tasks.json files!');
        }

        if (existsSync(workspaceTheiaTasksPath.toString())) {
            // Remove project specific tasks from existing workspace tasks.json
            const theiaWorkspaceTasks: TaskConfiguration = this.getTheiaWorkspaceTaskConfiguration(workspaceTheiaTasksPath.toString());
            if (theiaWorkspaceTasks.tasks) {
                theiaWorkspaceTasks.tasks = theiaWorkspaceTasks.tasks.filter((task: { label: string }) => !task.label.endsWith(` (${projectName})`));
            }
            this.writeJSONFile(workspaceTheiaTasksPath.toString(), theiaWorkspaceTasks);
        }
    }

    protected getProjectDebugConfiguration(projectName: string, templateProjectName: string): DebugConfiguration {
        // Uses the provided resource task configuration and updates them to match the project
        const resourceLaunchConfigsPath = new Path(module.path).resolve(RESOURCE_THEIA_LAUNCH_CONFIGS);
        if (!resourceLaunchConfigsPath) {
            throw new Error('Could not resolve paths to resource launch.json file!');
        }
        const projectLaunchConfiguration: DebugConfiguration = JSON.parse(readFileSync(resourceLaunchConfigsPath.toString(), { encoding: 'utf8' }));
        projectLaunchConfiguration.configurations.forEach((configObject: { name: string, program: string, preLaunchTask: string, initCommands: string[] }) => {
            // Append project name to config label
            configObject.name = `${configObject.name} (${projectName})`;
            // Update program path
            configObject.program = `\${workspaceFolder}/${projectName}/build/${templateProjectName}.elf`;
            // update preLaunchTask
            configObject.preLaunchTask = `Binary build debug (${projectName})`;
            // update init commands - add command to load executable on device
            configObject.initCommands.push(`load \${workspaceFolder}/${projectName}/build/${templateProjectName}.elf`);
        });
        return projectLaunchConfiguration;
    }

    protected getTheiaWorkspaceLaunchConfiguration(workspaceTheiaLaunchConfigsPath: string): DebugConfiguration {
        // If launch configs exist, the might have comments, as Theia creates a JSONc (JSON with comments) file by default
        // To be able to parse the JSON object, we need to skip the comments
        const matchJSONComments = new RegExp(/\/\/.*/, 'gi');
        const fileContent = readFileSync(workspaceTheiaLaunchConfigsPath, { encoding: 'utf8' });
        const filteredFileContent = fileContent.replace(matchJSONComments, '').trim();
        return JSON.parse(filteredFileContent) as DebugConfiguration;
    }

    protected addTheiaWorkspaceLaunchConfiguration(config: DebugConfiguration, projectPath: string): void {
        const resourceLaunchConfigsPath = new Path(module.path).resolve(RESOURCE_THEIA_LAUNCH_CONFIGS);
        const workspaceTheiaLaunchConfigsPath = new Path(projectPath).resolve(WORKSPACE_THEIA_LAUNCH_CONFIGS);
        if (!resourceLaunchConfigsPath || !workspaceTheiaLaunchConfigsPath) {
            throw new Error('Could not resolve paths to launch.json files!');
        }

        // Init empty launch.json file if workspace does not have tasks yet
        if (!existsSync(workspaceTheiaLaunchConfigsPath.toString())) {
            this.writeJSONFile(workspaceTheiaLaunchConfigsPath.toString(), { version: '2.0.0', configurations: [] });
        }

        // Create project specific launch configs to existing workspace launch.json
        let theiaWorkspaceLaunchConfigs: DebugConfiguration = this.getTheiaWorkspaceLaunchConfiguration(workspaceTheiaLaunchConfigsPath.toString());
        if (!theiaWorkspaceLaunchConfigs.configurations) {
            theiaWorkspaceLaunchConfigs = { ...theiaWorkspaceLaunchConfigs, 'configurations': config.configurations };
        } else {
            theiaWorkspaceLaunchConfigs.configurations.push(...config.configurations);
        }
        this.writeJSONFile(workspaceTheiaLaunchConfigsPath.toString(), theiaWorkspaceLaunchConfigs);
    }

    protected removeTheiaWorkspaceLaunchConfigs(projectPath: string, projectName: string): void {
        const workspaceTheiaLaunchConfigsPath = new Path(projectPath).resolve(WORKSPACE_THEIA_LAUNCH_CONFIGS);
        if (!workspaceTheiaLaunchConfigsPath) {
            throw new Error('Could not resolve path to workspace launch.json files!');
        }

        if (existsSync(workspaceTheiaLaunchConfigsPath.toString())) {
            // Remove project specific launch configs from existing workspace launch.json
            const theiaWorkspaceLaunchConfigs: DebugConfiguration = this.getTheiaWorkspaceLaunchConfiguration(workspaceTheiaLaunchConfigsPath.toString());
            if (theiaWorkspaceLaunchConfigs.configurations) {
                theiaWorkspaceLaunchConfigs.configurations =
                    theiaWorkspaceLaunchConfigs.configurations.filter((config: { name: string }) => !config.name.endsWith(` (${projectName})`));
            }
            this.writeJSONFile(workspaceTheiaLaunchConfigsPath.toString(), theiaWorkspaceLaunchConfigs);
        }
    }

    protected getTheiaWorkspaceTaskConfiguration(workspaceTheiaTasksPath: string): TaskConfiguration {
        // If tasks exist, the might have comments, as Theia creates a JSONc (JSON with comments) file by default
        // To be able to parse the JSON object, we need to skip the comments
        const matchJSONComments = new RegExp(/\/\/.*/, 'gi');
        const fileContent = readFileSync(workspaceTheiaTasksPath, { encoding: 'utf8' });
        const filteredFileContent = fileContent.replace(matchJSONComments, '').trim();
        return JSON.parse(filteredFileContent) as TaskConfiguration;
    }

    protected logError(data: string | Buffer): void {
        if (data) {
            console.error(`DefaultProjectService: ${data.toString()}`);
        }
    }

    protected logInfo(data: string | Buffer): void {
        if (data) {
            console.info(`DefaultProjectService: ${data.toString()}`);
        }
    }

    dispose(): void {
        // Nothing to dispose
    }

    setClient(client: ProjectClient | undefined): void {
        this.client = client;
    }

    getClient?(): ProjectClient | undefined {
        return this.client;
    }

}
