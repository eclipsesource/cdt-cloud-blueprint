/********************************************************************************
 * Copyright (C) 2020 TypeFox, EclipseSource and others.
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

import '../../src/browser/style/index.css';

import { AboutDialog } from '@theia/core/lib/browser/about-dialog';
import { CommandContribution } from '@theia/core/lib/common/command';
import { MenuContribution } from '@theia/core/lib/common/menu';
import { ContainerModule } from '@theia/core/shared/inversify';
import { TheiaBlueprintAboutDialog } from './theia-blueprint-about-dialog';
import { TheiaBlueprintContribution } from './theia-blueprint-contribution';

export default new ContainerModule((bind, _unbind, isBound, rebind) => {
    if (isBound(AboutDialog)) {
        rebind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope();
    } else {
        bind(AboutDialog).to(TheiaBlueprintAboutDialog).inSingletonScope();
    }

    bind(TheiaBlueprintContribution).toSelf().inSingletonScope();
    [CommandContribution, MenuContribution].forEach(serviceIdentifier =>
        bind(serviceIdentifier).toService(TheiaBlueprintContribution)
    );

});
