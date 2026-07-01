---
title: "Small Business Ransomware Protection: How Attacks Work and How to
  Prevent Them"
date: 2026-06-30
author: Brad Hodge
draft: false
featuredImage: https://res.cloudinary.com/dygso04l2/image/upload/v1782747968/ChatGPT_Image_Jun_29_2026_11_40_30_PM_siystk.png
featuredImageAlt: Computer displaying a ransomware attack on a small business
  with encrypted files and cybersecurity threat warning
categories:
  - Cybersecurity
seoTitle: How Small Businesses in NKY Can Prevent Ransomware Attacks
metaDescription: See how ransomware actually targets small businesses in
  Northern Kentucky, and the Microsoft 365 security controls that prevent
  ransomware before it begins.
focusKeyphrase: Small Business Ransomware Protection NKY
ogTitle: Don't Wait Until Ransomware Hits Your Business | Simple IT
ogDescription: Would your business be ready if ransomware struck tomorrow? See
  how these attacks happen and the cybersecurity steps that can help protect
  your data.
---
Most small business owners assume hackers are after bigger targets. Unfortunately, they're not! An 8-person company has enough revenue and connections to be worth attacking, no dedicated security team to slow anyone down, and a public footprint that takes about an hour or less to map. You're not too small to target... you're a perfectly vulnerable target, and that makes you just the right size.

What follows is a step-by-step walkthrough of how a small business gets attacked, written from the attacker's side. The company in this account is composite, but the methods are accurate to current threat intelligence reporting. After the walkthrough, you'll see five specific points where the attack would have been stopped by controls that come bundled with security tools most small businesses already pay for.

## **Monday: How I picked you**

I work regular hours and run a small volume operation. My spreadsheet has about 40 prospects per month, and I prefer businesses between 10 and 50 staff. The reason for that range is economics. Large enterprises have security teams, incident response contracts, and lawyers who make recovery expensive on my end. At the other end of the scale, sole traders rarely have enough at stake to bother with. A 22-person commercial services company sits in the right zone: payroll, customer database, project files, supplier relationships, and an owner who will pay to get the lot back. The return per hour is better at this size than at either extreme.

I did not find you through a breach or a tip. I found you on a public business records portal. State business registries, federal contract awards, and county-level licensing databases publish enough detail for me to identify your company, look up your name, estimate your revenue, and pick the most useful person inside the business. One search told me your company name, your registered agent, the contract value of a recent municipal job, and the named contact on the submission.

The fact that nothing has gone wrong at your company yet is the strongest signal I get. It tells me your credentials are probably still valid, your staff has not been trained to spot anything, and nobody has had a reason to change a password. A clean record is the first indicator I look for.

## **Tuesday: Building your org chart for free**

I spend about 40 minutes researching your company today using only a browser.

LinkedIn gives me eight of your current employees with their job titles listed. Your office manager has been there for six years and lists “accounts payable, payroll, and supplier invoicing” in her profile summary. Your second admin joined 14 months ago. You list yourself as director, with a sparse profile and a low connection count, which tells me you are unlikely to notice when someone unusual starts engaging with your profile or your company's social media.

Public business filings confirm your registered business name and your full legal name. A “meet the team” post from two years ago on your Facebook page lists first names and photos, including someone described as helping out in the office a couple of days a week. One of the commenters shares your surname.

I now know who handles your money, what their name is, how long they have been there, what software they probably use (I will check your job ads on Indeed for the phrase “experience with QuickBooks or Sage”), and who in your business has the authority to approve a payment without a second signature.

That last person is my primary target. You are harder to reach and probably more cautious. Your office manager has system access, handles supplier payments, and is busy enough that one more email in her inbox does not get scrutinized the way it might if she had nothing else to do.

I have not spent a dollar yet.

## **Wednesday: I bought your credentials for $14**

Stealer logs are credential packages harvested by infostealer malware that infected someone's personal device, often months or years earlier. The malware records every username and password typed into the machine, then bundles the data for sale. Marketplaces on Telegram channels and forums let buyers search these logs by company email domain.

I search for your company's email domain. Two results come back. One is your office manager's work email, with a password that looks like it was saved in her browser. The other is a personal Gmail address that appears to belong to a family member of yours, probably from a device that shared a home network.

I pay $14 for the package. It takes four minutes.

Your office manager's password follows a common pattern: a pet or child's name combined with a year and an exclamation mark. I check it against HaveIBeenPwned, which is the same free database security professionals use, and find that it appeared in a credential dump from a retail loyalty program breach three years earlier. The password has not been changed since.

Your family member's credentials are more interesting than they look at first. The same password, with minor variations, shows up across a streaming service, a gaming account, and your company's Microsoft 365 login. The password works. The only thing standing between me and the inbox is the second factor.

Total spend so far: $14.

## **Thursday: Getting past your MFA**

Multi-factor authentication stops a lot of attacks, but the implementation matters more than the checkbox.

Simple push-notification fatigue does not work against your office manager's account. Microsoft enabled[ number matching](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-number-match) by default for all Microsoft Authenticator push notifications in May 2023, which means she would have to type a code from her login screen rather than just tap approve. Push bombing fails against that configuration.

What still works is adversary-in-the-middle (AiTM) phishing. I send your office manager an email designed to look like a routine Microsoft 365 password reset notification, citing the breach that her password appeared in (the same breach I found her credentials in earlier in the week). The link in the email takes her to a page that mirrors the real Microsoft sign-in screen. That page is a proxy I control.

When she enters her password and approves her MFA prompt, my proxy forwards both to the real Microsoft login server. Microsoft validates the credentials, completes the MFA challenge, and issues a session token back to my proxy. I capture the token. She sees a normal login experience on what she thinks is the real Microsoft site, then a “password updated successfully” message.

