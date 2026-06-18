---
title: "Immutable Backups and Cyber Insurance: What No One Explains Clearly"
date: 2026-06-19
author: Brad Hodge
draft: true
categories:
  - Cybersecurity
seoTitle: What Is an Immutable Backup? A Practical Guide for NKY Businesses
---
Cyber insurance applications include a question that catches a lot of small business owners off guard: “Do you maintain immutable, air-gapped, or offline backups of your critical business data?”

Carriers added that question to renewal forms because ransomware operators worked out that the fastest way to force a payout is to wipe the backups first and encrypt everything else after. CISA, the FBI, and the Internet Crime Complaint Center have all documented this pattern as one of the most common moves in current ransomware playbooks. A business whose backup copies can be deleted using the same admin credentials an attacker just stole has no recovery path other than paying the ransom.

This post covers what immutable backup means, three common backup setups that do not qualify, the questions to send your IT provider before you sign the form, and what to do if your honest answer is no.

## **Immutable backup, defined**

An immutable backup is one that cannot be modified or deleted for a fixed period of time, including by you, by your IT provider, and by anyone using stolen admin credentials.

The stolen credentials piece is what carriers care about. Most backup systems can be wiped by anyone with admin access. Immutability means the backup platform itself enforces the lock at the storage layer, and no credentials, however privileged, can override it during the retention window. Some platforms call this object lock, write-once-read-many, or WORM storage. The terminology varies between vendors, but the underlying control is the sam.

## **Three common backup setups that do not qualify**

Three setups come up regularly that don't satisfy the immutability question, even though business owners often assume they do.

### **1. A NAS or external drive in your office**

A network-attached storage device sitting in your server room is reachable from your network by design. If ransomware spreads across your environment, it can reach the NAS. An attacker with domain admin credentials can wipe what's on it. An external drive that someone plugs in once a week and leaves connected has the same exposure.

These devices have a role in a broader backup strategy. On their own, they do not satisfy the immutability question.

### **2. Microsoft 365 retention treated as a backup**

Microsoft 365 includes data retention features, and some businesses use them as their backup solution. They are not a backup in the sense the form is asking about. An attacker with global admin access to your tenant can delete data and purge retention holds.

Under[ Microsoft's shared responsibility model](https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility), customers retain responsibility for backup and protection of their own data, separate from what Microsoft provides at the platform level.

If your only protection for Microsoft 365 data is what Microsoft provides natively, the honest answer to the immutability question is no..

### **3. A cloud backup with immutability switched off**

This is the most common gap. Many reputable backup platforms include immutability as a feature, but the setting is not always enabled by default. The capability exists, and someone needs to turn it on. Your business may be paying for a backup solution that looks credible on paper while the immutability toggle sits in the off position. You cannot tell from the outside without checking.

## **Three questions to send your IT provider before you sign the form**

Copy these into an email and send them before you check the box.

* **Question one:** “Are our backups immutable, and if so, how long is the immutability window?”

Carrier guidance has tightened in the past two years. Most insurers want a window of at least 14 days as a floor, with 30 days increasingly cited as the preferred minimum. Attackers sometimes sit in a network for weeks before triggering ransomware, which means a backup from yesterday may already be compromised. The window needs to be long enough to give you clean restore points from before the attacker arrived.

* **Question two:** “If our domain admin account or Microsoft 365 global admin account were stolen tomorrow, could that account be used to delete our backups?”

The correct answer is no. If the answer is yes, or if your provider is not sure, your backups are not immutable in the way the form means.

* **Question three:** “Can you send me a screenshot or vendor documentation showing that immutability is enabled on our account?”

A provider who can send something concrete has done the work. If they come back with verbal reassurance and nothing to show, treat that as a no until they can demonstrate otherwise.

## **What a qualifying setup looks like**

For your backup to honestly satisfy the question on the form, a few things need to be true at the same time.

The backup platform needs immutability turned on, not only available as a feature. Several major vendors including Veeam, Datto, Rubrik, and Acronis offer the capability, along with most cloud storage providers that support S3-compatible object lock. A vendor name on the invoice does not, by itself, answer the question. The setting has to be turned on, scoped properly, and tied to credentials that aren't shared with the rest of your environment.

The backup credentials need to sit outside your regular administrative accounts. If the same login that manages your Microsoft 365 environment also controls your backup platform, a compromised admin account can reach both. A qualifying setup uses isolated credentials outside your day-to-day identity environment.

The retention window needs to be long enough. A 24-hour backup that overwrites itself daily does not help if an attacker has been in your environment for a week. CISA's[\#StopRansomware Guide](https://www.cisa.gov/stopransomware/ransomware-guide) lists immutable, tested backups as a baseline control, and most insurers now align with that position.

Restores also need to be tested. A backup nobody has tried to restore in the past 12 months is not something you can rely on when it matters. Most carriers now ask for the date of your last successful restore test, and they want to see one.

## **What to do if your honest answer is no**

Declare what you have on the form, and use the renewal process as the reason to fix what isn't there.

The first step is to ask your IT provider whether immutability can be enabled on your existing platform. In many cases the platform already supports it, and turning it on is a configuration change rather than a new product purchase. If the platform supports it and nobody has switched it on, that conversation can usually be resolved in a few days.

If your provider does not know what you're asking, or cannot give a clear answer to the three questions above, that response is itself important information. This area needs attention before your next renewal date, even if other parts of your IT setup are handled well.

One thing to avoid: do not check yes on the form to dodge a premium hike. Cyber insurance applications function as warranty documents. If a forensic investigation after a claim finds your backups did not match what you declared, the carrier can rescind the policy. Coverage is then treated as if it never existed, and any prior payouts under the same policy term can be clawed back. Misrepresentation discovered after a claim is one of the most expensive mistakes a small business can make on an insurance form.

Checking no on the form will likely cost you something at renewal, either in premium or in coverage terms. That's a known cost, and it's manageable. Take the hit on the application, and use the months between now and your next renewal to close the gap.
