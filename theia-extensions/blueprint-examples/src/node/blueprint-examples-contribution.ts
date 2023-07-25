/********************************************************************************
 * Copyright (C) 2023 STMicroelectronics and others.
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

import { Example, ExampleOptions, ExamplesContribution } from '@eclipse-cdt-cloud/blueprint-example-generator/lib/node';
import { URI } from '@theia/core';
import { injectable } from '@theia/core/shared/inversify';
import { DebugConfiguration } from '@theia/debug/lib/common/debug-configuration';
import { TaskCustomization } from '@theia/task/lib/common';
import { CdtCloudBlueprintExamples } from '../common/cdt-blueprint-examples';

@injectable()
export class CdtCloudBlueprintExamplesContribution implements ExamplesContribution {
    get examples(): Example[] {
        return [
            {
                id: CdtCloudBlueprintExamples.PICO_EMPTY,
                label: 'PICO empty project template',
                welcomeFile: 'README.md',
                resourcesPath: new URI(module.path).resolve('../../resources/empty').normalizePath().toString(),
                launches: (options: ExampleOptions) => this.getPicoLaunchConfigs(options),
                tasks: (options: ExampleOptions) => this.getPicoTasks(options)
            },
            {
                id: CdtCloudBlueprintExamples.PICO_BLINK,
                label: 'PICO blink project template',
                welcomeFile: 'README.md',
                resourcesPath: new URI(module.path).resolve('../../resources/blink').normalizePath().toString(),
                launches: (options: ExampleOptions) => this.getPicoLaunchConfigs(options),
                tasks: (options: ExampleOptions) => this.getPicoTasks(options)
            }];
    }

    private getPicoLaunchConfigs(options: ExampleOptions): DebugConfiguration[] {
        return [{
            'name': `Debug Pico Example (${options.targetFolderName})`,
            'type': 'gdbtarget',
            'request': 'launch',
            'program': `\${workspaceFolder}/${options.targetFolderName}/build/${options.targetFolderName}.elf`,
            'gdb': 'gdb-multiarch',
            'initCommands': [],
            'target': {
                'host': '127.0.0.1',
                'port': '3333',
                'server': '${config:pico.openocd.path}',
                'serverParameters': [
                    '-s',
                    '~/pico/openocd/tcl',
                    '-f',
                    'interface/cmsis-dap.cfg',
                    '-f',
                    'target/rp2040.cfg',
                    '-c',
                    '"adapter speed 5000"'
                ]
            },
            'preLaunchTask': `Binary build debug (${options.targetFolderName})`
        }];
    }

    private getPicoTasks(options: ExampleOptions): TaskCustomization[] {
        return [
            {
                'label': `Run CMake (${options.targetFolderName})`,
                'type': 'shell',
                'options': {
                    'cwd': `\${workspaceFolder}/${options.targetFolderName}`
                },
                'command': 'cmake . -B build -DCMAKE_BUILD_TYPE=Debug -DCMAKE_EXPORT_COMPILE_COMMANDS=ON',
                'group': {
                    'kind': 'build',
                    'isDefault': true
                },
                'problemMatcher': [],
                'runOptions': {
                    // @ts-ignore
                    'runOn': 'folderOpen'
                }
            },
            {
                'label': `Binary build release (${options.targetFolderName})`,
                'type': 'shell',
                'options': {
                    'cwd': `\${workspaceFolder}/${options.targetFolderName}`
                },
                'command': 'cmake . -B build -DCMAKE_BUILD_TYPE=Release -DCMAKE_EXPORT_COMPILE_COMMANDS=ON && make -C build -j4',
                'group': {
                    'kind': 'build',
                    'isDefault': true
                },
                'problemMatcher': [],
                'runOptions': {
                    // @ts-ignore
                    'runOn': 'folderOpen'
                }
            },
            {
                'label': `Binary build debug (${options.targetFolderName})`,
                'type': 'shell',
                'options': {
                    'cwd': `\${workspaceFolder}/${options.targetFolderName}`
                },
                'command': 'cmake . -B build -DCMAKE_BUILD_TYPE=Debug -DCMAKE_EXPORT_COMPILE_COMMANDS=ON && make -C build -j4',
                'group': {
                    'kind': 'build',
                    'isDefault': true
                },
                'problemMatcher': [],
                'runOptions': {
                    // @ts-ignore
                    'runOn': 'folderOpen'
                }
            }
        ];
    }
}
