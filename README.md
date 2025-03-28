# CS 160 Playwright autograder base

There's a lot of nesting going on here, and a few ways to run the autograder.

You can:

- run the autograder Docker image just like you're in Gradescope, using `harness/run.sh`. This will output the Gradescope-formatted `results.json` to a directory on your host machine, but you'll also get an error saying the container couldn't upload results to Gradescope (since you don't have the right token).
- run the autograder locally on your host machine, without Docker, with `autograder/run-playwright-dev.sh` (after running `npm install` and `npx playwright install --with-deps` in the `autograder/playwright` directory). This will, like the main image, compute the student's score and output the Gradescope-formatted `results.json`, this time to `autograder/process-results/results.json`. Since this runs on your host OS, you can even modify `run-playwright-dev.sh` to pop open the Playwright debug UI. This script, like the Docker image, uploads Playwright artifacts (traces) to the artifact server and links them in the grading output.
  - You can think of the contents of the `autograder/` directory as being similar to other [autograder examples provided by Gradescope](https://gradescope-autograders.readthedocs.io/en/latest/python/), in that they wrap a unit testing framework with some logic to compute scores for submissions and output a `results.json` file. The top-level directory of the repository is one level higher, allowing you to run the grading Docker image for testing without using Gradescope's infrastructure.
- run just the Playwright tests, without post-processing the output for grading, inside the `autograder/playwright` directory (using `npm install && npx playwright test`). This is probably what we want to share with students, because we don't need their local runs to upload traces to the artifact server (and would prefer not to share the upload server API key so directly, though it ends up being public in our Docker image anyway).

Directory structure:

```
- autograder/ - this is the content of the Docker image that gets uploaded to Gradescope. find the Dockerfile within
  - Dockerfile
  - run_autograder         - this is the script that the Gradescope harness runs inside the Docker container to run the autograder. You shouldn't run this manually on the host machine, since it's writing to the wrong paths.
  - run-playwright-dev.sh  - this runs the Playwright tests locally on your host machine, using relative paths instead of the paths used in run_autograder. I think you need to run this from the autograder directory.
  - autograder-config.example.sh - this is a template for the environment variables needed to upload artifacts to the artifact server and build the Docker image
  - autograder-config.sh   - this is .gitignored, and should be copied from the example and filled in with the correct values before building the Docker image
  - upload-report.sh       - this script uploads the Playwright trace zip to the artifact server
  - process-results/
    - process-results.js   - this script reads the Playwright JSON report and computes autograder test results using specially-named "points" annotations on the tests
  - playwright/            - this is where the Playwright install lives.
    - playwright.config.ts - this contains a lot of specific configuration for Playwright, like test timeouts, what browsers to run, etc. You might want to make changes here depending on the nature of the tests you're writing, but you should keep things like the output directories constant.
    - tests                - the tests themselves, each ending in `.spec.ts` or `.spec.js`. Screenshot tests also have their screenshots saved here automatically by Playwright.
    - outputs              - this is where the Playwright traces are saved
- harness/ - this mimics the harness that exists in Gradescope's base Docker image; it can be used to run the autograder locally the same way Gradescope does.
  - harness.py         - largely cloned from Gradescope's Docker image, with some slight changes
  - update_harness.py  - an empty no-op file to make sure harness.py doesn't get overwritten by the update script in the base image
  - run.sh             - a bash script that builds the autograder Docker image and
- autograder-results/  - this is mounted by the above run.sh to the /autograder/results directory in the container, which is where the Dockerized autograder writes its output
  - results.json
  - stdout
```

## Static server

The autograder assumes it's being used to grade a static website. It uses `python3 -m http.server` to host a static server on port `6160` (which need not be available on the host machine if running in Docker, but otherwise should be free), then directs Playwright (through `playwright.config.ts`) to visit `http://localhost:6160` to run the tests.

If you want to test students' server code, you'll want to add some logic into `run_autograder` (and possibly `run-playwright-dev.sh`) to start the server in the background before running the tests (you'll probably also want to make sure the server is stopped when the tests are done, at least in the script that runs on the host machine. The Docker version doesn't care.). Configure `playwright.config.ts` to visit the correct URL.

## Artifact server

The **artifact server** is a super simple pair of Docker images that run a server accepting .zip file uploads and serve them back up as HTML. We use this to link students to an interactive trace from Playwright. Host this on an isolated domain, since it's serving static HTML straight from the uploaded zip files. Code for that server is in another repository.

## To make an autograder

Add and edit `.spec.ts` (or `.spec.js` files, I won't judge) files in `autograder/playwright/tests`.

Add `points` annotations to the tests you want to grade. These will be grabbed by the post-processing script to assign point values to each test. Right now, this will only work for top-level tests (not those inside a `describe` block).

```ts
test(
  "The page has the correct title",
  {
    annotation: {
      type: "points",
      description: "1",
    },
  },
  async ({ page }) => {
    await page.goto("/");

    expect(await page.title()).toBe("Programming assignment");
  }
);
```

Make changes to `playwright.config.ts`, if you need. Consider running tests in parallel by changing `fullyParallel`.

Copy `autograder-config.example.sh` to `autograder-config.sh` and fill in the right values.

Distribute `autograder/playwright` to students so they can run the tests locally (there's really no reason not to -- your tests won't be secret anyway, because Playwright shows the source code in traces). Even tests hidden in `results.json` will be visible in the trace index.

## Building and pushing the Docker image

The image is built every time you run `harness/run.sh`, though of course it's also possible to build manually. We push the image to Docker Hub and use the corresponding image identifier in the Gradescope "Manual Docker Configuration" field.

```sh
source autograder/autograder-config.sh
docker push $AUTOGRADER_IMAGE
```

## Disclaimer

This is not an official release from Gradescope; I developed this for a course after leaving my job at Turnitin.

I'm redistributing `harness.py` here (copied from the publicly-available Docker base image) because I don't think anyone over there would mind, but really most of it doesn't need to be in this repo; all that matters is that it runs the `run_autograder` script correctly. Still, I'll avoid slapping a LICENSE onto this repo. If you want to use anything in here, uhh, go for it, there, that's the license.
