const express = require('express');
const app = express();
const projectId = 'proofofconcept-355a8';
const locationId = 'europe-west3';
const keyRingId = 'envelope_encryption';
const keyId = 'key_encryption_key';

// Imports the Cloud KMS library
const {KeyManagementServiceClient} = require('@google-cloud/kms');

// Instantiates a client
const client = new KeyManagementServiceClient();

// Build the key name
const keyName = client.cryptoKeyPath(projectId, locationId, keyRingId, keyId);

async function encryptSymmetric(plainText) {
  const [encryptResponse] = await client.encrypt({
    name: keyName,
    plaintext: Buffer.from(plainText),
  });

  const ciphertext = encryptResponse.ciphertext;
  return ciphertext;
}

async function decryptSymmetric(cipherText) {
  const [result] = await client.decrypt({
    name: keyName,
    ciphertext: cipherText,
  });

  const plaintext = result.plaintext.toString('utf8');
  return plaintext;
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post('/encrypt', (req, res, next) => {
  encryptSymmetric(req.body.plainText).then(cipherText => {
    return res.json(cipherText);
  });
});

app.post('/decrypt', (req, res, next) => {
  decryptSymmetric(req.body.cipherText).then(plainText => {
    return res.json(plainText)
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`EncryptDecryptionAPI: listening on port ${port}`);
});
