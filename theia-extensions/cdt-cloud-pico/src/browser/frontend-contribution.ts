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
import { FrontendApplication, FrontendApplicationContribution } from '@theia/core/lib/browser';
import { TaskService } from '@theia/task/lib/browser/task-service';
import { inject, injectable } from 'inversify';

@injectable()
export class ProjectFrontendContribution implements FrontendApplicationContribution {

    @inject(TaskService) protected readonly taskService: TaskService;

    async onStart(_app: FrontendApplication): Promise<void> {
        // Ensure running OpenOCD tasks are terminated
        const runningTasks = await this.taskService.getRunningTasks();
        if (runningTasks.length > 0) {
            runningTasks.forEach(runningTask => {
                if (runningTask.config.label === 'Start OpenOCD') {
                    this.taskService.terminateTask(runningTask);
                }
            });
        }
    }

}
