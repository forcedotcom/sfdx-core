# UnsupportedSnapshotOrgCreateOptionsError

Org snapshots don’t support one or more options you specified: %s.

# SourceStatusResetFailureError

Successfully created org with ID: %s and name: %s. Unfortunately, source tracking isn’t working as expected. If you run force:source:status, the results may be incorrect. Try again by creating another scratch org.

# DurationDaysValidationMinError

Expected 'durationDays' greater than or equal to %s but received %s.

# DurationDaysValidationMaxError

Expected 'durationDays' less than or equal to %s but received %s.

# DurationDaysNotIntError

Expected 'durationDays' to be an integer number.

# RetryNotIntError

Expected 'retry' to be an integer number.

# WaitValidationMaxError

Expected 'wait' greater than or equal to %s but received %s.

# NoScratchOrgInfoError

No ScratchOrgInfo was found. Check that the ID and the DevHub are correct

# ScratchOrgDeletedError

That scratch org has been deleted, so you can't connect to it anymore.

# StillInProgressError

The scratch org is not ready yet (Status = %)

# action.StillInProgress

Wait and try the <%= config.bin %> <%= command.id %> command again
