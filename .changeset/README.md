# Changesets

Hello! This folder contains changesets for managing versions and releases.

## What is a changeset?

A changeset is a piece of information about changes made in a branch or commit. It holds three key bits of information:

1. What packages need to be released
2. What version they should be released at (major, minor, patch)
3. A changelog entry for the released packages

## When should I add a changeset?

Add a changeset when you make changes that affect the public API or user experience:

- New features (minor)
- Bug fixes (patch)
- Breaking changes (major)
- Documentation updates (patch)
- Performance improvements (patch)

## How do I add a changeset?

Run this command from the root of the repo:

```bash
npm run changeset
```

This will ask you:

1. **Which packages should be bumped?**

   - Select `@jjuidev/node-devtools`

2. **What type of change is this?**

   - `major` - Breaking changes (users need to update their code)
   - `minor` - New features (backwards compatible)
   - `patch` - Bug fixes and minor improvements

3. **Write a summary**
   - Describe what changed in plain language
   - This will appear in the CHANGELOG

## Example Changesets

### Adding a new feature

```bash
npm run changeset
# Select: @jjuidev/node-devtools
# Type: minor
# Summary: "Added support for Biome linter"
```

### Fixing a bug

```bash
npm run changeset
# Select: @jjuidev/node-devtools
# Type: patch
# Summary: "Fixed package manager detection on Windows"
```

### Breaking change

```bash
npm run changeset
# Select: @jjuidev/node-devtools
# Type: major
# Summary: "Changed CLI command structure - 'setup' is now 'init'"
```

## Publishing Flow

1. Make changes and create changeset

   ```bash
   npm run changeset
   ```

2. Update versions and CHANGELOG

   ```bash
   npm run version
   ```

3. Publish to npm
   ```bash
   npm run release
   ```

## Tips

- Create one changeset per logical change
- Write clear, user-focused summaries
- Don't create changesets for internal changes (refactors, tests)
- Commit changesets with your code changes

## Official Documentation

Find the full documentation at [changesets repository](https://github.com/changesets/changesets)
