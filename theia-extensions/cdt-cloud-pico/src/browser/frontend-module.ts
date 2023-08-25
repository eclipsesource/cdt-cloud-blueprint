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
import '../../src/browser/css/index.css';

import { CommandContribution, MenuContribution } from '@theia/core';
import { LabelProviderContribution } from '@theia/core/lib/browser/label-provider';
import { ContainerModule, interfaces } from '@theia/core/shared/inversify';

import { bindCDTCloudPicoNavigator } from './cdt-navigator/navigator-module-util';
import { bindDeviceManager } from './device-manager/device-manager-module-util';
import { ProjectTreeLabelProviderContribution } from './label-provider';
import { bindPicoWelcomeWidget } from './pico-getting-started/frontend-module-util';
import { bindPicoPreferences } from './preferences';
import { ProjectContribution } from './project-command-contribution';
import { bindPicoProjectEditor } from './project-editor/project-editor-module-util';
import { bindToolbarContribution } from './toolbar-contribution';

export default new ContainerModule((bind: interfaces.Bind, _unbind: interfaces.Unbind, _isBound: interfaces.IsBound, rebind: interfaces.Rebind) => {
    bindDeviceManager(bind);
    bindCDTCloudPicoNavigator(bind);
    bindToolbarContribution(rebind);
    bindPicoPreferences(bind);
    bindPicoWelcomeWidget(bind);
    bindPicoProjectEditor(bind);

    bind(LabelProviderContribution).to(ProjectTreeLabelProviderContribution).inSingletonScope();
    bind(CommandContribution).to(ProjectContribution).inSingletonScope();
    bind(MenuContribution).to(ProjectContribution).inSingletonScope();
});
