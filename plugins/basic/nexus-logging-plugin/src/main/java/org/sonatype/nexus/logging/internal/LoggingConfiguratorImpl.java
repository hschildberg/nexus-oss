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

package org.sonatype.nexus.logging.internal;

import java.io.BufferedOutputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import javax.inject.Inject;
import javax.inject.Named;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.parsers.SAXParserFactory;

import org.sonatype.nexus.log.DefaultLogConfiguration;
import org.sonatype.nexus.log.LogConfiguration;
import org.sonatype.nexus.log.LogManager;
import org.sonatype.nexus.log.LoggerLevel;
import org.sonatype.nexus.logging.LoggerContributor;
import org.sonatype.nexus.logging.LoggingConfigurator;
import org.sonatype.nexus.logging.model.LevelXO;
import org.sonatype.nexus.logging.model.LoggerXO;
import org.sonatype.nexus.util.io.StreamSupport;
import org.sonatype.sisu.goodies.common.TestAccessible;
import org.sonatype.sisu.goodies.common.io.FileReplacer;
import org.sonatype.sisu.goodies.common.io.FileReplacer.ContentWriter;
import org.sonatype.sisu.goodies.template.TemplateEngine;
import org.sonatype.sisu.goodies.template.TemplateParameters;

import com.google.common.base.Throwables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Maps.EntryTransformer;
import com.google.inject.Singleton;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import static com.google.common.base.Preconditions.checkArgument;
import static com.google.common.base.Preconditions.checkNotNull;

/**
 * {@link LoggingConfigurator} implementation.
 *
 * @since 2.7
 */
