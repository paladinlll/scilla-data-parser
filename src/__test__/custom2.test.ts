import { ScillaDataParser } from '../parser';

var scillaJson = JSON.parse(`
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
  }
`);

test('custom1', () => {
  expect(function() {
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
    var simpleJson = ScillaDataParser.convertToSimpleJson(scillaJson, false);
  }).not.toThrow();
});
