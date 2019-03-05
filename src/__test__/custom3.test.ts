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

test('custom2', () => {
  expect(function() {
    var simpleJson = ScillaDataParser.convertToSimpleJson(scillaJson, false);
  }).toThrow();
});
