
interface ICustomTypeRule {
  argtypes: [any];
}

var customTypeMap = {};

interface INodeType {
  type: string;
  childTypes: INodeType[];
}

function isObject(a: any): boolean {
  return !!a && a.constructor === Object;
}

// Check a object is in scilla data format
function isScillaData(node: any): boolean {
  if (!isObject(node)) return false;
  if ('vname' in node && 'type' in node && 'value' in node) {
    return true;
  }
  return false;
}

//With the type field in scilla object, parse it to a tree.
function parseTypeTree(strType: string): INodeType {
  var typeStack = [];
  var typeCtx = { type: '', childTypes: [] };
  typeStack.push(typeCtx);
  var subType = '';
  var i = 0;
  while (i < strType.length) {
    switch (strType[i]) {
      case '(':
        typeStack.push({ type: '', childTypes: [] });
        if (typeCtx != null) {
          if (typeCtx.type == '') {
            typeCtx.type = subType;
          }
          typeCtx.childTypes.push(typeStack[typeStack.length - 1]);
        }
        subType = '';
        typeCtx = typeStack[typeStack.length - 1];
        break;
      case ')':
        if (typeStack.length == 0) throw new TypeError('JSON Parse: Too many closing brackets');

        typeStack.pop();
        if (subType.length > 0) {
          typeCtx.type = subType;
        }

        subType = '';
        if (typeStack.length > 0) {
          typeCtx = typeStack[typeStack.length - 1];
        }
        break;
      case ' ':
      case '	':
      case '\n':
        break;
      default:
        subType += strType[i];
        break;
    }
    ++i;
  }

  //In case root node has no child the node type is the input string.
  if (typeStack[0].childTypes.length == 0) {
    typeStack[0].type = strType;
  }
  return typeStack[0];
}

//Convert INodeType to string type.
function getTypeString(typeCtx: INodeType): string {
  var ret = typeCtx.type;
  if (typeCtx.childTypes.length == 0) {
    return ret;
  }
  ret += ' ';
  for (let i = 0; i < typeCtx.childTypes.length; i++) {
    ret += '(';
    ret += getTypeString(typeCtx.childTypes[i]);
    ret += ')';
    if (i < typeCtx.childTypes.length - 1) {
      ret += ' ';
    }
  }
  return ret;
}

