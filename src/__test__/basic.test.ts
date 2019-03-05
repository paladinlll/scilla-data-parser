import { ScillaDataParser } from '../parser';

//This case used an array as input so we'll use convertToScillaDataList to revert back to list scilla data.
var scillaJson = JSON.parse(`
[
  { "vname": "_balance", "type": "Uint128", "value": "0" },
  { "vname": "turn", "type": "Uint32", "value": "1" },
  {
    "vname": "accepted",
    "type": "Bool",
    "value": { "constructor": "True", "argtypes": [], "arguments": [] }
  },
  { "vname": "welcome_msg", "type": "String", "value": "Hello There" }
]
`);

test('basic', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaDataList(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});
