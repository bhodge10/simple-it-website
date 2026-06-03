---
title: "The “Zombie” SaaS Audit: Finding the 3 Apps Your Former Employees Still
  Access"
date: 2026-06-09
author: Brad Hodge
draft: true
featuredImage: /images/blog/pexels-afitab-152665775-13751210.jpg
categories:
  - Cybersecurity
---
Someone leaves the company on a Friday. By Monday, their email account is disabled, and their laptop is back in the pile.

What nobody checks is their login to the project management tool they signed up for in Q3, the cloud storage folder they shared with a contractor, or the CRM access they still have from two roles ago.

Three months later, those sessions are still active.

This is how zombie accounts form. nNot through negligence, but through an offboarding process built around corporate IT assets that no longer reflects how Northern Kentucky businesses actually use software.

The average company now runs more than 100 SaaS applications. Most offboarding checklists were written when there were three.   

**<H2>What a Zombie Account Actually Is</H2>**

A zombie account is an active login that belongs to someone who no longer works for you. The name is informal. The risk is not.

What makes zombie accounts particularly dangerous is that they are valid credentials that create serious cybersecurity and data protection risks

There is nothing to detect. The access was granted intentionally, and the system has no reason to question it. If a former employee walks back in through that door, or if their credentials are compromised after they leave, the access is there waiting.

[Industry research finds that 50% of organizations](https://josys.com/article/top-saas-cybersecurity-risks-in-2025) have discovered former employees still accessing SaaS applications months after their departure date.

For most of those organizations, the discovery was accidental rather than the result of a deliberate audit.

**<H2>The Three Apps Where Access Never Gets Removed</H2>**

**<H3>Cloud storage and collaboration tools</H3>**

Google Drive, OneDrive, and Dropbox are where zombie access causes the most immediate damage.

These platforms are where offboarding gets messy. Files may be shared with a departing employee’s personal account. Guest permissions granted during a project may never get cleaned up. And folders set to “anyone with the link” access may still be bookmarked.

The departure triggers a license removal in the identity provider. The shared folders, external links, and personal-account shares go untouched.

**<H3>Project management and CRM platforms</H3>**

Tools like Asana, Monday.com, Notion, Jira, HubSpot, and Salesforce are frequently provisioned by team leads rather than IT. That means the offboarding checklist has no visibility into them.

A former account executive’s Salesforce login, or a project manager’s Notion workspace with access to company strategy documents, can persist for months without anyone noticing

**<H3>The tools IT didn’t know existed</H3>**

This is the most dangerous category.

These are the tools employees signed up for using their work email. A survey platform. An AI writing assistant. A data visualisation tool. They were never formally provisioned, and they were never formally revoked.

When the employee leaves, the account does not get disabled. It sits there, attached to a work email address that may now redirect to an IT catch-all.

**<H2>Running the Zombie SaaS Audit</H2>**

**<H3>Step 1: Build your SaaS inventory</H3>**

Start by pulling a list of all SaaS applications connected to your identity provider: Microsoft Entra ID, Google Workspace Admin, or Okta, if you use one.

Cross-reference with billing records, browser extension installs, and email domains showing regular login notifications.

[Grip Security’s 2025 SaaS Security Risks Report](https://www.grip.security/saas-security-risks-report-2025), analyzing 29 million user accounts, identified 23,987 distinct SaaS applications in use across its customer base. That’s far more than any IT team tracks manually.

Of those applications, 90% remained outside IT’s management.

For smaller teams without a dedicated identity platform, a 30-minute review of active subscriptions and recent login notifications will surface most of the high-risk tools.

**<H3>Cross-reference against your offboarding list</H3>**

Take the last 12 months of departures and check each name against the SaaS inventory.

For each application, ask:

· Does this platform have an admin console?

· Can you see who is still active?

· When did this account last log in?

Access that is months old and belongs to someone who has left is a zombie. Flag it for immediate revocation. Document what you find.

**<H3>Step 3: Revoke, document, and set a review cadence</H3>**

Remove the access. Record what was found and when. Then use the audit as the baseline for an offboarding checklist that covers more than the corporate email and laptop.

Going forward, enforce multi-factor authentication on all remaining active accounts and schedule a SaaS access review every quarter as part of your ongoing cybersecurity strategy.

That cadence turns a one-time cleanup into a repeatable control.

**<H2>Making Offboarding a Security Process</H2>**

Zombie accounts cannot be removed if no one is looking for them. The SaaS offboarding audit is the starting point.

Want to close the gaps in your SaaS offboarding process?

At **Simple IT**, we help Northern Kentucky businesses strengthen cybersecurity, reduce unauthorized access risks, and improve their overall security posture.

Contact us or schedule a consultation to run a zombie SaaS audit and build a repeatable process your team can follow on every exit.
