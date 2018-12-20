
## Install
`npm install --save scilla-data-parser`

## Usage
```js
const ScillaDataParser = require('scilla-data-parser').ScillaDataParser

var scillaJson = JSON.parse(`
  {
    "vname": "map2",
    "type": "Map (String) (Pair (String) (Uint32))",
    "value": [
      {
        "key": "m",
        "val": {
          "constructor": "Pair",
          "argtypes": [ "String", "Uint32" ],
          "arguments": [ "k", "1" ]
        }
      }
    ]
  }
`);

var simpleJson = ScillaDataParser.convertToSimpleJson(input, false);
//{ map2: { m: { x: 'k', y: 1 } } }

var straightJson = ScillaDataParser.convertToSimpleJson(input, true);
//{ vname: 'map2',
//  type: 'Map (String) (Pair (String) (Uint32))',
//  value: { m: { x: 'k', y: 1 } } }


var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
//Same as scillaJson

```