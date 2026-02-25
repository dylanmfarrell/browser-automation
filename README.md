# Playwright CSV Chatbot Automation

## Setup
1) npm i
2) npm run install:browsers
3) cp .env.example .env
4) set CHATBOT_URL in .env
5) create a CSV with headers: id,prompt

## Run
npm run dev -- --csv data/prompts.sample.csv

## Output
Appends JSON Lines to outputs/results.jsonl