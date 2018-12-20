import {ScillaDataParser} from '../parser';

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

test('map2', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});