@Named
@Singleton
public class LoggingConfiguratorImpl
    implements LoggingConfigurator
{

  public static final String ROOT = "ROOT";

  private final LogManager logManager;

  private final TemplateEngine templateEngine;

  private final ReadWriteLock lock;

  private final List<LoggerContributor> contributors;

  private final Map<String, LoggerXO> userLoggers;


  @Inject
  public LoggingConfiguratorImpl(final LogManager logManager,
                                 final TemplateEngine templateEngine,
                                 final List<LoggerContributor> contributors)
  {
    this.logManager = checkNotNull(logManager);
    this.templateEngine = checkNotNull(templateEngine);
    this.contributors = contributors;

    lock = new ReentrantReadWriteLock();
    userLoggers = getUserLoggers();
  }

  @Override
  public Collection<LoggerXO> getLoggers() {
    Map<String, LoggerXO> loggers = Maps.newHashMap();

    // include all runtime loggers which have explicit levels
    loggers.putAll(getRuntimeLoggers());

    // include all contributed loggers
    loggers.putAll(getContributedLoggers());

    try {
      lock.readLock().lock();
      // include all custom loggers added by users
      loggers.putAll(userLoggers);
    }
    finally {
      lock.readLock().unlock();
    }
    return loggers.values();
  }

  @Override
  public LevelXO setLevel(final String name, final LevelXO level) {
    checkNotNull(name, "name");
    checkNotNull(level, "level");

    try {
      lock.writeLock().lock();
      LevelXO calculatedLevel = level;
      LoggerXO logger = userLoggers.get(name);
      if (LevelXO.DEFAULT.equals(level)) {
        if (logger != null) {
          userLoggers.remove(logger.getName());
          logger = null;
          configure();
        }
        calculatedLevel = levelOf(LoggerFactory.getLogger(name));
      }
      if (logger == null) {
        userLoggers.put(name, logger = new LoggerXO().withName(name));
      }
      logger.setLevel(calculatedLevel);
      configure();
      return calculatedLevel;
    }
    finally {
      lock.writeLock().unlock();
    }
  }

  @Override
  public void remove(final String name) {
    checkNotNull(name, "name");
    checkArgument(!ROOT.equals(name), ROOT + " logger cannot be removed");

    try {
      lock.writeLock().lock();
      userLoggers.remove(name);
      configure();
    }
    finally {
      lock.writeLock().unlock();
    }
  }

  private void configure() {
    try {
      Map<String, LoggerXO> loggersToBeWritten = Maps.newHashMap(userLoggers);
      loggersToBeWritten.remove(ROOT);
      writeLogbackXml(
          loggersToBeWritten.values(),
          logManager.getLogOverridesConfigFile(),
          templateEngine
      );
      logManager.setConfiguration(getLogConfiguration());
    }
    catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }

  private LogConfiguration getLogConfiguration() throws IOException {
    LogConfiguration configuration = logManager.getConfiguration();
    String rootLoggerLevel = userLoggers.get(ROOT).getLevel().toString();
    if (!configuration.getRootLoggerLevel().equals(rootLoggerLevel)) {
      DefaultLogConfiguration newConfiguration = new DefaultLogConfiguration(configuration);
      newConfiguration.setRootLoggerLevel(rootLoggerLevel);
      configuration = newConfiguration;
    }
    return configuration;
  }

  /**
   * Returns mapping of loggers read from logback configuration file.
   */
  private Map<String, LoggerXO> getUserLoggers() {
    try {
      final Map<String, LoggerXO> loggers = Maps.newHashMap();
      loggers.clear();
      String rootLevel = logManager.getConfiguration().getRootLoggerLevel();
      loggers.put(ROOT, new LoggerXO().withName(ROOT).withLevel(LevelXO.valueOf(rootLevel)));

      File dynamicLoggersFile = logManager.getLogOverridesConfigFile();
      if (dynamicLoggersFile.exists()) {
        try {
          for (LoggerXO logger : readLogbackXml(dynamicLoggersFile)) {
            loggers.put(logger.getName(), logger);
          }
        }
        catch (Exception e) {
          throw Throwables.propagate(e);
        }
      }

      return loggers;
    }
    catch (IOException e) {
      throw Throwables.propagate(e);
    }
  }

  /**
   * Return mapping of existing runtime loggers which have explicit levels configured.
   */
  private Map<String, LoggerXO> getRuntimeLoggers() {
    return Maps.transformEntries(logManager.getLoggers(), new EntryTransformer<String, LoggerLevel, LoggerXO>()
    {
      @Override
      public LoggerXO transformEntry(final String key, final LoggerLevel value) {
        return new LoggerXO().withName(key).withLevel(LevelXO.valueOf(value.name()));
      }
    });
  }

  /**
   * Returns mapping of loggers contributed by {@link LoggerContributor}s, with a level calculated as effective level.
   */
  private Map<String, LoggerXO> getContributedLoggers() {
    Map<String, LoggerXO> loggers = Maps.newHashMap();
    for (LoggerContributor contributor : contributors) {
      Set<String> contributedLoggers = contributor.getLoggers();
      if (contributedLoggers != null) {
        for (String loggerName : contributedLoggers) {
          Logger logger = LoggerFactory.getLogger(loggerName);
          LevelXO level = levelOf(logger);
          loggers.put(loggerName, new LoggerXO().withName(loggerName).withLevel(level));
        }
      }
    }
    return loggers;
  }

  /**
   * Get the level of a Slf4j {@link Logger}.
   */
  @TestAccessible
  LevelXO levelOf(final Logger logger) {
    if (logger.isTraceEnabled()) {
      return LevelXO.TRACE;
    }
    else if (logger.isDebugEnabled()) {
      return LevelXO.DEBUG;
    }
    else if (logger.isInfoEnabled()) {
      return LevelXO.INFO;
    }
    else if (logger.isWarnEnabled()) {
      return LevelXO.WARN;
    }
    else if (logger.isErrorEnabled()) {
      return LevelXO.ERROR;
    }
    return LevelXO.OFF;
  }

  @TestAccessible
  void writeLogbackXml(final Collection<LoggerXO> loggers,
                       final File logbackXml,
                       final TemplateEngine templateEngine) throws IOException
  {
    final FileReplacer fileReplacer = new FileReplacer(logbackXml);
    fileReplacer.setDeleteBackupFile(true);
    fileReplacer.replace(new ContentWriter()
    {
      @Override
      public void write(final BufferedOutputStream output)
          throws IOException
      {
        URL template = this.getClass().getResource("logback-overrides.vm"); //NON-NLS
        String content = templateEngine.render(
            this,
            template,
            new TemplateParameters().set("loggers", loggers)
        );
        try (final InputStream in = new ByteArrayInputStream(content.getBytes())) {
          StreamSupport.copy(in, output);
        }
      }
    });
  }

  @TestAccessible
  List<LoggerXO> readLogbackXml(final File logbackXml)
      throws IOException, ParserConfigurationException, SAXException
  {
    final List<LoggerXO> loggers = Lists.newArrayList();

    SAXParserFactory spf = SAXParserFactory.newInstance();
    spf.setValidating(false);
    spf.setNamespaceAware(true);
    spf.newSAXParser().parse(logbackXml, new DefaultHandler()
    {
      @Override
      public void startElement(final String uri,
                               final String localName,
                               final String qName,
                               final Attributes attributes) throws SAXException
      {
        if ("logger".equals(localName)) {
          String name = attributes.getValue("name");
          String level = attributes.getValue("level");
          loggers.add(new LoggerXO().withName(name).withLevel(LevelXO.valueOf(level)));
        }
      }
    });
    return loggers;
  }

}