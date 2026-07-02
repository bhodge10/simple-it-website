---
title: "Cyber Insurance Requirements: What Business Owners Need to Know"
date: 2026-07-02
author: Kevin Lane
draft: true
featuredImage: https://res.cloudinary.com/dygso04l2/image/upload/v1782903739/ChatGPT_Image_Jul_1_2026_07_01_37_PM_dsobli.png
featuredImageAlt: Business owner reviewing cyber insurance requirements for
  policy renewal questions.
categories:
  - Cybersecurity
seoTitle: "Cyber Insurance Requirements: What NKY Businesses Need to Know"
metaDescription: See what carriers now require for cyber insurance, avoid the
  mistakes that void coverage, and get renewal-ready with Simple IT's Northern
  Kentucky IT team.
focusKeyphrase: cyber insurance requirements
ogTitle: "New Cyber Insurance Requirements: Is Your Business Ready?"
ogDescription: Cyber insurance requirements are tightening. See what carriers
  now ask, avoid the mistakes that void coverage, and get renewal-ready with
  Simple IT.
---
Cyber insurance requirements have tightened, and if you have a renewal coming up, the application is probably longer than the one you filled in last time. It's also more specific. Each new question maps to a control that, if missing, allowed a major 2023 or 2024 claim to escalate. The wording reflects how carriers responded to losses they paid in 2023 and 2024, and how you answer the form matters more than it used to.

This post covers why the application got longer, what each new section is asking, how to answer honestly without overstating your controls, and what to fix in the 30 days before submission. The expensive mistake on a cyber insurance application is rescission, where a future claim is denied because the carrier finds that the controls you declared were not in place at the time.

## Why cyber insurance requirements have become more strict

The current generation of cyber insurance requirements are shaped by three specific claim events from 2023 and 2024.

