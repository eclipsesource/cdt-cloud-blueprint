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
import { CommandService, nls } from '@theia/core';
import { codicon, LabelProvider, NavigatableWidget, NavigatableWidgetOptions, ReactWidget } from '@theia/core/lib/browser';
import { BinaryBuffer } from '@theia/core/lib/common/buffer';
import URI from '@theia/core/lib/common/uri';
import {
    inject,
    injectable,
    postConstruct
} from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { FileService } from '@theia/filesystem/lib/browser/file-service';
import { ProjectCommands } from '../project-command-contribution';

export interface ProjectEditorWidgetOptions extends NavigatableWidgetOptions {
    id: string;
}
export const ProjectEditorWidgetOptions = Symbol('ProjectEditorWidgetOptions');

export interface ProjectSettings {
    hardware: string;
    serialPrinting: string,
    name?: string,
    url?: string
}

const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
    hardware: 'pico',
    serialPrinting: 'USB',
};

@injectable()
export class ProjectEditorWidget extends ReactWidget implements NavigatableWidget {

    @inject(ProjectEditorWidgetOptions) protected options: ProjectEditorWidgetOptions;
    @inject(LabelProvider) protected labelProvider: LabelProvider;
    @inject(FileService) protected fileService: FileService;
    @inject(CommandService) protected commandService: CommandService;

    protected projectSettingsUri: URI;
    protected projectSettings?: ProjectSettings;

    getResourceUri(): URI | undefined {
        return new URI(this.options.uri);
    }

    createMoveToUri(resourceUri: URI): URI | undefined {
        return undefined;
    }

    @postConstruct()
    init(): void {
        this.id = this.options.id;
        this.title.label = this.getProjectName();
        this.title.iconClass = this.getProjectIconClass();
        this.title.closable = true;
        this.projectSettingsUri = new URI(this.options.uri);
        this.readProjectSettings().then(projectSettings => {
            this.projectSettings = projectSettings;
            this.update();
        });
    }

    protected getProjectName(): string {
        const uri = this.getResourceUri();
        const parent = uri?.parent;
        if (!parent) {
            return nls.localize('cdt-cloud-pico/project-editor/unknown', 'Unknown');
        }
        return this.labelProvider.getName(parent);
    }

    protected getProjectIconClass(): string {
        const uri = this.getResourceUri();
        const parent = uri?.parent;
        if (!parent) {
            return codicon('settings');
        }
        return this.labelProvider.getIcon(parent);
    }

    protected async readProjectSettings(): Promise<ProjectSettings> {
        try {
            const contents = await this.fileService.read(this.projectSettingsUri);
            return JSON.parse(contents.value) as ProjectSettings;
        } catch (error) {
            return DEFAULT_PROJECT_SETTINGS;
        }
    }

    render(): React.ReactNode {
        if (!this.projectSettings) {
            return <div className='project-settings'></div>;
        }
        return <div className='cdt-cloud-project-settings'>
            <div className='header'>
                <h1><span className='label'>Project</span><span className='value'>{this.getProjectName()}</span></h1>
                <div className='buttonsContainer'>
                    <button title='Debug Project' className='theia-button' onClick={e => this.runDebug(e)}>
                        <i className='codicon codicon-debug-alt' />
                    </button>
                    <button title='Flash Project to device' className='theia-button' onClick={e => this.runFlash(e)}>
                        <i className='codicon codicon-repo-push' />
                    </button>
                    <button title='Build Project' className='theia-button' onClick={e => this.runBuild(e)}>
                        <i className='codicon codicon-wrench' />
                    </button>
                </div>
            </div>
            <div className='pico-logo'></div>
            <div className='settings-container'>
                <div className="setting-item-contents settings-row-inner-container">
                    <div className="setting-item-header">
                        <h3>
                            Binary name
                        </h3>
                    </div>
                    <div className="setting-item-description">
                        <p>Controls the <i>project name</i> written into the binary.</p>
                    </div>
                    <div>
                        <div className='theia-select-component'>
                            <input
                                className='theia-input'
                                type='text'
                                value={this.projectSettings.name ?? this.getProjectName()}
                                onChange={e => this.setProjectSettingsName(e)} />
                        </div>
                    </div>
                </div>
                <div className="setting-item-contents settings-row-inner-container">
                    <div className="setting-item-header">
                        <h3>
                            Binary URL
                        </h3>
                    </div>
                    <div className="setting-item-description">
                        <p>Controls the <i>project URL</i> written into the binary.</p>
                    </div>
                    <div>
                        <div className='theia-select-component'>
                            <input
                                className='theia-input'
                                type='text'
                                value={this.projectSettings.url ?? ''}
                                onChange={e => this.setProjectSettingsUrl(e)} />
                        </div>
                    </div>
                </div>
                <div className="setting-item-contents settings-row-inner-container">
                    <div className="setting-item-header">
                        <h3>
                            Serial Printing
                        </h3>
                    </div>
                    <div className="setting-item-description">
                        <p>Controls the output channel of the serial printing.</p>
                    </div>
                    <div>
                        <div className='theia-select-component'>
                            <select onChange={e => this.setProjectSettingsSerialPrinting(e)}>
                                <option value='USB' selected={this.projectSettings.serialPrinting === 'USB'}>USB</option>
                                <option value='UART' selected={this.projectSettings.serialPrinting === 'UART'}>UART</option>
                                <option value='Both' selected={this.projectSettings.serialPrinting === 'Both'}>Both</option>
                                <option value='None' selected={this.projectSettings.serialPrinting === 'None'}>None</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>;
    }

    protected setProjectSettingsName(e: React.ChangeEvent<HTMLInputElement>): void {
        this.projectSettings!.name = e.target.value;
        this.saveProjectSettings();
    }

    protected setProjectSettingsUrl(e: React.ChangeEvent<HTMLInputElement>): void {
        this.projectSettings!.url = e.target.value;
        this.saveProjectSettings();
    }

    protected setProjectSettingsSerialPrinting(e: React.ChangeEvent<HTMLSelectElement>): void {
        this.projectSettings!.serialPrinting = e.target.value;
        this.saveProjectSettings();
    }

    protected async saveProjectSettings(): Promise<void> {
        this.fileService.writeFile(
            this.projectSettingsUri,
            BinaryBuffer.fromString(JSON.stringify(this.projectSettings))
        );
        this.update();
    }

    protected runDebug(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.commandService.executeCommand(ProjectCommands.DEBUG_PROJECT.id, this.getProjectPath());
    }

    protected runFlash(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.commandService.executeCommand(ProjectCommands.FLASH_PROJECT.id, this.getProjectPath());
    }

    protected runBuild(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        this.commandService.executeCommand(ProjectCommands.BUILD_PROJECT.id, this.getProjectPath());
    }

    protected getProjectPath(): string {
        return this.projectSettingsUri.parent.path.toString();
    }
}
