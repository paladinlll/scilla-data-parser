import { ScillaDataParser } from '../parser';

var scillaJson = JSON.parse(`
{ "vname": "moves", "type": "List (Uint32)", "value": [ "4", "1" ] }
`);

test('list1', () => {
  var straightJson = ScillaDataParser.convertToSimpleJson(scillaJson, true);
  var revertScillaJson = ScillaDataParser.convertToScillaData(straightJson);
  expect(revertScillaJson).toMatchObject(scillaJson);
});