The[ MOVEit supply-chain breach](https://www.cybersecuritydive.com/news/moveit-breach-timeline/687417/) surfaced on May 28, 2023, when Progress Software received the first reports of unusual activity from customers. The Cl0p ransomware group had been exploiting a previously unknown vulnerability in Progress Software's MOVEit Transfer file-sharing tool, with activity detected by some researchers as early as February of that year. By late 2023, more than 2,650 organizations and over 66 million individuals had been affected, with totals rising further into 2024. Carriers paid claims across that footprint, and the experience reshaped how underwriters ask about third-party software risk.

Then the[ Change Healthcare ransomware incident](https://www.hipaajournal.com/biggest-healthcare-data-breaches-2024/) in February 2024 froze US healthcare claims processing for weeks. The attacker gained network access on February 12, 2024, and deployed ransomware on February 21, with downstream impact on pharmacies, providers, and patients across the country. HIPAA Journal's coverage noted that the absence of multifactor authentication on a key entry point made the initial intrusion possible. Industry analysts have estimated the cyber insurance loss from this single event at over $250 million, and the response was tighter questions about backup immutability and incident response readiness.

The[ Arup deepfake wire fraud,](https://fortune.com/europe/2024/05/17/arup-deepfake-fraud-scam-victim-hong-kong-25-million-cfo/) also from early 2024, reframed how underwriters approach social engineering. A finance employee at the engineering firm's Hong Kong office transferred $25.6 million across 15 wires after a video call with what appeared to be the company's CFO and other executives, all of whom were AI-generated deepfakes. The fraud went undiscovered for about a week, until the employee contacted Arup headquarters about a “secret transaction.” Out-of-band callback verification for wire transfers is now on every underwriter's checklist.

If you run an e-commerce store handling cardholder data, a healthcare practice with PHI, an accounting firm or law firm moving client funds, or a real estate brokerage handling escrow, your application is the longest of all. You sit in the loss categories carriers got burned on.

## **The backup question changed**

The backup question on cyber insurance requirements has tightened materially since 2023. What used to be a single yes/no question now asks whether those backups are immutable or air-gapped, when they were last tested, and whether they can be deleted by your domain administrator credentials.

Expect wording on your form like: “Are backups stored in an immutable or air-gapped state, tested for restoration within the past 12 months, and inaccessible to domain administrator credentials?”

An immutable backup is one that nobody can delete or alter during a fixed retention window, including someone using stolen administrator credentials. Air-gapped means the backup copy sits on infrastructure that cannot be reached from your production network. CISA's Stop Ransomware Guide lists immutable, tested backups as a baseline control, which is the same standard most cyber insurance carriers now apply.

“Microsoft 365 backup” is no longer a passing answer on its own. Native Microsoft 365 retention isn't a backup in the sense the carrier means. Third-party backups that share the same identity perimeter as your production tenant can be wiped by a compromised global admin.

For the immutable backup question, the strongest answer references a backup platform with object lock or write-once-read-many storage enabled, an immutability window of at least 14 days (with 30 days now preferred), credentials separated from your production admin accounts, and a recent successful restore test. Weaker answers describe daily backups to a NAS on the same network with no recent restore test, which typically triggers follow-up underwriting and sometimes a premium adjustment. Answers that leave the immutability question unclear are the ones most likely to push a renewal toward sub-limits or non-renewal.

## **MFA questions go deeper than one checkbox**

MFA was once captured as a single yes/no question on most applications. The current generation asks whether MFA is enforced on email, VPN, remote desktop (RDP), all administrator accounts, and privileged service accounts. The answer needs to be yes on all five for a clean pass.

SMS-based MFA is now treated as a weaker control. SIM-swap attacks and SS7 vulnerabilities have made text codes the weakest authentication factor available. Several carriers ask specifically whether your MFA uses an authenticator app, hardware token, or push with number matching, rather than SMS. If you're still on SMS for admin accounts, expect a follow-up question or a premium adjustment.

The privileged access management (PAM) question is the one most owners haven't seen before. PAM is a category of tool that keeps administrator credentials out of regular password managers. A PAM platform vaults privileged credentials, rotates them on use, and logs every session, which means a stolen admin password can't be used unnoticed for weeks before someone catches it.

A strong PAM answer describes a vaulting tool with credentials rotated on use and session logging enabled. Weaker answers, like admin passwords stored in a shared password manager with annual rotation, will usually trigger follow-up underwriting. Shared admin accounts that never rotate and produce no audit log of who used them are the configuration most likely to result in sub-limits or non-renewal.

Will cyber insurance be denied if you don't have MFA everywhere? Not always denied outright. Expect significant premium increases, sub-limits on ransomware coverage, or exclusions for any incident that traces back to the unprotected entry point.

## **The wire transfer and deepfake verification questions**

After the Arup case and a string of business email compromise losses, carriers added callback verification questions to their applications. Callback verification means that before sending any wire above a defined threshold (commonly $10,000 or $25,000), the person authorizing the transfer calls the recipient at a phone number previously verified and stored, not the number on the request email.

Expect wording like: “Does your organization require out-of-band verification using a previously known phone number for all funds transfer requests above \[threshold], including requests appearing to come from executives?”

Several current applications now ask separately whether staff have been trained on AI voice cloning and deepfake video risks. The Arup case made that question relevant for every carrier writing in professional services.

Accounting firms, law firms with escrow or trust accounts, and real estate brokers will see this section scrutinized most carefully. Anyone moving other people's money is a soft target and an expensive claim when wire fraud lands.

A strong answer references a written wire transfer policy requiring callback verification to a verified number for transfers above a stated threshold, dual approval, and annual social engineering training that includes deepfake awareness. Informal verification practice without a written policy will usually be flagged for follow-up. Wire transfers authorized by email approval alone are the configuration carriers are now declining to cover at all.

## **EDR, MDR, and the end of the “we have antivirus” answer**

Traditional antivirus scans files against a list of known threats. Endpoint Detection and Response (EDR) watches behavior on each device and flags suspicious activity, such as a process trying to encrypt files or escalate privileges. Managed Detection and Response (MDR) is EDR plus a 24/7 team watching the alerts and responding when something fires at 2am on a Sunday.

Current applications ask whether you have EDR deployed, whether it covers 100% of endpoints including servers, and whether a 24/7 security operations center (SOC) monitors and responds to alerts. The MDR question is increasingly yes or no, and the no answer has pricing consequences.

If you don't have MDR yet but plan to add it, say so plainly with a timeline. Underwriters can work with “MDR deployment scheduled for Q2 with vendor selected.” They cannot work with vague answers about future plans.

## **The vendor risk questions**

Supply chain questions used to be a single yes/no item. After MOVEit and Change Healthcare, carriers now want a full section on the software vendors holding your data.

Expect questions like: “List your top five software vendors with access to sensitive data and confirm whether each provides a SOC 2 Type II report or equivalent.” If you've never asked your practice management software vendor for a SOC 2 report, that conversation is overdue.

You're not expected to audit every vendor's security program in detail. The carrier wants to see that you know who your top vendors are, what data they hold, and that you've asked the basic questions like SOC 2 attestation. An honest “we've identified our top five vendors and requested SOC 2 reports from three, with two outstanding” reads better than a confident answer that falls apart in discovery.

## **The mistake to avoid: misrepresentation and rescission**

The most expensive answer on a cyber insurance application is the one that overstates the security controls you have in place. Cyber insurance applications are warranty documents. If a forensic investigation after a claim finds your environment didn't match what you declared, the carrier can rescind the policy.

Rescission means the policy is treated as if it never existed, your claim is denied, and any prior payouts under the same policy term can be clawed back. Some courts have found that the carrier doesn't need to prove a direct link between the misrepresentation and the loss. The misrepresentation itself is enough.

The cleanup approach is direct. If a question asks about MFA on all admin accounts and you have a gap, declare the gap and include a remediation date. Carriers reward honest gaps with a plan more than they reward polished answers that don't survive forensic review.

Checking “no” or “in progress” on the form may raise your premium or tighten your coverage terms. That cost is predictable. Misrepresentation discovered after a claim can void the policy entirely, and the timing means you absorb the full incident cost yourself.

## **The 30-day pre-renewal checklist**

Work through this in order. Most items are achievable in a month if you start now.

**Week 1.** Confirm MFA on email, VPN, remote desktop, all administrator accounts, and any service accounts that support it. Move admin MFA off SMS to an authenticator app or hardware token.

**Weeks 1 to 2.** Verify your backups are immutable or air-gapped. Run a test restore, and document the result with date and screenshots.

**Week 2**. Write a one-page wire transfer policy requiring callback verification to a previously verified phone number for any transfer over your chosen threshold. Get it signed by anyone who can authorize payments.

**Weeks 2 to 3.** Confirm EDR is deployed on every endpoint and server. If you only have traditional antivirus, get quotes for EDR or MDR now so you can answer with a deployment timeline.

**Week 3.** Identify your top five software vendors and request SOC 2 reports or equivalent attestations. Note who responded.

**Weeks 3 to 4.** Document or update your incident response plan, then run a 60-minute tabletop exercise with your leadership team. Keep the notes. That's your “tested in the past 12 months” evidence.

**Week 4.** Sit down with the application and answer honestly. Flag anything you couldn't fix, with a specific remediation date.

## **Take the Next Step Today!**

Businesses across Fort Mitchell, Florence, Covington, Newport, Erlanger, Independence, and the rest of Northern Kentucky are facing more detailed cyber insurance requirements than ever before. At [Simple IT](www.simple-it.us), we help businesses [strengthen Microsoft 365 security, ransomware protection, email security, data backup and recovery, and business continuity planning](https://simple-it.us/our-services) so they're better prepared for today's insurer expectations.

Not sure if your business is ready for its next cyber insurance renewal? [Schedule a free IT assessment](https://simple-it.us/#contact) with Simple IT by calling **859-449-7878**, emailing [info@simple-it.us](mailto:info@simple-it.us), or register online at https://simple-it.us. We'll help you identify potential gaps before you submit your renewal application.

###### ***\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\__***

###### ***Article used with permission from [The Technology Press](mailto:info@simple-it.us).***
