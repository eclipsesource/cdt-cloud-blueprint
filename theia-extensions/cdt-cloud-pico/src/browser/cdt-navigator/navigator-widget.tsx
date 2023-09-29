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
import { CommandService } from '@theia/core';
import { NodeProps, TREE_NODE_CONTENT_CLASS, TreeNode } from '@theia/core/lib/browser';
import { inject, injectable } from '@theia/core/shared/inversify';
import * as React from '@theia/core/shared/react';
import { DirNode } from '@theia/filesystem/lib/browser';
import { FileNavigatorWidget } from '@theia/navigator/lib/browser';

import { ProjectCommands } from '../project-command-contribution';
import * as ProjectUtils from '../project-service/project-utils';

@injectable()
export class PicoFileNavigatorWidget extends FileNavigatorWidget {

    @inject(CommandService)
    protected readonly commandService: CommandService;

    /**
     * Render the node given the tree node and node properties.
     * @param node the tree node.
     * @param props the node properties.
     */
    protected renderNode(node: TreeNode, props: NodeProps): React.ReactNode {
        if (!TreeNode.isVisible(node)) {
            return undefined;
        }
        const attributes = this.createNodeAttributes(node, props);
        const content = <div className={TREE_NODE_CONTENT_CLASS}>
            {this.renderExpansionToggle(node, props)}
            {this.decorateIcon(node, this.renderIcon(node, props))}
            {this.renderCaptionAffixes(node, props, 'captionPrefixes')}
            {this.renderCaption(node, props)}
            {this.renderCaptionAffixes(node, props, 'captionSuffixes')}
            {this.renderTailDecorations(node, props)}
            {(DirNode.is(node) && ProjectUtils.isProjectNode(node)) && this.renderInteractables(node, props)}
        </div>;
        return React.createElement('div', attributes, content);
    }

    protected renderInteractables(node: DirNode, _props: NodeProps): React.ReactNode {
        const projectPath = node.fileStat.resource.path.toString();
        return (
            // tools are ordered as flex: row (left to right in this order)
            <div className='cdt-cloud-project-tool-container'>
                {/* TODO: enable tool to run launch config once it is ready */}
                <div className='tool-item enabled'>
                    <div className='codicon codicon-debug-alt action-label'
                        title={ProjectCommands.DEBUG_PROJECT.label}
                        onClick={e => this.handleDebugIconClicked(e, projectPath)}
                        data-id={node.id}
                        id={ProjectCommands.DEBUG_PROJECT.id}
                    />
                </div>
                <div className='tool-item enabled'>
                    <div className='codicon codicon-symbol-property action-label'
                        title={ProjectCommands.BUILD_PROJECT.label}
                        onClick={e => this.handleBuildIconClicked(e, projectPath)}
                        data-id={node.id}
                        id={ProjectCommands.BUILD_PROJECT.id}
                    />
                </div>
                <div className='tool-item enabled'>
                    <div className='codicon codicon-settings-gear action-label'
                        title={ProjectCommands.EDIT_PROJECT.label}
                        onClick={e => this.handleEditIconClicked(e, projectPath)}
                        data-id={node.id}
                        id={ProjectCommands.EDIT_PROJECT.id}
                    />
                </div>
            </div>
        );
    }

    protected async handleBuildIconClicked(e: React.MouseEvent<HTMLDivElement>, projectPath: string): Promise<void> {
        e.stopPropagation();
        this.commandService.executeCommand(ProjectCommands.BUILD_PROJECT.id, projectPath);
    }

    protected async handleDebugIconClicked(e: React.MouseEvent<HTMLDivElement>, projectPath: string): Promise<void> {
        e.stopPropagation();
        this.commandService.executeCommand(ProjectCommands.DEBUG_PROJECT.id, projectPath);
    }

    protected async handleEditIconClicked(e: React.MouseEvent<HTMLDivElement>, projectPath: string): Promise<void> {
        e.stopPropagation();
        this.commandService.executeCommand(ProjectCommands.EDIT_PROJECT.id, projectPath);
    }

}
