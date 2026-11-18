# Releasing Kraft UI

Package: `@randalvance/kraft-ui`. Repository: `randalvance/kraft-ui`. License: MIT.

## Repository setup

GitHub Pages is configured for Actions deployment. The `npm` environment requires approval from `randalvance` and permits only `main`. Actions may create release pull requests. npm trusted-publisher registration remains a maintainer setup step.

## One-time setup

1. Confirm ownership and publishing access to the `@randalvance` npm scope. Bootstrap the package on npm if required; the repository does not publish its placeholder `0.0.0` version.
2. Register an npm trusted publisher for GitHub Actions: owner `randalvance`, repository `kraft-ui`, workflow filename `publish.yml`, environment `npm`, with publishing allowed. The identity must match exactly. npm uses OIDC and automatically attaches provenance; the job needs `id-token: write`. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
3. Create the GitHub environment `npm`, restrict deployment to `main`, and add required reviewers to enforce release approval.
4. Enable GitHub Actions to create pull requests in repository Actions settings; the Changesets job uses `GITHUB_TOKEN` to prepare version PRs.
5. In repository Pages settings, select **GitHub Actions** as the deployment source. The validation workflow uploads and deploys Storybook only after checks pass on `main`.

No long-lived npm token is required by the publishing workflow. Node 24 includes a sufficiently recent npm CLI for trusted publishing (npm 11.5.1 or newer).

## Release process

1. Add a Changeset with `npm run changeset` for each consumer-facing change.
2. Merge the implementation. The Prepare release workflow opens or updates a version PR with package version and changelog changes.
3. Review and merge the version PR after validation passes. When `package.json` changes on `main`, **Publish** compares the old and new package versions. A version change starts packaging for that commit.
4. Approve the `npm` deployment after the tarball job passes. The publishing job downloads that run’s verified tarball and sends it to npm with OIDC and provenance.

The workflow checks the package version, runs `npm run check`, packs the build, and installs the tarball in separate React 18 and 19 projects. The smoke test checks TypeScript declarations, server rendering, and the CSS and token exports. The workflow also runs npm’s publish preflight for new versions and uploads the tarball.

For a manual dry run, dispatch **Publish** on any branch with its exact `package.json` version and leave `dry_run` enabled. Download the verified tarball from the `npm-package` artifact. For manual publishing, dispatch **Publish** on `main` with its exact version and disable `dry_run`, then approve the `npm` deployment.

For the first release, use a successful `main` dry run to obtain the verified tarball. If the package does not exist on npm yet, publish that tarball from an authenticated maintainer session with 2FA, then register the trusted publisher for later releases. The placeholder `0.0.0` is reserved for dry runs.

A failed publish can be retried after resolving its cause. npm versions are immutable. If the version is already published, verify it on the registry.
