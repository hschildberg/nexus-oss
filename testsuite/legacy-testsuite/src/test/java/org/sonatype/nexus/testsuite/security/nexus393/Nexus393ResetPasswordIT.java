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

package org.sonatype.nexus.testsuite.security.nexus393;

import javax.mail.internet.MimeMessage;

import org.sonatype.nexus.integrationtests.AbstractEmailServerNexusIT;
import org.sonatype.nexus.test.utils.ResetPasswordUtils;

import com.icegreen.greenmail.util.GreenMailUtil;
import org.junit.Assert;
import org.junit.Test;
import org.restlet.data.Response;


/**
 * Test password reset.  Check if nexus is sending the e-mail.
 */
public class Nexus393ResetPasswordIT
    extends AbstractEmailServerNexusIT
{

  @Test
  public void resetPassword()
      throws Exception
  {
    String username = "test-user";
    Response response = ResetPasswordUtils.resetPassword(username);
    Assert.assertTrue("Status: " + response.getStatus() + "\n" + response.getEntity().getText(),
        response.getStatus().isSuccess());

    // Need 1 message
    waitForMail(1);

    MimeMessage[] msgs = server.getReceivedMessages();
    Assert.assertTrue("Expected email.", msgs != null && msgs.length > 0);
    MimeMessage msg = msgs[0];

    String password = null;
    // Sample body: Your password has been reset. Your new password is: c1r6g4p8l7
    String body = GreenMailUtil.getBody(msg);

    int index = body.indexOf("Your new password is: ");
    int passwordStartIndex = index + "Your new password is: ".length();
    if (index != -1) {
      password = body.substring(passwordStartIndex, body.indexOf('\n', passwordStartIndex)).trim();
      log.debug("New password:\n" + password);
    }

    Assert.assertNotNull(password);
  }

}
