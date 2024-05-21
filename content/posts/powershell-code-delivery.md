---
title: "Powershell Code Delivery"
date: 2023-07-18T09:23:57-05:00
author: ["Matthew Weir"]
draft: true
featured_image: "posts/images/delivery.webp"
tags: ["powershell", "windows", "scripting", "IT"]
---

In todays blog we're going to dive into the realm of delivering and managing Powershell code. The IT sector has often overlooked the standards for code management and delivery that the developer community has established, opting instead for outdated methodologies. These practices are not only challenging to manage, but also prove ineffective in most modern situations. Worse, these methods leave room for exploit via local code storage. We're going to get into what some of those antiquated methods look like that you may be using, why they're "bad", then present scalable and easier to manage solutions, and talk through how to implement these practices in your organization.

## Lets get into it: Stop storing code locally, use Github
This entire solution we're going to discuss today revolves around managing and delivering all code through Github repositories...and by all code, I mean literally ALL CODE. This takes some restructuring and a new way of thinking about script / code delivery. All delivery mechanisms I list below are designed for you to store all of your code locally on that system, and in turn in various ways the endpoints it's delivered to stores that code locally. Local code storage is a terrible idea not only for security, but for management later. Lets go through some scenarios of how locally storing code can kill your organization.

- #### Areas of concern
	- Powershell Delivery & Management
	- Code Creation & Change Review
	- Security

- ####  Traditional delivery methods
	- GPOs
	- Scheduled Tasks (sometimes also by GPO)
	- SCCM
	- Remote Powershell on local network
	- Intune
	- RMM

- #### Scenario
	- You write a powershell script and deploy it via one of the methods above set to deploy once every two weeks. Lets say this is a disk cleanup script and the save destination on local disk is `C:\IT\diskCleanup.ps1`.

### Delivery & Management
- **The Problem**
	- When you create a script in any of the above platforms, that script lives in that tool. Using the scenario above, you later decide you need to edit the script. You make your edits, test them, then update your script in your selected platform. About a week in, you notice a folder is being deleted that was unexpected. Luckily, this script only runs once every two weeks so it hasn't effected all endpoints yet, but if you don't stop it soon you could have a real problem on your hands. You open the script to revert it to the previous version but...oh no, your script has been overwritten with the changes! There's no revision control and there's no backups of single scripts, so you find yourself scrambling to find the previous version of the script that worked properly without rewriting it yet again and risking another mistake. While searching for an old version, you check back and find someone else has already updated the script and removed the lines of code they thought was causing the issue...but somehow they've made it worse and now it's deleting several folders. You stop the script all together...but you get reports that your previous version is still running on some machines, how?! Well it turns out most of these platforms store that script locally in some capacity, and there's a delay from change to propagation at the endpoint (varies by platform).
- **The Fix**
	- Lets rewind that story, and this time instead of our script being stored in one of those platforms above, we put the actual code in Github, and only use the platform to call that script from Github.
	- First, we would put our disk cleanup script in Github, then we would call that disk cleanup script from the delivery method we chose from above by only putting the below code in that delivery platform:

```Powershell
Function Get-GithubScript {
  <#
  .DESCRIPTION
    This will call the remote script you specify and launch the script in memory.
  #>
  [CmdletBinding()]
    Param(
        [Parameter(
            Mandatory = $true,
            HelpMessage = "Enter a read-only API key to your Git repo"
        )]
        $apiKey,
        [Parameter(
            Mandatory = $true,
            HelpMessage = "Enter the raw git script URL such as https://raw.githubusercontent.com/[yourorg]/script.ps1"
        )]
        $scriptUrl
    )

  [Net.ServicePointManager]::SecurityProtocol = [Enum]::ToObject([Net.SecurityProtocolType], 3072)
  $WebClient = New-Object -TypeName System.Net.WebClient
  $WebClient.Headers.Add('Authorization','token $apiKey')
  $WebClient.Headers.Add('Accept','application/vnd.github.v3.raw')
  ($WebClient).DownloadString('$scriptURL') | iex;
}
Get-GithubScript -apiKey 'xxxxx-xxxxxxxxxxxx' -scriptUrl 'https://raw.githubusercontent.com/[yourorg]/script.ps1'
```

	- Okay, so now the script is in Github, and we're calling it to the endpoint with the above code snippet, great! Lets go through the scenario again.
	- You make your edits, test them, then update your script in your selected platform. About a week in, you notice a folder is being deleted that was unexpected. This time, we head to Github and we can see all previous revisions of the script, when it was changed, exactly what was changed, and we can revert back to any one of these points. You opt to revert it back to a previous version. While you're doing this, you get a Pull Request from another tech-- it looks like they're trying to revert changes too. Github allows you to require review/approval before changes to production branches so no one can make quick rogue changes without your approval. Furthermore, the changes, once promoted to production (main branch) take effect immediately to all endpoints. Even if the script was being stored locally, the script is just calling our `https://raw.githubusercontent.com/[yourorg]/script.ps1` script so boom, update Github, instant update all future runs of our script.

### Security
- **Execution**
	  To ensure this script runs without errors or issues, the delivery method you use either executes this script on demand through an agent or maybe a scheduled task or startup item. Traditionally, to ensure these scripts execute without issue, these scripts would be launched as `System` context which is "God mode" on that endpoint. `System` execution context is not only admin, but it's admin without concern of UAC since UAC is `User Access Control` and `System` isn't a user-- it's literally the machine as the identity.
- **Exploit**
	  A bad actor gains access to your machine. They just have standard user rights but are looking for a way in to an elevated account or context. They find a scheduled task to execute a script in `C:\IT\diskCleanup.ps1` that runs on every system reboot. They go find the script, edit the script and add lines to create a new hidden local admin user, then they either trigger the scheduled task, or just wait for the next scheduled execution. Note that here the only permissions they needed was access to make edits in the folder the script lives in. They would have needed admin to edit scheduled tasks, they would have needed admin to get by UAC, and they of course would have needed admin to gain an elevated shell. Thanks to your local code storage however, they were able to edit a powershell script on disk and use your own maintenance schedule against you to execute whatever they needed as `System`.

### Recap
All of this means whether that script was in a scheduled task, a GPO, an RMM, Intune, whatever it doesn't matter, updating Github with new changes automatically makes that new version the production execution for all endpoints without ever touching any of those platforms. Even better, the script never hits disk-- it executes in memory, so a would-be attacker has no way to just edit a text file the way we outlined above.

Don't forget, when we factor in that no one can make production changes in code without a formal code review and approval process, and even if they do we have a log of all changes with dates for forever, we've taken our code game from amateur hour to a modern well oiled machine designed to scale.

Whoever is writing code for your organization has a massive amount of risk and responsibility on their shoulders, and this risk/responsibility is often over looked and/or under estimated due to lack of understanding from leadership, or just lack of knowledge on better ways to safeguard this power and risk. This kind of structure we've outlined today isn't just important, it's required, and I would go as far as to say it's irresponsible to continue without changing your code storage to Github.

Stay tuned for more blogs on Github best practices!
