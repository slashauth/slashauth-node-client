# /Auth Node Client

/auth is the easiest way to provide login and token gating to your web3 enabled app!

This package provides a client to Slashauth to use from your node backend. Authorize any wallet within your app with a single API call.

## Features

- 🔥 Login and token gating out of the box
- 🔑 Security for your app and your clients
- 💨 Fast and lightweight
- ❤️ Helpful and friendly community

## Installation

Install slashauth node client using NPM:

`npm i --save @slashauth/node-client`

Or Yarn

`yarn add @slashauth/node-client`

## Initial steps

In order to use Slashauth you must first create a Slashauth app. Create one [here](https://app.slashauth.xyz). Take note of your client ID and client secret because you'll need these in the next step.

## Usage

Instantiate the Slashauth Client in your app using your client ID and client secret above:

```ts
const slashauthClient = new SlashauthClient(<your client id>, <your client secret>);
```

Use the client to authorize whether a wallet has a specified role:

```ts
slashauthClient
  .hasRole({
    address: '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    role: 'admin',
  })
  .then((response) => console.log('has role? ', r.result.hasRole))
  .catch((e) => console.error(e));
```
