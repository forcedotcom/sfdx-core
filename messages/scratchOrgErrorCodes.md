# SignupFailedError

The request to create a scratch org failed with error code: %s.

# SignupFailedUnknownError

An unknown server error occurred. Please try again. If you still see this error, contact Salesforce support for assistance. Include the information from 'sfdx force:data:record:get -s ScratchOrgInfo -i %s -u %s'.

# SignupFailedActionError

See https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_scratch_orgs_error_codes.htm for information on error code %s.

# SignupUnexpectedError

The request to create a scratch org returned an unexpected status

# StillInProgressError

The scratch org is not ready yet (Status = %s).

# action.StillInProgress

Wait for a few minutes, and then try the command again

# NoScratchOrgInfoError

No ScratchOrgInfo object found in the Dev Hub you specified. Check that the ID and the Dev Hub are correct.

# ScratchOrgDeletedError

That scratch org has been deleted, so you can't connect to it anymore.

# INVALID_ID_FIELD

Provide a valid template ID, in the format 0TTxxxxxxxxxxxx.

# T-0002

We couldn’t find a template or snapshot with the ID or name specified in the scratch org definition. If you’re sure the ID is correct, contact Salesforce Support.

# T-0003

The template specified in the scratch org definition is unapproved. Contact Salesforce Support to request template approval.

# T-0004

The Trialforce Source Organization (TSO) for the template doesn’t exist or has expired.

# S-1006

Provide a valid email address in your scratch org definition or your %s file.

# S-2006

Provide a valid country code in your scratch org definition or your %s file.

# S-1017

Specify a namespace that’s used by a release org associated with your Dev Hub org.

# S-1018

Provide a valid My Domain value. This value can’t include double hyphens, end in a hyphen, include restricted words, or be more than 40 characters long.

# S-1019

The My Domain value you chose is already in use.

# S-1026

Provide a valid namespace value. This value must begin with a letter. It can’t include consecutive underscores, end in an underscore, be more than 15 characters long, or be a restricted or reserved namespace. Only alphanumeric characters and underscores are allowed.

# S-9999

A fatal signup error occurred. Please try again. If you still see this error, contact Salesforce Support for assistance.

# SH-0001

Can’t create scratch org. Contact the source org admin to add your Dev Hub org ID to Setup > Org Shape. Then try again.

# SH-0002

Can’t create scratch org. No org shape exists for the specified sourceOrg. Create an org shape and try again.

# SH-0003

Can’t create scratch org from org shape. The org shape version is outdated. Recreate the org shape and try again.

# C-1007

The username provided to the org:create command is already in use. Run 'force:org:list --clean' to remove stale org authentications or create the org with a different username.

# C-1015

We encountered a problem while registering your My Domain value with the DNS provider. Please try again.

# C-1016

We encountered a problem while attempting to configure and approve the Connected App for your org. Verify the Connected App configuration with your Salesforce admin.

# C-1017

Provide a valid namespace prefix. This value must begin with a letter. It can’t include consecutive underscores, end in an underscore, be more than 15 characters long, or be a restricted or reserved namespace. Only alphanumeric characters and underscores are allowed.

# C-1020

We couldn't find a template with the ID specified in the scratch org definition. If you’re sure the ID is correct, contact Salesforce Support.

# C-1027

The template specified in the Scratch Definition isn’t supported. Specify a generic edition (such as Developer or Enterprise), or specify a template ID.

# C-9999

A fatal signup error occurred. Please try again. If you still see this error, contact Salesforce Support for assistance