I am now signed in as her. The MFA prompt succeeded, and the session token sits in my browser instead of hers. Microsoft sees a valid authenticated session and treats my activity as legitimate.

I had a backup plan in case the email did not get clicked. Earlier in the day, I called your office posing as your IT support company, using a name I found in a Google review you had left 18 months earlier. I told your receptionist that we were seeing unusual login activity on the office manager's account and that I would need her to approve a verification push in the next few minutes. She said the office manager was not at her desk. I said no problem, I would try again later. The call cost me nothing.

By Thursday night, I am inside your office manager's Microsoft 365 account. I set up an inbox forwarding rule so her emails copy to an address I control without notifying her, then I wait.

## **Friday 2:47pm: Why I waited 36 hours before encrypting**

I spend 36 hours reading email before I encrypt anything. That dwell time is how I size the ransom correctly.

In those 36 hours, I find your cyber insurance policy attached to an email from your broker, with a cyber liability sub-limit of $250,000. A bank reconciliation your office manager sent you two weeks ago shows your business account at around $180,000 at month end. Your customer list sits in a quote template she emailed to herself, and a message thread with a municipal project manager mentions a job starting in three weeks with a hard deadline you cannot afford to miss.

I set my ransom at $65,000 in cryptocurrency. That figure is low enough that you will pay rather than fight it, high enough that it is worth my time, and well within what I know you can access. Ransoms set above 10 percent of visible liquid assets tend to get contested. The figure I picked sits below that line.

I deploy the encryption payload at 2:47pm on Friday. The timing is deliberate. Your bookkeeper finishes at 3pm on Fridays, which I know from an out-of-office reply I saw in the forwarded emails. You are on a job site, with your calendar synced to the shared inbox. The person most likely to notice something wrong and call for help is already gone, and the person with the authority to make decisions is unreachable.

By the time anyone understands what has happened, it is a Friday evening, every file on your shared drive is encrypted, and a ransom note sits on every screen in your office.

Total cost to me: $14 for credentials and about six hours of work spread across the week.

## **Five places this attack would have died**

The attack on your business worked because five ordinary things were not in place. None of them were expensive.

### **1. The credential purchase on Wednesday.**

[HaveIBeenPwned](https://haveibeenpwned.com/) is free. Microsoft Entra password protection can detect and block reused or commonly-compromised passwords across your accounts. Enforcing unique passwords per account, through a password manager and through Entra's policies, makes a stolen credential purchase useless for me.

### **2. The MFA bypass on Thursday night.**

Microsoft already blocks the simpler push-bombing attack, because[ number matching](https://learn.microsoft.com/en-us/entra/identity/authentication/how-to-mfa-number-match) has been enabled by default for all Microsoft Authenticator push notifications since May 2023. The current dominant credential-based bypass is adversary-in-the-middle phishing. The fix here is stronger MFA — think hardware security keys or Windows Hello — combined with a policy that only allows trusted devices to log in. Your IT provider can set this up using tools already included in Microsoft 365. Any one of these would have either prevented the session token capture or made the captured token unusable from my IP address.

### **3. The inbox forwarding rule.**

Microsoft 365 allows admins to[ block external email forwarding rules](https://learn.microsoft.com/en-us/defender-office-365/outbound-spam-policies-external-email-forwarding) at the tenant level. With that block in place, the inbox forwarding rule I used to read 36 hours of email would not have worked. I might have encrypted anyway, but I would have been guessing on the ransom size.

### **4. The 36-hour dwell time.**

Microsoft Defender for Business, included in Microsoft 365 Business Premium, generates an alert when a new inbox forwarding rule is created. If anyone had been watching those alerts, or if the alerts had been routed somewhere visible, I would have been detected on Thursday night. The improvement often comes from someone actually reviewing the alerts your existing tools are already generating.

### **5. The public business records.**

You cannot unpublish a state contracting registry or a federal contract award. That data will stay public. What you can control is what your team chooses to post about their specific responsibilities. Your office manager's LinkedIn profile listed her financial responsibilities in enough detail to make her the obvious target. That detail is worth a conversation with your team, framed as practical security awareness rather than a rule about what people can post.

## **Three questions to send your IT provider**

Next time you talk to your IT provider, these three questions are worth asking. The answers should already be yes, but if they're not, that's definitely worth knowing now.

1. Are we using phishing-resistant MFA (FIDO2 keys, passkeys, or Windows Hello for Business) for finance, admin, and executive logins?
2. Is external email forwarding blocked at the tenant level?
3. Are our security alerts going somewhere, and is someone reviewing them?

This isn't a hypothetical for Northern Kentucky and Southern Ohio businesses. We see versions just like this play out across Cincinnati, Blue Ash, Florence, Covington, Newport, Erlanger, and Independence. And it doesn't target one type of business more than another either.  Accounting firms, contractors, manufacturers, healthcare offices, and non-profits are all in the same crosshairs. The businesses that avoid it aren't lucky, rather they have the right protections in-place to show ransomware attackers that they wouldn't be an easy target.

## Take the Next Step Today!

Concerned about how your business would respond to a ransomware attack? At **[Simple IT](www.simple-it.us)**, we help Northern Kentucky businesses strengthen ransomware protection, Microsoft 365 security, and email security with a security-first approach.

Ready to find out where your business stands? Schedule a free IT assessment with Simple IT by calling our Tech Support Team at **859-449-7878**, email us at **[info@simple-it.us](mailto:info@simple-it.us)**, or register online at **[https://simple-it.us](https://simple-it.us/#contact)** ... we'll be ready when you are!

###### *\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\__*

###### *Article used with permission from [The Technology Press](https://thetechnologypress.com/what-immutable-backup-means-on-your-cyber-insurance-form/).*
