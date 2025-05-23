// src/utils/w3up-client.ts
import * as Client from '@web3-storage/w3up-client';

export async function getClient() {
  const client = await Client.create();
  const space = await client.login(); // Prompts for space login via UCAN
  await client.setCurrentSpace(space.did());
  return client;
}
