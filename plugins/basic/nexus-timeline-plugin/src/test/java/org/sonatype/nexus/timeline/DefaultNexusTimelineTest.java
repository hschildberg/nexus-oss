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

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.sonatype.nexus.NexusAppTestSupport;
import org.sonatype.timeline.internal.guice.TimelineModule;

import com.google.common.base.Predicate;
import com.google.inject.Module;
import org.junit.After;
import org.junit.Test;

public class DefaultNexusTimelineTest
    extends NexusAppTestSupport
{
  @Override
  protected void customizeModules(final List<Module> modules) {
    modules.add(new TimelineModule());
  }

  @Override
  protected void tearDown() throws Exception
  {
    lookup(NexusTimeline.class).shutdown();
    super.tearDown();
  }


  /**
   * Handy method that does what was done before: keeps all in memory, but this is usable for small amount of data,
   * like these in UT. This should NOT be used in production code, unless you want app that kills itself with OOM.
   */
  protected List<Entry> asList(int fromItem, int count, Set<String> types, Set<String> subTypes,
                               Predicate<Entry> filter) throws Exception
  {
    final EntryListCallback result = new EntryListCallback();
    lookup(NexusTimeline.class).retrieve(fromItem, count, types, subTypes, filter, result);
    return result.getEntries();
  }

  @Test
  public void testSimpleTimestamp() throws Exception {
    HashMap<String, String> data = new HashMap<String, String>();
    data.put("a", "a");
    data.put("b", "b");

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 1L * 60L * 60L * 1000L, "TEST", "1", data);

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 1L * 60L * 60L * 1000L, "TEST", "2", data);

    List<Entry> res =
        asList(1, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"1"})), null);

    assertEquals(0, res.size());

    res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"1"})), null);

    assertEquals(1, res.size());

    res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"2"})), null);

    assertEquals(1, res.size());

    res = asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(2, res.size());
  }

  @Test
  public void testSimpleItem() throws Exception {
    HashMap<String, String> data = new HashMap<String, String>();
    data.put("a", "a");
    data.put("b", "b");

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 1L * 60L * 60L * 1000L, "TEST", "1", data);

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 1L * 60L * 60L * 1000L, "TEST", "2", data);

    List<Entry> res = asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(2, res.size());

    res = asList(1, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(1, res.size());
    assertEquals("b", res.get(0).getData().get("b"));

    res = asList(2, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(0, res.size());

    res = asList(0, 1, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(1, res.size());
    assertEquals("a", res.get(0).getData().get("a"));

    res = asList(0, 0, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(0, res.size());

    res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"1"})), null);

    assertEquals(1, res.size());

    res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"1"})), null);

    assertEquals(1, res.size());

    res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"2"})), null);

    assertEquals(1, res.size());

    res = asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})), null, null);

    assertEquals(2, res.size());
  }

  @Test
  public void tetOrder() throws Exception {
    HashMap<String, String> data = new HashMap<String, String>();
    data.put("place", "2nd");
    data.put("x", "y");

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 2L * 60L * 60L * 1000L, "TEST", "1", data);

    data.put("place", "1st");

    lookup(NexusTimeline.class).add(System.currentTimeMillis() - 1L * 60L * 60L * 1000L, "TEST", "1", data);

    List<Entry> res =
        asList(0, 10, new HashSet<String>(Arrays.asList(new String[]{"TEST"})),
            new HashSet<String>(Arrays.asList(new String[]{"1"})), null);

    assertEquals(2, res.size());

    assertEquals("1st", res.get(0).getData().get("place"));

    assertEquals("2nd", res.get(1).getData().get("place"));
  }
}
