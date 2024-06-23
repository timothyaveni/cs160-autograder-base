FROM gradescope/autograder-base:ubuntu-jammy

WORKDIR /autograder

RUN apt-get update -y
RUN DEBIAN_FRONTEND=noninteractive && apt-get install -y npm jq zip

RUN npm install -g n
RUN n 22.2

RUN mkdir /autograder/playwright
COPY playwright/package.json /autograder/playwright/package.json
COPY playwright/package-lock.json /autograder/playwright/package-lock.json

RUN cd playwright && npm ci && npx playwright install --with-deps

COPY . /autograder
RUN chmod +x /autograder/run_autograder