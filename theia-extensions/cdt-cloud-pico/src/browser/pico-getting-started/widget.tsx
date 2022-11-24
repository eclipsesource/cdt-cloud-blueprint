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
import { ApplicationShell, codicon, open, OpenerService } from '@theia/core/lib/browser';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandRegistry, MessageService } from '@theia/core/lib/common';
import { ApplicationInfo, ApplicationServer } from '@theia/core/lib/common/application-protocol';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable, postConstruct } from 'inversify';
import * as React from 'react';

import { HardwareType, ProjectTemplate } from '../../common/project-types';
import { TOGGLE__VIEW } from '../device-manager/device-manager-commands';
import { ProjectCommands } from '../project-command-contribution';

@injectable()
export class PicoWelcomeWidget extends ReactWidget {
    static readonly ID = 'pico.welcome.widget';
    static readonly LABEL = 'Pico Getting Started';

    @inject(ApplicationServer)
    protected readonly applicationServer: ApplicationServer;
    @inject(ApplicationShell)
    protected readonly applicationShell: ApplicationShell;
    @inject(CommandRegistry)
    protected readonly commandRegistry: CommandRegistry;
    @inject(MessageService)
    protected readonly messageService: MessageService;
    @inject(OpenerService)
    protected readonly openerService: OpenerService;
    @inject(WorkspaceService)
    protected readonly workspaceService: WorkspaceService;

    protected applicationInfo: ApplicationInfo | undefined;

    @postConstruct()
    protected async init(): Promise<void> {
        this.id = PicoWelcomeWidget.ID;
        this.title.label = PicoWelcomeWidget.LABEL;
        this.title.caption = PicoWelcomeWidget.LABEL;
        this.title.closable = true;
        this.title.iconClass = codicon('info');

        this.applicationInfo = await this.applicationServer.getApplicationInfo();
        this.update();
    }

