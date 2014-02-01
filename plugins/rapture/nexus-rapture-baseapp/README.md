<!--

    Sonatype Nexus (TM) Open Source Version
    Copyright (c) 2007-2013 Sonatype, Inc.
    All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.

    This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
    which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.

    Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
    of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
    Eclipse Foundation. All other trademarks are the property of their respective owners.

-->
# Nexus Rapture Baseapp

This module provides the baseapp muck for ExtJS 4+ pre-compiled with Sencha CMD.

Requires Sencha CMD 4+

When updating baseapp/ext need to be aware there are directories named 'target':
* ext/src/fx/target

May completely revisit this solution later.

## Regenerating

    mvn clean install -Pregenerate

If the content has changed, then the result needs to be committed:

    git commit . -m "regenerated baseapp"

## Watching

  mvn clean install -Pwatch

