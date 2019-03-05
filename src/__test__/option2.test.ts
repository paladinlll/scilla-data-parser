import { ScillaDataParser } from '../parser';

var scillaJson = JSON.parse(`
  {
    "vname": "challenger",
    "type": "Option (ByStr20)",
    "value": {
      "constructor": "None",
      "argtypes": [ "ByStr20" ],
      "arguments": [ ]
    }
  }
`);

test('option2', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});
