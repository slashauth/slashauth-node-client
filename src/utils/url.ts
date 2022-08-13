export const getBaseURL = (
  clientID: string,
  organizationID?: string
): string => {
  if (organizationID) {
    return `/s/${clientID}/organizations/${organizationID}`;
  } else {
    return `/s/${clientID}`;
  }
};
