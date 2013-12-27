package org.sonatype.nexus.rapture.internal;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.Iterator;
import java.util.List;

import javax.inject.Inject;
import javax.inject.Named;
import javax.inject.Provider;
import javax.inject.Singleton;

import org.sonatype.nexus.web.WebResource;
import org.sonatype.nexus.webresources.WebResourceService;
import org.sonatype.sisu.goodies.common.ComponentSupport;
import org.sonatype.sisu.goodies.template.TemplateEngine;
import org.sonatype.sisu.goodies.template.TemplateParameters;

import com.google.common.collect.Lists;

import static com.google.common.base.Preconditions.checkNotNull;
import static com.google.common.base.Preconditions.checkState;

/**
 * Provides {@code /static/rapture/app.js}.
 *
 * @since 2.8
 */
@Named
@Singleton
public class AppJsWebResource
    extends ComponentSupport
    implements WebResource
{
  private static final String NS_PREFIX = "/static/rapture/NX/";

  private static final String PLUGIN_CONFIG_SUFFIX = "/app/PluginConfig.js";

  private final TemplateEngine templateEngine;

  private final Provider<WebResourceService> webResourceServiceProvider; // avoid circular dep

  @Inject
  public AppJsWebResource(final TemplateEngine templateEngine,
                          final Provider<WebResourceService> webResourceServiceProvider)
  {
    this.templateEngine = checkNotNull(templateEngine);
    this.webResourceServiceProvider = checkNotNull(webResourceServiceProvider);
  }

  @Override
  public String getPath() {
    return "/static/rapture/app.js";
  }

  @Override
  public String getContentType() {
    return "application/x-javascript";
  }

  @Override
  public long getSize() {
    return UNKNOWN_SIZE;
  }

  @Override
  public long getLastModified() {
    return System.currentTimeMillis();
  }

  @Override
  public boolean isCacheable() {
    return false;
  }

  @Override
  public InputStream getInputStream() throws IOException {
    List<String> classNames = getPluginConfigClassNames();
    if (classNames.isEmpty()) {
      log.warn("Did not detect any rapture plugin configurations");
    }
    else {
      log.debug("Plugin config class names: {}", classNames);
    }

    URL template = AppJsWebResource.class.getResource("app.vm");
    checkState(template != null, "Missing app.vm template");

    return new ByteArrayInputStream(templateEngine.render(
        this, template, new TemplateParameters().set("pluginConfigClassNames", join(classNames))).getBytes()
    );
  }

  /**
   * Returns a list of all {@code NX._package_.app.PluginConfig} extjs classes.
   */
  private List<String> getPluginConfigClassNames() {
    List<String> classNames = Lists.newArrayList();

    for (String path : webResourceServiceProvider.get().getPaths()) {
      if (path.startsWith(NS_PREFIX) && path.endsWith(PLUGIN_CONFIG_SUFFIX)) {
        // rebuild the class name which has NX. prefix and minus the .js suffix
        String name = path.substring(NS_PREFIX.length() - "NX/".length(), path.length() - ".js".length());
        // convert path to class-name
        name = name.replace("/", ".");
        classNames.add(name);
      }
    }

    return classNames;
  }

  /**
   * Joins the list of strings quoted for javascript list members (in side of [ ... ]).
   */
  private String join(final List<String> list) {
    StringBuilder buff = new StringBuilder();
    Iterator<String> iter = list.iterator();
    while (iter.hasNext()) {
      String pkg = iter.next();
      buff.append("'").append(pkg).append("'");
      if (iter.hasNext()) {
        buff.append(",");
      }
    }
    return buff.toString();
  }
}