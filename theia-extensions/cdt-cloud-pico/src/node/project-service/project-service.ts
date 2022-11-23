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
import { Path } from '@theia/core';
import { inject, injectable } from '@theia/core/shared/inversify';
import { TaskConfiguration, TaskInfo, TaskServer } from '@theia/task/lib/common';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { copySync, mkdirSync, rmSync } from 'fs-extra';
import { ProjectClient, ProjectService } from '../../common/project-service';
import { HardwareType, ProjectTemplate } from '../../common/project-types';

const RESOURCE_DIRECTORY = '../../../../blueprint-example-generator/resources';
const RESOURCE_THEIA_DIRECTORY = `${RESOURCE_DIRECTORY}/.theia`;
const RESOURCE_THEIA_SETTINGS = `${RESOURCE_THEIA_DIRECTORY}/settings.json`;
const RESOURCE_THEIA_TASKS = `${RESOURCE_THEIA_DIRECTORY}/tasks.json`;
const WORKSPACE_THEIA_DIRECTORY = '../.theia';
const WORKSPACE_THEIA_SETTINGS = `${WORKSPACE_THEIA_DIRECTORY}/settings.json`;
const WORKSPACE_THEIA_TASKS = `${WORKSPACE_THEIA_DIRECTORY}/tasks.json`;

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
        // Add theia workspace settings
        this.addTheiaWorkspaceSettings(projectPath);
        // Create project specific tasks in workspace
        const taskConfiguration = this.getProjectTaskConfiguration(projectName);
        // Add theia workspace tasks
        this.addTheiaWorkspaceTasks(taskConfiguration, projectPath);
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

    protected addTheiaWorkspaceSettings(projectPath: string): void {
        // Add workspace settings
        const resourceSettingsPath = new Path(module.path).resolve(RESOURCE_THEIA_SETTINGS);
        const theiaWorkspaceSettingsPath = new Path(projectPath).resolve(WORKSPACE_THEIA_SETTINGS);
        if (!resourceSettingsPath || !theiaWorkspaceSettingsPath) {
            throw new Error('Could not resolve paths to settings.json files!');
        }

        if (!existsSync(theiaWorkspaceSettingsPath.toString())) {
            // Copy settings.json if workspace does not have settings yet
            copySync(resourceSettingsPath.toString(), theiaWorkspaceSettingsPath.toString());
        } else {
            let theiaWorkspaceSettings = JSON.parse(readFileSync(theiaWorkspaceSettingsPath.toString(), { encoding: 'utf8' }));
            if (!('files.associations' in theiaWorkspaceSettings)) {
                // Add JSON file association setting for .cdtcloud files
                theiaWorkspaceSettings = { ...theiaWorkspaceSettings, 'files.associations': { '*.cdtcloud': 'json' } };
                this.writeJSONFile(theiaWorkspaceSettingsPath.toString(), theiaWorkspaceSettings);
            };
            if (!('cmake.configureOnOpen' in theiaWorkspaceSettings)) {
                // Add automatic cmake project configuration on open
                theiaWorkspaceSettings = { ...theiaWorkspaceSettings, 'cmake.configureOnOpen': true };
                this.writeJSONFile(theiaWorkspaceSettingsPath.toString(), theiaWorkspaceSettings);
            };
        }
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
