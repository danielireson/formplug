const VALID_WEBSITE_PROTOCOLS = new Set(["http:", "https:"]);

module.exports.isWebsite = (string) => {
  try {
    const parsed = new URL(string);
    return VALID_WEBSITE_PROTOCOLS.has(parsed.protocol);
  } catch (e) {
    // Keeping the regex validation as a fallback to avoid a
    // backwards-incompatible behavior change for incomplete URLs
    return /[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(
      string
    );
  }
};

module.exports.isEmail = (string) => {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    string
  );
};
