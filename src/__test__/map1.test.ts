import { ScillaDataParser } from '../parser';

//The expected object is sorted, so the test map input must is in correct order.
var scillaJson = JSON.parse(`
{
  "vname": "board",
  "type": "Map (Uint32) (Uint32)",
  "value": [
    { "key": "0", "val": "0" },
    { "key": "1", "val": "0" },
    { "key": "2", "val": "0" },
    { "key": "3", "val": "0" },
    { "key": "4", "val": "1" },
    { "key": "5", "val": "0" },
    { "key": "6", "val": "0" },
    { "key": "7", "val": "0" },
    { "key": "8", "val": "0" }
  ]
}
`);

test('map1', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});
