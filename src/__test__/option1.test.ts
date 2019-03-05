import { ScillaDataParser } from '../parser';

var scillaJson = JSON.parse(`
  {
    "vname": "challenger",
    "type": "Option (ByStr20)",
    "value": {
      "constructor": "Some",
      "argtypes": [ "ByStr20" ],
      "arguments": [ "0x2b10d79c55f469aad1694d5bd2b2264e2d7b4b2f" ]
    }
  }
`);

test('option1', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});
