export const IDL = {
  "version": "0.1.0",
  "name": "pump_fun",
  "instructions": [
    {
      "name": "initMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "updateMainState",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "UpdateMainStateInput"
          }
        }
      ]
    },
    {
      "name": "createPool",
      "accounts": [
        {
          "name": "creator",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "creatorBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "creatorQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "input",
          "type": {
            "defined": "CreatePoolInput"
          }
        }
      ]
    },
    {
      "name": "buy",
      "accounts": [
        {
          "name": "buyer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "buyerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "buyerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
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
      "name": "sell",
      "accounts": [
        {
          "name": "seller",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeRecipient",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "feeQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "sellerBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "sellerQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
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
      "name": "withdraw",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mainState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "poolState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "baseMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "quoteMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "reserverQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminBaseAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "adminQuoteAta",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
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
      "name": "MainState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "initialized",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "totalTokenSupply",
            "type": "u64"
          },
          {
            "name": "initVirtBaseReserves",
            "type": "u64"
          },
          {
            "name": "initRealBaseReserves",
            "type": "u64"
          },
          {
            "name": "initVirtQuoteReserves",
            "type": "u64"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "devMaxBuy",
            "type": "u64"
          },
          {
            "name": "userMaxBuy",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "PoolState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "konst",
            "type": "u128"
          },
          {
            "name": "baseMint",
            "type": "publicKey"
          },
          {
            "name": "virtBaseReserves",
            "type": "u64"
          },
          {
            "name": "realBaseReserves",
            "type": "u64"
          },
          {
            "name": "quoteMint",
            "type": "publicKey"
          },
          {
            "name": "virtQuoteReserves",
            "type": "u64"
          },
          {
            "name": "realQuoteReserves",
            "type": "u64"
          },
          {
            "name": "complete",
            "type": "bool"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "UpdateMainStateInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "feeRecipient",
            "type": "publicKey"
          },
          {
            "name": "tradingFee",
            "type": "u64"
          },
          {
            "name": "devMaxBuy",
            "type": "u64"
          },
          {
            "name": "userMaxBuy",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "CreatePoolInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "baseAmount",
            "type": "u64"
          },
          {
            "name": "quoteAmount",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateEvent",
      "fields": [
        {
          "name": "creator",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "quoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "TradeEvent",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "solAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "tokenAmount",
          "type": "u64",
          "index": false
        },
        {
          "name": "baseReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "quoteReserves",
          "type": "u64",
          "index": false
        },
        {
          "name": "isBuy",
          "type": "bool",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "CompleteEvent",
      "fields": [
        {
          "name": "user",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "baseMint",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "Uninitialized",
      "msg": "Uninitialized"
    },
    {
      "code": 6001,
      "name": "AlreadyInitialized",
      "msg": "AlreadyInitialized"
    },
    {
      "code": 6002,
      "name": "Unauthorised",
      "msg": "Unauthorised"
    },
    {
      "code": 6003,
      "name": "InsufficientFund",
      "msg": "Insufficient fund"
    },
    {
      "code": 6004,
      "name": "UnknownToken",
      "msg": "One token should be Sol"
    },
    {
      "code": 6005,
      "name": "ExceededMaxBuy",
      "msg": "Exceeded maximum buy amount"
    },
    {
      "code": 6006,
      "name": "BondingCurveIncomplete",
      "msg": "BondingCurve incomplete"
    },
    {
      "code": 6007,
      "name": "BondingCurveComplete",
      "msg": "BondingCurve complete"
    }
  ]
};