function toSimpleData(node: any): any {
  var vname = node.vname;
  var type = node.type;
  var value = node.value;
  var ret = {};
  var typeTree = parseTypeTree(type);
  switch (typeTree.type) {
    case 'Bool':
      ret[vname] = value['constructor'].toLowerCase() == 'true';
      break;
    case 'String':
    case 'ByStr20':
      ret[vname] = value;
      break;
    case 'Option':
      if (typeTree.childTypes.length == 1) {
        if (value['constructor'] == 'Some') {
          var op = toSimpleData({
            vname: 'op',
            type: getTypeString(typeTree.childTypes[0]),
            value: value.arguments[0],
          });

          ret[vname] = op.op;
        } else {
          ret[vname] = '';
        }
      } else {
        throw new TypeError('Invalid Option node');
      }
      break;
    case 'Map': {
      ret[vname] = {};

      var childs = value;
      if (Array.isArray(childs) && typeTree.childTypes.length == 2) {
        for (let c of childs) {
          var key = toSimpleData({
            vname: 'key',
            type: getTypeString(typeTree.childTypes[0]),
            value: c.key,
          });

          var val = toSimpleData({
            vname: 'val',
            type: getTypeString(typeTree.childTypes[1]),
            value: c.val,
          });

          ret[vname][key.key] = val.val;
        }
      } else {
        throw new TypeError('Invalid Map node');
      }
      break;
    }
    case 'List':
      ret[vname] = [];
      var childs = value;
      if (Array.isArray(childs) && typeTree.childTypes.length == 1) {
        for (let c of childs) {
          var l = toSimpleData({
            vname: 'l',
            type: getTypeString(typeTree.childTypes[0]),
            value: c,
          });
          ret[vname].push(l.l);
        }
      } else {
        throw new TypeError('Invalid List node');
      }
      break;
    case 'Pair': {
      ret[vname] = {};
      var childs = value.arguments;
      if (Array.isArray(childs) && childs.length == 2 && typeTree.childTypes.length == 2) {
        var x = toSimpleData({
          vname: 'x',
          type: getTypeString(typeTree.childTypes[0]),
          value: childs[0],
        });

        var y = toSimpleData({
          vname: 'y',
          type: getTypeString(typeTree.childTypes[1]),
          value: childs[1],
        });

        ret[vname].x = x.x;
        ret[vname].y = y.y;
      } else {
        throw new TypeError('Invalid Pair node');
      }
      break;
    }
    case 'Uint32':
    case 'Int32':
      ret[vname] = parseInt(value);
      break;
    case 'Uint64':
    case 'Uint128':
    case 'Uint256':
    case 'Int64':
    case 'Int128':
    case 'Int256':
    case 'BNum':
      ret[vname] = value;
      break;
    default:
      if (customTypeMap[typeTree.type] != null) {
        ret[vname] = {};

        var rule: ICustomTypeRule = customTypeMap[typeTree.type];
        var childs = value.arguments;
        if (Array.isArray(childs) && childs.length == rule.argtypes.length) {
          for (let k = 0; k < rule.argtypes.length; k++) {
            var rname = rule.argtypes[k]['vname'];
            var rtype = rule.argtypes[k]['type'];
            ret[vname][rname] = toSimpleData({
              vname: rname,
              type: rtype,
              value: childs[k],
            })[rname];
          }
        } else {
          throw new TypeError('Invalid Custom node');
        }
      } else {
        throw new TypeError('Unhandle type ' + typeTree.type);
      }
      break;
  }
  return ret;
}

function toStraightData(node: any): any {
  var vname = node.vname;
  var type = node.type;
  var value = node.value;
  var ret = {
    vname: node.vname,
    type: node.type,
    value: null,
  };
  var typeTree = parseTypeTree(type);
  switch (typeTree.type) {
    case 'Bool':
      ret.value = value['constructor'].toLowerCase() == 'true';
      break;
    case 'String':
    case 'ByStr20':
      ret.value = value;
      break;
    case 'Option':
      if (typeTree.childTypes.length == 1) {
        if (value['constructor'] == 'Some') {
          var op = toStraightData({
            vname: 'op',
            type: getTypeString(typeTree.childTypes[0]),
            value: value.arguments[0],
          });

          ret.value = op.value;
        } else {
          ret.value = '';
        }
      } else {
        throw new TypeError('Invalid Option node');
      }
      break;
    case 'Map': {
      ret.value = {};

      var childs = value;
      if (Array.isArray(childs) && typeTree.childTypes.length == 2) {
        for (let c of childs) {
          var key = toStraightData({
            vname: 'key',
            type: getTypeString(typeTree.childTypes[0]),
            value: c.key,
          });

          var val = toStraightData({
            vname: 'val',
            type: getTypeString(typeTree.childTypes[1]),
            value: c.val,
          });

          ret.value[key.value] = val.value;
        }
      } else {
        throw new TypeError('Invalid Map node');
      }
      break;
    }
    case 'List':
      ret.value = [];
      var childs = value;
      if (Array.isArray(childs) && typeTree.childTypes.length == 1) {
        for (let c of childs) {
          var l = toStraightData({
            vname: 'l',
            type: getTypeString(typeTree.childTypes[0]),
            value: c,
          });
          ret.value.push(l.value);
        }
      } else {
        throw new TypeError('Invalid List node');
      }
      break;
    case 'Pair': {
      ret.value = {};
      var childs = value.arguments;
      if (Array.isArray(childs) && childs.length == 2 && typeTree.childTypes.length == 2) {
        var x = toStraightData({
          vname: 'x',
          type: getTypeString(typeTree.childTypes[0]),
          value: childs[0],
        });

        var y = toStraightData({
          vname: 'y',
          type: getTypeString(typeTree.childTypes[1]),
          value: childs[1],
        });

        ret.value.x = x.value;
        ret.value.y = y.value;
      } else {
        throw new TypeError('Invalid Pair node');
      }
      break;
    }
    case 'Uint32':
    case 'Int32':
      ret.value = parseInt(value);
      break;
    case 'Uint64':
    case 'Uint128':
    case 'Uint256':
    case 'Int64':
    case 'Int128':
    case 'Int256':
    case 'BNum':
      ret.value = value;
      break;
    default:
      if (customTypeMap[typeTree.type] != null) {
        ret.value = {};

        var rule: ICustomTypeRule = customTypeMap[typeTree.type];
        var childs = value.arguments;
        if (Array.isArray(childs) && childs.length == rule.argtypes.length) {
          for (let k = 0; k < rule.argtypes.length; k++) {
            var rname = rule.argtypes[k]['vname'];
            var rtype = rule.argtypes[k]['type'];
            ret.value[rname] = toStraightData({
              vname: rname,
              type: rtype,
              value: childs[k],
            }).value;
          }
        } else {
          throw new TypeError('Invalid Custom node');
        }
      } else {
        throw new TypeError('Unhandle type ' + typeTree.type);
      }
      break;
  }
  return ret;
}

