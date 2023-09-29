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
import { CdtCloudBlueprintExamples } from '@eclipse-cdt-cloud/blueprint-examples/lib/common/cdt-blueprint-examples';
import { ApplicationShell, codicon, open, OpenerService } from '@theia/core/lib/browser';
import { ReactWidget } from '@theia/core/lib/browser/widgets/react-widget';
import { CommandRegistry, MessageService } from '@theia/core/lib/common';
import { ApplicationInfo, ApplicationServer } from '@theia/core/lib/common/application-protocol';
import URI from '@theia/core/lib/common/uri';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { inject, injectable, postConstruct } from 'inversify';
import * as React from 'react';

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
                            'Prerequisites',
                            'codicon codicon-checklist',
                            <div>
                                <p>
                                    To quick-start your Raspberry Pi Pico SDK project, please expand the following section for
                                    pointers to setup resources for your hardware and system.<br />
                                </p>
                                <details>
                                    <summary>Setup resources</summary>
                                    <ul className='pico-gs-section-listing'>
                                        <li>
                                            <div className='pico-gs-section'>
                                                <b>Pico SDK:</b><br />
                                                Check the <a href='https://github.com/raspberrypi/pico-sdk#quick-start-your-own-project' target='_blank' rel='noreferrer'>
                                                    Raspberry Pi Pico SDK</a> repository for general
                                            </div>
                                        </li>
                                        <li>
                                            <div className='pico-gs-section'>
                                                <b>Getting Started with the Raspberry Pi Pico:</b><br />
                                                See <a href='https://rptl.io/pico-get-started' target='_blank' rel='noreferrer'>Getting Started with the Raspberry Pi Pico</a> for
                                                information on how to setup your hardware, IDE/environment and for how to build and debug software for the Raspberry Pi Pico
                                                and other RP2040-based devices.<br />
                                                Please especially pay attention to the following sections:
                                                <ul>
                                                    <li>1. Quick Pico Setup</li>
                                                    <li>2. The SDK</li>
                                                    <li>5.1. Installing OpenOCD</li>
                                                    <li>Appendix A: Using Picoprobe</li>
                                                    <li>Appendix B: Using Picotool</li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li>
                                            <div className='pico-gs-section'>
                                                <b>Minicom:</b><br />
                                                To allow minicom to run for the Pico Probe without sudo privileges, please check the&nbsp;
                                                <a href='https://wiki.emacinc.com/wiki/Getting_Started_With_Minicom#Getting_Started_With_Minicom' target='_blank' rel='noreferrer'>
                                                    Getting Started With Minicom Guide by emacinc.com</a>. Configure the minicom serial port setup for
                                                <code>/dev/ttyACM0</code> as described.
                                            </div>
                                        </li>
                                        <li>
                                            <div className='pico-gs-section'>
                                                <b>Double check Pico specific preferences:</b><br />
                                                <code>Preferences &gt; Extensions &gt; Pico &gt; Gdbmultiarch: Path / Openocd: Path</code>
                                            </div>
                                        </li>
                                    </ul>
                                </details>
                                <br />
                            </div>
                        )}
                    </div>
                </div>
                <hr className='pico-gs-hr' />
                <div className='pico-flex-grid'>
                    <div className='pico-col'>
                        {this.renderFeatureSection(
                            'Create Project',
                            'codicon codicon-file-directory-create',
                            <p>
                                To create a new project, click the toolbar icon{' '}
                                <i className={'codicon codicon-file-directory-create'} />. This will open
                                a quick input to select a Pico project template.
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
                                {this.renderActionItem('Edit Pico Blink C Code', this.editBlinkCFile)}
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
                            'Minicom',
                            'codicon codicon-output',
                            <p>
                                To start or stop Minicom, use commands from the command palette or click the action item below. <br />
                                <b><i>Remark:</i></b> Minicom usually requires root privileges to run. Please check the prerequisites section above for more details.<br />
                                {this.renderActionItem('Start Minicom', this.startMinicom, 'play-circle')}
                                {this.renderActionItem('Stop Minicom', this.stopMinicom, 'stop-circle')}
                                To exit <code>minicom</code> manually in the terminal, use <kbd>CTRL+A</kbd> followed by <kbd>X</kbd> and <kbd>Enter</kbd>.
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
                    The following feature sections describe the needed steps to create, build and debug the blink example on your Pico device.
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
        this.commandRegistry.executeCommand(ProjectCommands.CREATE_PROJECT.id, CdtCloudBlueprintExamples.PICO_BLINK);
    };

    protected editBlinkProject = (): void => {
        open(this.openerService, this.getBlinkFileUri('.pico-project'));
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

    protected toggleDeviceManagerView = (): void => {
        this.commandRegistry.executeCommand(TOGGLE__VIEW.id);
    };

    protected startMinicom = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.START_MINICOM.id);
    };

    protected stopMinicom = (): void => {
        this.commandRegistry.executeCommand(ProjectCommands.STOP_MINICOM.id);
    };
}

