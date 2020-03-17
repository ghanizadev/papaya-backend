# PAPAYA server, management interface

[![Build Status](https://travis-ci.com/ghanizadev/papaya-backend.svg?branch=master)](https://travis-ci.com/ghanizadev/papaya-backend) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=papaya-backend&metric=alert_status)](https://sonarcloud.io/dashboard?id=papaya-backend)

## api/v1/order

### /add

Adds a product to a order

```json
[
    {
        "code": "0000",
        "quantity": 1,
        "additionals": [
            {"CODE": "ADDITIONAL;SPACED;BY;SEMICOLON"}
        ]
    }
]
```
