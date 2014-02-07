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

package org.sonatype.nexus.rapture.internal.ux;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;
import javax.servlet.http.HttpSession;

import org.sonatype.nexus.ApplicationStatusSource;
import org.sonatype.nexus.SystemStatus;
import org.sonatype.nexus.extdirect.DirectComponentSupport;
import org.sonatype.nexus.rapture.Rapture;
import org.sonatype.nexus.rapture.StateContributor;
import org.sonatype.nexus.util.DigesterUtils;

import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.softwarementors.extjs.djn.config.annotations.DirectAction;
import com.softwarementors.extjs.djn.config.annotations.DirectPollMethod;
import com.softwarementors.extjs.djn.servlet.ssm.WebContextManager;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;

import static com.google.common.base.Preconditions.checkNotNull;

/**
 * State Ext.Direct component.
 *
 * @since 2.8
 */
@Named
@Singleton
@DirectAction(action = "rapture_State")
public class StateComponent
    extends DirectComponentSupport
{

  private final Rapture rapture;

  private final ApplicationStatusSource applicationStatusSource;

  private final List<Provider<StateContributor>> stateContributors;

  private final static Gson gson = new GsonBuilder().create();

  @Inject
  public StateComponent(final Rapture rapture,
                        final ApplicationStatusSource applicationStatusSource,
                        final List<Provider<StateContributor>> stateContributors)
  {
    this.rapture = checkNotNull(rapture, "rapture");
    this.applicationStatusSource = checkNotNull(applicationStatusSource);
    this.stateContributors = checkNotNull(stateContributors);
  }

  @DirectPollMethod(event = "rapture_State_get")
  public StateXO get(final Map<String, String> parameters) {
    StateXO stateXO = new StateXO();

    stateXO.setValues(getValues());
    stateXO.setCommands(getCommands());

    return stateXO;
  }

  public Map<String, Object> getValues() {
    HashMap<String, Object> values = Maps.newHashMap();

    for (Provider<StateContributor> contributor : stateContributors) {
      try {
        Map<String, Object> stateValues = contributor.get().getState();
        if (stateValues != null) {
          for (Entry<String, Object> entry : stateValues.entrySet()) {
            if (StringUtils.isNotBlank(entry.getKey())) {
              send(values, entry.getKey(), entry.getValue());
            }
            else {
              log.warn("Empty state id returned by {} (ignored)", contributor.getClass().getName());
            }
          }
        }
      }
      catch (Exception e) {
        log.warn("Failed to get state from {} (ignored)", contributor.getClass().getName(), e);
      }
    }

    send(values, "license", getLicense());
    send(values, "uiSettings", rapture.getSettings());

    return values;
  }

  private List<CommandXO> getCommands() {
    List<CommandXO> commands = Lists.newArrayList();

    for (Provider<StateContributor> contributor : stateContributors) {
      try {
        Map<String, Object> stateCommands = contributor.get().getCommands();
        if (stateCommands != null) {
          for (Entry<String, Object> entry : stateCommands.entrySet()) {
            if (StringUtils.isNotBlank(entry.getKey())) {
              CommandXO command = new CommandXO();
              command.setType(entry.getKey());
              command.setData(entry.getValue());
              commands.add(command);
            }
            else {
              log.warn("Empty command id returned by {} (ignored)", contributor.getClass().getName());
            }
          }
        }
      }
      catch (Exception e) {
        log.warn("Failed to get commands from {} (ignored)", contributor.getClass().getName(), e);
      }
    }

    return commands;
  }

  private void send(final Map<String, Object> values, final String key, final Object value) {
    boolean shouldSend = shouldSend(key, value);
    if (shouldSend) {
      values.put(key, value);
    }
  }

  public static boolean shouldSend(final String key, final Object value) {
    boolean shouldSend = true;
    if (WebContextManager.isWebContextAttachedToCurrentThread()) {
      HttpSession session = WebContextManager.get().getRequest().getSession(false);
      if (session != null) {
        String sessionAttribute = "state-digest-" + key;
        String currentDigest = (String) session.getAttribute(sessionAttribute);
        String newDigest = null;
        if (value != null) {
          // TODO is there another way to not use serialized json? :D
          newDigest = DigesterUtils.getSha1Digest(gson.toJson(value));
        }
        if (ObjectUtils.equals(currentDigest, newDigest)) {
          shouldSend = false;
        }
        else {
          if (newDigest != null) {
            session.setAttribute(sessionAttribute, newDigest);
          }
          else {
            session.removeAttribute(sessionAttribute);
          }
        }
      }
    }
    return shouldSend;
  }

  public LicenseXO getLicense() {
    LicenseXO licenseXO = new LicenseXO();
    SystemStatus status = applicationStatusSource.getSystemStatus();

    licenseXO.setRequired(!"OSS".equals(status.getEditionShort()));
    licenseXO.setInstalled(status.isLicenseInstalled());

    return licenseXO;
  }

}
