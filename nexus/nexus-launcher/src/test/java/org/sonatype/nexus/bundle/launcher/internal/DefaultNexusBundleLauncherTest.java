/**
 * Copyright (c) 2008-2011 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://www.sonatype.com/products/nexus/attributions.
 *
 * This program is free software: you can redistribute it and/or modify it only under the terms of the GNU Affero General
 * Public License Version 3 as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License Version 3
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License Version 3 along with this program.  If not, see
 * http://www.gnu.org/licenses.
 *
 * Sonatype Nexus (TM) Open Source Version is available from Sonatype, Inc. Sonatype and Sonatype Nexus are trademarks of
 * Sonatype, Inc. Apache Maven is a trademark of the Apache Foundation. M2Eclipse is a trademark of the Eclipse Foundation.
 * All other trademarks are the property of their respective owners.
 */
package org.sonatype.nexus.bundle.launcher.internal;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.sonatype.nexus.bundle.launcher.support.ant.AntHelper;
import org.sonatype.nexus.bundle.launcher.support.jsw.JSWExecFactory;
import org.sonatype.nexus.bundle.launcher.support.port.PortReservationService;
import org.sonatype.nexus.bundle.launcher.support.resolver.ArtifactResolver;
import org.sonatype.sisu.overlay.OverlayBuilder;

import java.io.File;
import java.util.List;

/**
 * This is just a dummy test for now
 */
@RunWith(MockitoJUnitRunner.class)
public class DefaultNexusBundleLauncherTest {

    @Mock
    private ArtifactResolver artifactResolver;

    @Mock
    private PortReservationService portService;

    @Mock
    private AntHelper ant;

    @Mock
    private NexusBundleUtils bundleUtils;

    @Mock
    private File serviceWorkDir;

    @Mock
    private File fakeBundle;

    @Mock
    private List<String> bundleExcludes;

    @Mock
    private OverlayBuilder overlayBuilder;

    @Mock
    private JSWExecFactory jswExecFactory;


    private DefaultNexusBundleLauncher getLauncher() {
        return new DefaultNexusBundleLauncher(artifactResolver, portService, ant, bundleUtils, serviceWorkDir, overlayBuilder, jswExecFactory);
    }

    @Test
    public void nothing() {

    }

}