    protected render(): React.ReactNode {
        return (
            <div className='pico-gs-container'>
                {this.renderHeader()}
                <hr className='pico-gs-hr' />
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Create Project',
                            'codicon codicon-file-directory-create',
                            <p>
                                To create a new project, click the toolbar icon{' '}
                                <i className={'codicon codicon-file-directory-create'} />. This will open
                                quick inputs to define the project name, hardware type and project template.
                                The project will be created as a separate project directory in the currently opened workspace and adds project-specific tasks
                                to the workspace.<br />
                                The action item below creates a Pico Blink template project.
                                {this.renderActionItem('Create Pico Blink Project', this.createBlinkProject)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Edit Project',
                            'codicon codicon-settings-gear',
                            <p>
                                To edit the project's settings, click the toolbar icon{' '}
                                <i className={'codicon codicon-settings-gear'} /> or use the action item below.
                                {this.renderActionItem('Edit Pico Blink Project', this.editBlinkProject)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Edit Project C Code',
                            'codicon codicon-file-code',
                            <p>
                                To edit the project's C file, open the <code>src/blink.c</code> file in the file explorer
                                or use the action item below.
                                {this.renderActionItem('Edit Pico Blink Project', this.editBlinkCFile)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Build Blink Project',
                            'codicon codicon-symbol-property',
                            <p>
                                To build the Blink project, click the project's tool{' '}
                                <i className={'codicon codicon-symbol-property'} /> or use the action item below.
                                {this.renderActionItem('Build Pico Blink Project', this.buildBlinkProject)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Flash the Blink Project to your device',
                            'codicon codicon-repo-push',
                            <p>
                                To flash the built Blink project to your device, click the project's tool{' '}
                                <i className={'codicon codicon-repo-push'} /> or use the action item below.
                                {this.renderActionItem('Flash the Blink Project to your device', this.flashBlinkProject)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Debug Blink Project',
                            'codicon codicon-debug-alt',
                            <p>
                                To debug the Blink project, click the project's tool{' '}
                                <i className={'codicon codicon-debug-alt'} /> or use the action item below.
                                This will open the <code>src/blink.c</code> file, build the project in Debug mode and then start the project's launch configuration.
                                {this.renderActionItem('Debug Pico Blink Project', this.debugBlinkProject)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Device Manager',
                            'codicon codicon-circuit-board',
                            <p>
                                The Pico Device Manager lists the currently connected Pico devices and shows additional information such as connection status or the flashed image.
                                <br />
                                {this.renderActionItem('Toggle the Pico Device Manager', this.toggleDeviceManagerView)}
                            </p>
                        )}
                    </div>
                </div>
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'OpenOCD',
                            'codicon codicon-arrow-swap',
                            <p>
                                To start or stop OpenOCD, use commands from the command palette or click the action item below. <br />
                                {this.renderActionItem('Start OpenOCD', this.startOpenOCD, 'play-circle')}
                                {this.renderActionItem('Stop OpenOCD', this.stopOpenOCD, 'stop-circle')}
                            </p>
                        )}
                    </div>
                </div>
                {this.applicationInfo &&
                    <div className='pico-flex-grid'>
                        <div className='pico-col'>{this.renderVersion()}</div>
                    </div>
                }
            </div >
        );
    }

    protected renderHeader(): React.ReactNode {
        return (
            <div className='pico-gs-header'>
                <h1>
                    cdt-cloud-pico <span className='pico-gs-sub-header'>Getting Started</span>
                </h1>
                <p>
                    Please see the sections below to get an overview of the available features and use the links to directly see them in
                    action.
                    <br />
                    Alternatively, use the toolbar on top, right below the main menu bar.
                    <br />
                    The following feature sections describe the needed steps to create, build and debug the dooropener example on your Pico device.
                    They also offer an action to execute those steps automatically, they are indicated by this icon: <i className={'codicon codicon-arrow-circle-right'} />.
                </p>
            </div>
        );
    }

    protected renderFeatureSection(title: string, icon: string, description: React.ReactNode): React.ReactNode {
        return (
            <div className='pico-gs-section' title={title}>
                <h3 className='pico-gs-section-header'>
                    <i className={'pico-gs-section-header-icon ' + icon}></i>
                    {title}
                </h3>
                {description}
            </div>
        );
    }

    protected renderActionItem(title: string, action: () => void, codiconIcon?: string): React.ReactNode {
        return (
            <div title={title}>
                <a className='pico-gs-action-container' onClick={action}>
                    <i className={`pico-gs-section-header-icon codicon codicon-${codiconIcon || 'arrow-circle-right'}`} />
                    {title}
                </a>
            </div>
        );
    }

    protected renderVersion(): React.ReactNode {
        return (
            <div className='pico-gs-section'>
                <div className='pico-gs-action-container'>
                    <p className='pico-gs-sub-header pico-gs-version'>
                        {this.applicationInfo && `${this.applicationInfo.name} - Version: ${this.applicationInfo.version}`}
                    </p>
                </div>
            </div>
        );
    }

    protected renderDetailSummary(title: string, icon: string): React.ReactNode {
        return (
            <div className='pico-gs-section gs-detail-summary'>
                {' '}
                <h3 className='pico-gs-section-header'>
                    <i className={'pico-gs-section-header-icon ' + icon}></i>
                    {title}
                </h3>
            </div>
        );
    }

    protected getBlinkProjectUri(): URI {
        return new URI(`${this.workspaceService.workspace?.resource}/blink`);
    }

    protected getBlinkFileUri(filePath: string): URI {
        return this.getBlinkProjectUri().resolve(`/${filePath}`);
    }

    protected createBlinkProject = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.CREATE_PROJECT.id, ['blink', HardwareType.PICO, ProjectTemplate.BLINK]);
    };

    protected editBlinkProject = (): void => {
        open(this.openerService, this.getBlinkFileUri('.cdtcloud'));
    };

    protected editBlinkCFile = (): void => {
        open(this.openerService, this.getBlinkFileUri('src/blink.c'));
    };

    protected buildBlinkProject = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.BUILD_PROJECT.id, this.getBlinkProjectUri());
    };

    protected debugBlinkProject = (): void => {
        open(this.openerService, this.getBlinkFileUri('src/blink.c')).then(() => {
            this.commandRegistry.executeCommand(ProjectCommands.DEBUG_PROJECT.id, this.getBlinkProjectUri());
        });
    };

    protected flashBlinkProject = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.FLASH_PROJECT.id, this.getBlinkProjectUri());
    };

    protected toggleDeviceManagerView = (): void => {
        this.commandRegistry.executeCommand(TOGGLE__VIEW.id);
    };

    protected startOpenOCD = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.START_OPENOCD.id);
    };

    protected stopOpenOCD = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.STOP_OPENOCD.id);
    };
}

