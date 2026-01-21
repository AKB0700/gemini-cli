# Reporting Security Issues

To report a security issue, please use [https://g.co/vulnz](https://g.co/vulnz).
We use g.co/vulnz for our intake, and do coordination and disclosure here on
GitHub (including using GitHub Security Advisory). The Google Security Team will
respond within 5 working days of your report on g.co/vulnz.

[GitHub Security Advisory]:
  https://github.com/google-gemini/gemini-cli/security/advisories

# Verifying Release Authenticity

To ensure the authenticity and integrity of Gemini CLI releases, maintainers may
sign releases with GPG keys.

## GPG Public Keys

The public GPG keys of Gemini CLI maintainers are available in the [KEYS](KEYS)
file at the root of this repository. You can import these keys to verify
signatures on official releases.

## How to Verify a Release

If a release includes a GPG signature:

1. **Import the maintainer keys:**

   ```bash
   curl -s https://raw.githubusercontent.com/google-gemini/gemini-cli/main/KEYS | gpg --import
   ```

2. **Download the release and its signature** (if provided)

3. **Verify the signature:**

   ```bash
   gpg --verify <signature-file> <release-file>
   ```

4. **Check the output** to ensure the signature is valid and from a trusted
   maintainer

For more information, see the [KEYS](KEYS) file.
