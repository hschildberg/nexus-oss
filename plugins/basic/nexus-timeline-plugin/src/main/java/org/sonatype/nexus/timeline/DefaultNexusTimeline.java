/*
 * Sonatype Nexus (TM) Open Source Version
 * Copyright (c) 2007-2013 Sonatype, Inc.
 * All rights reserved. Includes the third-party code listed at http://links.sonatype.com/products/nexus/oss/attributions.
 *
 * This program and the accompanying materials are made available under the terms of the Eclipse Public License Version 1.0,
 * which accompanies this distribution and is available at http://www.eclipse.org/legal/epl-v10.html.
 *
 * Sonatype Nexus (TM) Professional Version is available from Sonatype, Inc. "Sonatype" and "Sonatype Nexus" are trademarks
 * of Sonatype, Inc. Apache Maven is a trademark of the Apache Software Foundation. M2eclipse is a trademark of the
 * Eclipse Foundation. All other trademarks are the property of their respective owners.
 */

package org.sonatype.nexus.timeline;

import java.io.IOException;
import java.util.Map;
import java.util.Set;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Singleton;

import org.sonatype.sisu.goodies.common.ComponentSupport;
import org.sonatype.timeline.Timeline;
import org.sonatype.timeline.TimelineCallback;
import org.sonatype.timeline.TimelineConfiguration;
import org.sonatype.timeline.TimelineRecord;

import com.google.common.base.Predicate;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * This is the "real thing": implementation backed by spice Timeline. Until now, it was in Core, but it kept many
 * important and key dependencies in core too, and making Nexus Core literally a hostage of it.
 *
 * @author cstamas
 * @since 2.0
 */
@Named
@Singleton
public class DefaultNexusTimeline
    extends ComponentSupport
    implements NexusTimeline
{
  private final Timeline timeline;

  @Inject
  public DefaultNexusTimeline(final Timeline timeline) {
    this.timeline = checkNotNull(timeline);

    try {
      log.info("Starting Nexus Timeline...");
      updateConfiguration();
    }
    catch (IOException e) {
      throw new RuntimeException("Unable to initialize Timeline!", e);
    }
  }

  @Override
  public void shutdown() {
    try {
      log.info("Stopping Nexus Timeline...");
      timeline.stop();
    }
    catch (IOException e) {
      throw new RuntimeException("Unable to cleanly stop Timeline!", e);
    }
  }

  private void updateConfiguration()
      throws IOException
  {
    timeline.start(new TimelineConfiguration());
  }

  @Override
  public void add(long timestamp, String type, String subType, Map<String, String> data) {
    timeline.add(new TimelineRecord(timestamp, type, subType, data));
  }

  @Override
  public void retrieve(int fromItem, int count, Set<String> types, Set<String> subtypes, Predicate<Entry> filter,
                       TimelineCallback cb)
  {
    if (filter != null) {
      timeline.retrieve(fromItem, count, types, subtypes, new PredicateTimelineFilter(filter), cb);
    }
    else {
      timeline.retrieve(fromItem, count, types, subtypes, null, cb);
    }
  }

  @Override
  public void purgeOlderThan(int days) {
    timeline.purgeOlderThan(days);
  }
}
