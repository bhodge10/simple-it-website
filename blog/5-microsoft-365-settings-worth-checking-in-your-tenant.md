---
title: 5 Microsoft 365 Security Settings Every NKY Business Should Have Reviewed
date: 2026-06-23
author: William Jones
draft: false
featuredImage: https://res.cloudinary.com/dygso04l2/image/upload/v1783947300/ChatGPT_Image_Jun_23_2026_10_21_08_PM_1_qrugsn.png
featuredImageAlt: IT specialist reviewing and auditing Microsoft 365 settings to
  strengthen security, compliance, and user access controls
categories:
  - Managed IT
seoTitle: 5 Microsoft 365 Security Settings NKY Businesses Should Review
metaDescription: Is your Microsoft 365 environment more than two years old? Here
  are 5 security settings every Northern Kentucky business should review.
focusKeyphrase: Microsoft 365 Security Settings
ogTitle: Is Your Microsoft 365 Actually Secure? 5 Settings to Check | Simple IT
ogDescription: Older Microsoft 365 environments often have security gaps that
  nobody knows about. Here are 5 settings worth a closer look, especially if
  your setup hasn't been audited in a while.
---
If your Microsoft 365 environment is more than two or three years old, there's a good chance it has security gaps you don't know about. Not because something went wrong — but because Microsoft regularly tightens its default settings, and those changes don't automatically apply to older setups. Your Microsoft 365 environment (your company's unique instance, often called a 'tenant') stays exactly as it was when it was first built, even as the threat landscape around it keeps evolving. 

Here are five settings worth reviewing, especially if your environment hasn't been audited recently, or if it was set up by a previous IT provider.

## **1. The default sharing link in SharePoint and OneDrive**

Every time someone on your team shares a file, Microsoft generates a link — and in older environments, that link may be accessible to anyone who receives it, with no login required and no expiration date. That's a problem if a departing employee ever shared a sensitive file, because that link could still be working today. In tenants set up before Microsoft tightened the new-site defaults, that scope is often “Anyone with the link,” which means anyone who receives the URL can open the file without signing in. No expiration. No record of who else the link was forwarded to.

Newer Teams-created sites now default to “Only people in your organization.” Older sites and the tenant-level setting often still allow Anyone links. A departing employee who emailed a proposal to their personal account six months ago still has a working link, unless someone manually revoked it.

