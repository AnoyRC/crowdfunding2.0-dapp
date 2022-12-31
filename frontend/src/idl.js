export const idl = {
    "version": "0.1.0",
    "name": "crowdfunding_dapp",
    "instructions": [
      {
        "name": "create",
        "accounts": [
          {
            "name": "campaign",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "maxAmount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "withdraw",
        "accounts": [
          {
            "name": "campaign",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          }
        ],
        "args": []
      },
      {
        "name": "donate",
        "accounts": [
          {
            "name": "campaign",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": [
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      },
      {
        "name": "delete",
        "accounts": [
          {
            "name": "campaign",
            "isMut": true,
            "isSigner": false
          },
          {
            "name": "user",
            "isMut": true,
            "isSigner": true
          },
          {
            "name": "systemProgram",
            "isMut": false,
            "isSigner": false
          }
        ],
        "args": []
      }
    ],
    "accounts": [
      {
        "name": "Campaign",
        "type": {
          "kind": "struct",
          "fields": [
            {
              "name": "admin",
              "type": "publicKey"
            },
            {
              "name": "name",
              "type": "string"
            },
            {
              "name": "description",
              "type": "string"
            },
            {
              "name": "amountDonated",
              "type": "u64"
            },
            {
              "name": "maxAmount",
              "type": "u64"
            },
            {
              "name": "amountLeft",
              "type": "u64"
            },
            {
              "name": "active",
              "type": "bool"
            }
          ]
        }
      }
    ],
    "metadata": {
      "address": "BxYR1cN5vUupgwnxcVyhvWK6CnYmipGUkCvjrEMttjVp"
    }
}