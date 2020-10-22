# nestjs-graphql-template

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

aws dynamodb create-table --cli-input-json file://./migrations/todoTable.json --endpoint-url http://localhost:8000


### dev server
yarn run dev
