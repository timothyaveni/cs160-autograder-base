import fs from "fs";
import path from "path";

const scriptDir = process.cwd();
const resultsFile = await fs.promises.readFile(
  path.join(scriptDir, "../playwright/outputs/json-results/results.json"),
  "utf-8"
);
const inputResults = JSON.parse(resultsFile);

const reportDataFile = await fs.promises.readFile(
  path.join(scriptDir, "../report-data.json"),
  "utf-8"
);
const reportData = JSON.parse(reportDataFile);
const reportBaseUrl = reportData.host + reportData.url;

// type TextFormat = "text" | "html" | "simple_format" | "md" | "ansi";
// type Visibility = "hidden" | "after_due_date" | "after_published" | "visible";

// type Test = {
//   score?: number, // required if not on top level submission
//   max_score?: number,
//   status?: "passed" | "failed", // optional (otherwise inferred from score)
//   name?: string,
//   name_format?: TextFormat, // optional formatting for the test case name
//   number?: string, // like "1.1". will just be numbered in order of array if no number given
//   output?: string,
//   output_format?: TextFormat,
//   tags?: string[],
//   visibility?: Visibility, // overrides top-level visibility
//   extra_data?: Record<string, any>,
// };

// type Leaderboard = {
//   name: string,
//   value: number | string,
//   order?: "asc" | "desc", // default is "desc"
// }[];

// type Results = {
//   score?: number, // optional, but required if not on each test case below. Overrides total of tests if specified.
//   execution_time?: number, // optional, seconds
//   output?: string, // Text relevant to the entire submission, optional
//   output_format?: TextFormat, // https://gradescope-autograders.readthedocs.io/en/latest/specs/#output-string-formatting
//   test_output_format?: TextFormat,
//   test_name_format?: TextFormat,
//   visibility?: Visibility,
//   stdout_visibility?: Visibility,
//   extra_data?: Record<string, any>, // Optional extra data to be stored
//   tests?: Test[], // Optional, but required if no top-level score
//   leaderboard?: Leaderboard[], // Optional, will set up leaderboards for these values
// };

const tests = [];

for (const suite of inputResults.suites) {
  for (const spec of suite.specs) {
    for (const test of spec.tests) {
      // idk when there are multiple tests in one spec. not based on browser
      if (test.status === "skipped") {
        continue;
      }

      // console.log(test.results[0].attachments);
      const pointsAnnotation = test.annotations.find(
        (a) => a.type === "points"
      );
      const visibilityAnnotation = test.annotations.find(
        (a) => a.type === "visibility"
      );

      // if (!pointsAnnotation) {
      //   continue;
      // }

      const points = parseFloat(pointsAnnotation.description);
      const earned = test.status === "expected"; // probably test.expectedStatus === 'passed'
      let earnedPoints = earned ? points : 0;

      tests.push({
        score: earnedPoints,
        max_score: points,
        status: earned ? "passed" : "failed",
        name: `${spec.title} :: ${test.projectName}`, // has button :: chromium
        output: `<a href="${reportBaseUrl}#?testId=${spec.id}">See trace for ${spec.title} :: ${test.projectName}</a>`,
        output_format: "html",
        ...(visibilityAnnotation
          ? { visibility: visibilityAnnotation.description }
          : {}),
      });
    }
  }
}

const outputResults = {
  visibility: "visible",
  tests,
};

await fs.promises.writeFile(
  path.join(scriptDir, "./results.json"),
  JSON.stringify(outputResults, null, 2)
);
