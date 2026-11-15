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
3. Review and merge the version PR. Allow validation to pass.
4. Manually run **Publish** on `main`, entering the exact version in `package.json`.
5. Approve deployment to the `npm` environment. The workflow checks identity/version, runs all checks, inspects package contents, and publishes using OIDC.

The first publication is deliberately separate from repository initialization. Merging setup code cannot publish the placeholder version. If npm requires an existing package before configuring trust, make the initial approved publication from an authenticated maintainer session, then register the trusted publisher for later releases.

A failed publish can be retried after resolving its cause. npm versions are immutable: if the version is already published, verify it rather than attempting to replace it.
