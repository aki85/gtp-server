# gitlev-server

## Front
https://github.com/aki85/gtp-front

## Environment
* nodejs: ^12.x
* yarn: ^1.9

## Installation
yarn

## dev

### dynamodb

yarn run dynamo
yarn run dynamo-win

### create local table

aws dynamodb create-table --cli-input-json file://./migrations/accountsTable.json --endpoint-url http://localhost:8000
aws dynamodb create-table --cli-input-json file://./migrations/githubAnalysesTable.json --endpoint-url http://localhost:8000

### dev server
yarn run dev