//New node with same type.
function getEmptyData(node: any): any {
  if (isObject(node)) {
    return {};
  } else if (Array.isArray(node)) {
    return [];
  }
  return '';
}

//With each node is in scilla format, convert it to simple format.
//The bStraight flag mean keep the sciila format in root node. It still have enough info to convert back to scilla format.
function convertToSimpleJson(input: any, bStraight: boolean = false): any {
  var stackIns = [];
  var stackParents = [];
  var stackOuts = [];

  stackIns.push(input);
  stackParents.push(-1);
  stackOuts.push(getEmptyData(input));

  var k = 0;
  while (k < stackIns.length) {
    var curIn = stackIns[k];

    if (isScillaData(curIn)) {
      stackOuts[k] = bStraight ? toStraightData(curIn) : toSimpleData(curIn);
    } else if (isObject(curIn)) {
      for (let p of Object.keys(curIn)) {
        var c = curIn[p];
        stackIns.push(c);

        stackOuts[k][p] = stackOuts.length; //index to out node.
        var emptyData = getEmptyData(c);
        stackOuts.push(emptyData);

        stackParents.push(k);
      }
    } else if (Array.isArray(curIn)) {
      for (let p of curIn) {
        stackIns.push(p);

        var emptyData = getEmptyData(p);
        stackOuts.push(emptyData);
        stackParents.push(k);
      }
    } else {
      stackOuts[k] = JSON.parse(JSON.stringify(curIn));
    }

    k++;
  }

  k = stackIns.length - 1;
  while (k >= 0) {
    var curIn = stackIns[k];

    if (isScillaData(curIn)) {
    } else if (isObject(curIn)) {
      for (let p of Object.keys(curIn)) {
        stackOuts[k][p] = stackOuts[stackOuts[k][p]];
      }
    } else if (Array.isArray(curIn)) {
      var mappable = {};

      for (let i = 0; i < stackIns.length; i++) {
        if (stackParents[i] == k) {
          stackOuts[k].push(stackOuts[i]);

          if (mappable != null) {
            var size = 0,
              vname;
            for (vname in stackOuts[i]) {
              mappable[vname] = stackOuts[i][vname];
              size++;
            }
            if (size != 1) {
              mappable = null;
            }
          }
        }
      }
      if (mappable != null) {
        stackOuts[k] = mappable;
      }
    } else {
    }

    k--;
  }

  return stackOuts[0];
}

function isFloat(n) {
  return n === +n && n !== (n | 0);
}

function isInteger(n) {
  return n === +n && n === (n | 0);
}