The default sharing link type sits in the[ SharePoint admin center](https://learn.microsoft.com/en-us/sharepoint/turn-external-sharing-on-or-off) under Policies > Sharing. Switching the tenant default to “Specific people” forces every new link to require authentication. You can also set a maximum expiration for any remaining “Anyone” links so they time out automatically.

Rough time to change: 15 minutes. This has no impact on existing links until they're regenerated.

## **2. External email forwarding rules**

Microsoft now[ blocks automatic email forwarding to external addresses](https://learn.microsoft.com/en-us/defender-office-365/outbound-spam-policies-external-email-forwarding) at the tenant level by default, through the outbound spam policy. This rolled out as part of Microsoft's secure-by-default effort.

An employee who set up a rule years ago to automatically forward company emails to their personal account may still be doing exactly that — quietly exporting your data without anyone noticing. It's one of the more common and overlooked security gaps we see in older Microsoft 365 environments.

Verify two things. In the Microsoft Defender portal, under Email & Collaboration > Policies & Rules > Anti-spam policies > Anti-spam outbound policy, confirm the “Automatic forwarding rules” setting is set to “Off” or “Automatic - System-controlled.” Then audit existing inbox rules across your users for any forward-to-external configurations. The Microsoft Purview audit log lets you search for inbox rule creation events.

Rough time: 10 minutes to verify the tenant setting, longer to review existing rules across all mailboxes.

## **3. Historical third-party app consents**

A Microsoft-managed [user consent policy ](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/configure-user-consent)was enabled by default in July 2025, preventing users from consenting to most third-party applications that request access to their files and sites. New consent requests now route to an admin for review.

The change applies going forward. Apps that were granted user consent before the policy took effect still have whatever permissions they were given, including the ability to read mail, calendars, and files on behalf of the user. Some of those apps may be tools an employee installed years ago and no longer uses, or apps installed during a one-off project that nobody remembers approving.

To review what's already there, go to Microsoft Entra ID > Enterprise Applications > All applications. Sort by user consent and look at what currently has access to mail, files, or calendars. Anything you don't recognize or no longer need can be revoked from the same screen.

Rough time: 30 to 60 minutes for the review, depending on how many historical apps are in the list.

## **4. Mailbox and tenant audit log retention**

How long Microsoft 365 retains your audit logs may not match your compliance obligations, and if your environment hasn't been reviewed recently, you may not know the difference. [Audit (Standard) logs](https://learn.microsoft.com/en-us/purview/audit-log-retention-policies) are now retained for 180 days, up from the previous 90 days. Customers with E5 licensing or the Microsoft Purview Audit (Premium) add-on get one year of retention for Exchange, SharePoint, OneDrive, and Entra ID audit records, with other activity types staying at 180 days.

If you're in healthcare, financial services, legal, or any other regulated industry, 180 days may not match your retention obligations. HIPAA, the FTC Safeguards Rule, and most state bar rules around client data assume you can produce records on request, and the relevant period is often measured in years, not months.

Audit retention policies live in the Microsoft Purview compliance portal under Audit > Audit retention policies. Extending retention beyond 180 days requires E5 or the Purview Audit add-on. The configuration itself takes about 15 minutes once you've confirmed your license supports it.

## **5. MFA enforcement and Security Defaults**

Of the five areas covered in this article, this one carries the most risk if it's not configured correctly — and it's the area most likely to have gaps in older Microsoft 365 environments. Microsoft introduced[ Security Defaults](https://learn.microsoft.com/en-us/entra/fundamentals/security-defaults) in late 2019, and the feature now enforces MFA automatically on new tenants. Microsoft has also been progressively making MFA mandatory for admin actions in the Microsoft 365 admin center and Azure portal through 2024 and 2025.

Tenants created before Security Defaults rolled out may have no baseline enforcement. There's also a common configuration trap. When an admin enables a Conditional Access policy, which is available with Business Premium and above, Microsoft expects you to take over MFA enforcement through that policy and may turn Security Defaults off. If the transition was done quickly, you can end up with Security Defaults off and a Conditional Access policy that doesn't cover every user.

Check three places. In the Entra ID admin center under Properties > Manage Security Defaults, confirm whether Security Defaults is on or off. Under Protection > Conditional Access, confirm a policy is actively enforcing MFA for all users, including administrators. Pay particular attention to break-glass admin accounts, which are sometimes excluded from Conditional Access for emergency access reasons and left with no MFA as a result.

Rough time: about an hour, longer if Conditional Access has been configured with several existing policies you need to map.

## **A sensible order to roll the changes**

Some of these changes are silent to your users. Others change how something they do every day works.

Audit log retention (#4) and the historical app consent review (#3) carry no user-facing impact. Start there.

Verifying external forwarding (#2) is silent unless someone has a legitimate forwarding rule, which is rare. Do this next.

The sharing default (#1) will eventually generate user questions, particularly from anyone used to clicking “share” and pasting the link into an email. Communicate the change before you flip the tenant setting.

The MFA and Conditional Access review (#5) is the highest-stakes change and the one most likely to lock people out if it's done badly. Save it for last and budget the time to do it properly.

### Not sure where to start?

If any of these five areas gave you pause, that's a good sign it's time for a fresh set of eyes on your Microsoft 365 environment. At **Simple IT**, we take a security-first approach to Microsoft 365 management and we work with Northern Kentucky businesses every day to close exactly these kinds of gaps, before they become incidents.

Want some peace of mind to be sure your businesses' Microsoft 365 environment is configured securely? **[Schedule a free IT assessment](https://simple-it.us/#contact)** and we'll help identify the potential gaps, as well the suggested adjustments to lock them down.

Give us a call at **859-449-7878** or email **[info@simple-it.us](mailto:info@simple-it.us)** to schedule a conversation with our team!

###### *\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\__*

###### *Article used with permission from [The Technology Press](https://thetechnologypress.com/what-immutable-backup-means-on-your-cyber-insurance-form/).*
