---
title: "Adversary-in-the-Middle Attacks: How Phishing Sites Steal Your Active Login"
date: 2026-05-28
author: Kevin Lane
draft: true
featuredImage: /images/blog/difference-between-malware-ransomware.png
featuredImageAlt: An illustration of an anonymous hacker in a blue hoodie
  sitting behind a laptop, centered on a blue background.
categories:
  - Cybersecurity
  - Business Tips
seoTitle: "Adversary-in-the-Middle Phishing: How Logins Are Stolen"
metaDescription: What is an AitM phishing attack? Find out how cybercriminals
  intercept active login sessions and steal credentials, even with multi-factor
  authentication.
focusKeyphrase: AitM phishing attacks
ogTitle: "The anatomy of an AitM attack: How modern phishing sites hijack sessions."
ogDescription: Multi-factor authentication is no longer foolproof.
  Cybercriminals are increasingly using Adversary-in-the-Middle (AitM) phishing
  attacks to intercept active login sessions, bypassing security controls
  entirely. In our latest post, we break down exactly how these sophisticated
  attacks work and how you can defend your organization.
---
You click a link, sign in, approve the MFA prompt, and get on with your day. You are completely unaware that a cybercriminal just logged into your account at the exact same moment.

That scenario surprises many businesses, particularly those that rely heavily on multi-factor authentication (MFA) to protect cloud accounts. But this is exactly how [AitM phishing attacks](https://www.huntress.com/cybersecurity-101/topic/adversary-in-the-middle-attack) work. Rather than stealing passwords for later use, these attacks silently hijack an already-authenticated session in real time.

MFA remains a core security control, and implementing it correctly is still a critical first step for any business. But AitM attacks exploit something standard MFA was never designed to protect: the trusted session that exists after authentication has already completed.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Why Modern Phishing Has Moved Beyond Passwords

Phishing remains the most common starting point for account compromise, but the objective has changed. Traditional phishing collected usernames and passwords. Modern phishing is after something more immediately useful: the authenticated session itself.

Security researchers have documented a significant shift toward session and token theft. Instead of reusing stolen credentials—which MFA typically blocks—attackers intercept the authentication process as it happens. They wait until the user successfully completes the login, then steal the session token that proves the login already occurred.

The technique has matured quickly. Phishing-as-a-Service (PhaaS) platforms now supply ready-made proxy toolkits. These kits let even low-skilled attackers run sophisticated AitM campaigns targeting Microsoft 365 and Google Workspace. If you are concerned about your current vulnerabilities, you can schedule an identity security consultation with Simple IT to find these gaps.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## How AitM Attacks Actually Work

### 1. The Fake Login Page That Isn’t Fake

An AitM phishing site is not a basic replica of a login page. It is a live reverse proxy. The attacker’s infrastructure sits directly between the user and the real authentication service. Every keystroke, redirect, and server response flows through the attacker’s system in real time.

From the user’s perspective, nothing looks wrong. The page behaves exactly like the real service, featuring:

•	Correct company branding

•	Working page redirects

•	A fully functioning MFA prompt

In most cases, the only clue is a slightly altered URL. This easily goes unnoticed on a mobile screen or when an employee is under time pressure.

### 2. Why Standard MFA Doesn't Stop It

This is where many security assumptions fall apart. MFA protects the exact moment of authentication, not what comes after it.

Once a user successfully completes MFA, the service issues a session cookie. This cookie signals to the cloud application that the user is already verified. From that point forward, no password or MFA prompt is required. The system trusts the token.

**The Golden Rule of Session Security**: *Whoever holds the cookie holds the access.*

AitM phishing attacks simply wait for that cookie to be issued, then steal it. Microsoft tracked a [146% rise in AitM attacks over the past year](https://www.microsoft.com/en-us/security/blog/2025/05/29/defending-against-evolving-identity-attack-techniques/), as cybercriminals increasingly shift focus to accounts already protected by MFA. Much of this increase is driven by PhaaS platforms like Evilginx that allow attackers to run convincing reverse-proxy campaigns at scale with minimal setup.

### 3. The Session Replay Attack

Session tokens act as bearer credentials. Once the cookie is stolen, the attacker imports it into their own browser and immediately resumes the session.

This is called a session replay attack. The attacker never actually logs in. They simply pick up exactly where the legitimate user left off, operating inside a fully trusted, already-verified session.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## What Happens After a Session Is Stolen?

The aftermath of an AitM attack tends to be quiet, which is precisely what makes it dangerous. Because the attacker is operating inside a legitimate session, standard security alerts are rarely triggered:

•	No failed MFA attempts

•	No unusual login alerts

•	Nothing suspicious in standard sign-in logs

[Research from Proofpoint](https://www.proofpoint.com/us/blog/email-and-cloud-threats/aitm-phishing-attacks-evolving-threat-microsoft-365) shows that attackers who gain access through session hijacking commonly execute specific follow-on actions:

•	Create hidden inbox rules to redirect corporate mail

•	Register additional MFA methods to lock in persistent access

•	Monitor email threads for sensitive financial conversations

•	Use the trusted account to launch internal phishing campaigns against colleagues

These quiet actions are the primary reason AitM attacks are frequently uncovered late—often after financial fraud, data exposure, or a wider network compromise has already begun.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## How to Reduce Your Exposure and Protect Your Business

MFA is still essential, and building strong authentication practices remains your baseline. However, reducing your AitM risk requires controls that extend beyond the login screen itself.

•	Adopt Phishing-Resistant MFA: Methods like FIDO2 hardware keys and passkeys bind authentication to the specific device and the legitimate domain. A proxy in the middle cannot relay them; the process fails if the URL is not the real one. The [Canadian Centre for Cyber Security](https://www.cyber.gc.ca/en/guidance/defending-against-adversary-middle-threats-phishing-resistant-multi-factor-authentication-itsm30031) analyzed over 100 AitM campaigns targeting Microsoft Entra ID accounts and found that phishing-resistant MFA consistently blocked session theft where standard MFA (including push notifications and one-time passcodes) failed.

•	Tighten Conditional Access Policies: Risk-based access controls evaluate additional signals, including device compliance, IP location, and session behavior. Configured correctly, these policies can detect and block anomalous access even when a stolen session token appears valid.

•	Monitor for Post-Login Anomalies: Detecting an AitM compromise means watching for activity after login. Look for new MFA method registrations, inbox rules created outside business hours, access from unfamiliar locations, or unusual data downloads. Authentication logs alone will not surface these problems.

•	Train Users on URL Awareness: Employees who understand that a working MFA prompt can still exist on an unfamiliar domain are better positioned to pause, check the URL, and report the threat. A brief team walkthrough of what AitM lures look like in Microsoft 365 contexts can meaningfully reduce your exposure.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

## Stop Protecting Just the Login Screen

MFA is a baseline, not a finish line. The businesses that successfully reduce AitM risk are the ones that understand how sessions, tokens, and identity trust actually work. They build controls around every layer, not just the login screen.

Want to review your identity security controls and ensure your business is fully protected? Contact the team at Simple IT today to identify the security gaps that matter most—before an incident does it for you.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Article used with permission from **[The Technology Press](https://thetechnologypress.com/adversary-in-the-middle-attacks-how-phishing-sites-steal-your-active-login/)**.