function toScillaBool(value: any): string {
  var ret = false;

  if (typeof value === 'boolean') {
    ret = value;
  } else if (typeof value === 'string') {
    ret = value.toLowerCase() == 'true';
  } else if (isInteger(value)) {
    ret = parseInt(value) != 0;
  } else {
    ret = false;
  }

  return ret ? 'True' : 'False';
}

function convertToScillaData(node: any): any {
  var vname = node.vname;
  var type = node.type;
  var value = node.value;
  var ret = {
    vname: vname,
    type: type,
    value: null,
  };
  var typeTree = parseTypeTree(type);
  switch (typeTree.type) {
    case 'Bool':
      ret.value = { constructor: toScillaBool(value), argtypes: [], arguments: [] };
      break;
    case 'String':
    case 'ByStr20':
      ret.value = value;
      break;
    case 'Option':
      ret.value = {};
      if (typeTree.childTypes.length == 1) {
        if (value != null && value != '') {
          var op = convertToScillaData({
            vname: 'op',
            type: getTypeString(typeTree.childTypes[0]),
            value: value,
          });

          ret.value['constructor'] = 'Some';
          ret.value['argtypes'] = [op.type];
          ret.value['arguments'] = [op.value];
        } else {
          ret.value['constructor'] = 'None';
          ret.value['argtypes'] = [getTypeString(typeTree.childTypes[0])];
          ret.value['arguments'] = [];
        }
      } else {
        throw new TypeError('Invalid Option node');
      }
      break;
    case 'Map': {
      ret.value = [];

      var childs = value;
      if (isObject(childs) && typeTree.childTypes.length == 2) {
        for (let c of Object.keys(childs)) {
          var key = convertToScillaData({
            vname: 'key',
            type: getTypeString(typeTree.childTypes[0]),
            value: c,
          });

          var val = convertToScillaData({
            vname: 'val',
            type: getTypeString(typeTree.childTypes[1]),
            value: childs[c],
          });

          ret.value.push({
            key: key.value,
            val: val.value,
          });
        }
      } else {
        throw new TypeError('Invalid Map node');
      }
      break;
    }
    case 'List': {
      ret.value = [];
      var childs = value;
      if (Array.isArray(childs) && typeTree.childTypes.length == 1) {
        for (let c of childs) {
          var l = convertToScillaData({
            vname: 'l',
            type: getTypeString(typeTree.childTypes[0]),
            value: c,
          });
          ret.value.push(l.value);
        }
      } else {
        throw new TypeError('Invalid List node');
      }
      break;
    }
    case 'Pair': {
      ret.value = {};
      var childs = value;
      if (isObject(childs) && typeTree.childTypes.length == 2) {
        var x = convertToScillaData({
          vname: 'x',
          type: getTypeString(typeTree.childTypes[0]),
          value: childs.x,
        });

        var y = convertToScillaData({
          vname: 'y',
          type: getTypeString(typeTree.childTypes[1]),
          value: childs.y,
        });

        ret.value['constructor'] = 'Pair';
        ret.value['argtypes'] = [x.type, y.type];
        ret.value['arguments'] = [x.value, y.value];
      } else {
        throw new TypeError('Invalid Pair node');
      }
      break;
    }
    case 'Uint32':
    case 'Int32':
      ret.value = value.toString();
      break;
    case 'Uint64':
    case 'Uint128':
    case 'Uint256':
    case 'Int64':
    case 'Int128':
    case 'Int256':
    case 'BNum':
      ret.value = value.toString();
      break;
    default:
      throw new TypeError('Unhandle type ' + typeTree.type);
      break;
  }
  return ret;
}

function convertToScillaDataList(input: any): any {
  var ret = [];

  if (Array.isArray(input)) {
    for (let p of input) {
      if (isScillaData(p)) {
        ret.push(convertToScillaData(p));
      } else {
        throw new TypeError('Invalid scilla node');
      }
    }
  }

  return ret;
}

function fetchCustomData(name, rule): any {
  customTypeMap[name] = rule;
}

export const ScillaDataParser = {
  convertToSimpleJson,
  convertToScillaData,
  convertToScillaDataList,
  fetchCustomData,
};
