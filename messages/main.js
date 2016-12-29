
module.exports = {
    default: {
        UndefinedLocalizationLabel: 'Missing label %s:%s for locale %s.',
        JsonParseError: 'Parse error in file %s on line %s\n%s\n',
        MissingRequiredParameter: 'A required parameter [%s] is missing.',
        LoggerNameRequired: 'A logger name is required',

        PermissionSetNotFoundError: 'Permission Set %s not found'

    },
    workspace: {
        MissingAppConfig : 'The current project is invalid. workspace-config.json is missing.',
        InvalidProjectWorkspace: 'This directory does not contain a valid project workspace.',
        InvalidOAuthRedirectUrlPort: 'Invalid OAuth redirect port number defined: %s'

    },
    api: {
            QueryError: 'An error occurred while querying %s'
    },
    org: {
        OrgNotFound: 'No org configuration found for name %s',
        DefaultOrgNotFound: 'No default %s org name found',
        InvalidUsernameOnOrg: 'Error saving %s\'s org config to %s\'s org config file',
        ProblemSettingOrgPrefs: 'An error occurred while setting org preferences'
    },
    keyChain: {
        ServiceRequired: 'A service is required',
        AccountRequired: 'An account is required',
        PasswordRequired: 'A password is required',
        PasswordNotFound: 'Could not find password',
        RetryForGetPasswordError: 'Failed to get the password after %s reties.',
        UserCanceled: 'User canceled authentication',
        SetCredentialParseError: 'A parse error occurred while setting a credential',
        CredentialError: '%s - %s'
    }
};
