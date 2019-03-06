## Note
* Support convert Custom type data but can't revert back to scilla format (because contract did't accept this type in parameters)
* The BN type was be convert to string (because it was be automatic converted when used in Map key, use same rule for reduce complex)
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

var simpleJson = ScillaDataParser.convertToSimpleJson(scillaJson, false);
//{ map2: { m: { x: 'k', y: 1 } } }

var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
//{ vname: 'map2',
//  type: 'Map (String) (Pair (String) (Uint32))',
//  value: { m: { x: 'k', y: 1 } } }


var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
//Same as scillaJson

```


```js
var scillaCustomJson = JSON.parse(`
{
    "type": "Map (Uint256) (Product)",
    "value": [
      {
        "key": "168430090",
        "val": {
          "argtypes": [],
          "arguments": [
            "168430090",
            "1000000000",
            "100",
            "1000",
            "0",
            "0",
            {
              "argtypes": [],
              "arguments": [],
              "constructor": "False"
            }
          ],
          "constructor": "Product"
        }
      }
    ],
    "vname": "productsMap"
}`);

ScillaDataParser.fetchCustomData('Product', {
	argtypes: [
		{ vname: 'id', type: 'Uint256' },
		{ vname: 'price', type: 'Uint128' },
		{ vname: 'available', type: 'Uint128' },
		{ vname: 'supply', type: 'Uint128' },
		{ vname: 'sold', type: 'Uint128' },
		{ vname: 'interval', type: 'Uint128' },
		{ vname: 'renewable', type: 'Bool' },
	],
});
ScillaDataParser.convertToSimpleJson(scillaCustomJson, true);
//{
//  "vname": "productsMap",
//  "type": "Map (Uint256) (Product)",
//  "value": {
//    "168430090": {
//      "id": "168430090",
//      "price": "1000000000",
//      "available": "100",
//      "supply": "1000",
//      "sold": "0",
//      "interval": "0",
//      "renewable": false
//    }
//}
}
```